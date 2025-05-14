"use client";

import { useState, useMemo, useEffect, Fragment } from "react";
import { useChat } from "@ai-sdk/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  MetadataSchema,
  ParsedContentNodeSchema,
  SourceSchema,
  type ContentChild,
  type ContentSource,
  type ParsedContentNode,
} from "@/lib/db/types";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";
import { MagnifyingGlass, CircleNotch } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { z } from "zod";

type RootNode = {
  id: string;
  title: string;
  type: "root" | "node";
  metadata: string;
  sources: string;
  userId: string;
};

export function QueryForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const { append, messages, isLoading, setMessages, data, error, setData } =
    useChat({ api: "/api/gen/root" });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setData([]);
    setMessages([]);
    await append({ role: "user", content: trimmed });
    setQuery("");
  };

  const assistantMessage = useMemo(() => {
    return messages
      .slice()
      .reverse()
      .find(
        (m) =>
          m.role === "assistant" && m.parts?.some((p) => p.type === "text"),
      );
  }, [messages]);

  const toolCall = useMemo(() => {
    return messages
      .slice()
      .reverse()
      .flatMap((m) => m.parts || [])
      .find((p) => p.type === "tool-invocation")?.toolInvocation;
  }, [messages]);

  const rootNode = useMemo((): RootNode | null => {
    if (!Array.isArray(data)) return null;

    return (
      data.find(
        (n): n is RootNode =>
          typeof n === "object" &&
          n !== null &&
          "type" in n &&
          n.type === "node",
      ) ?? null
    );
  }, [data]);

  const contentData = useMemo((): ContentChild[] => {
    if (!Array.isArray(data)) return [];

    return data.filter(
      (n): n is ContentChild =>
        typeof n === "object" &&
        n !== null &&
        "type" in n &&
        n.type === "group",
    );
  }, [data]);

  const shouldShowOutput =
    isLoading || assistantMessage || toolCall || contentData.length > 0;

  useEffect(() => {
    const annotation = assistantMessage?.annotations?.[0];

    const isNavigationAnnotation =
      annotation &&
      typeof annotation === "object" &&
      "type" in annotation &&
      annotation.type === "navigation" &&
      "payload" in annotation &&
      typeof (annotation as any).payload?.id === "string";

    if (!isNavigationAnnotation) return;

    const { id, childId } = (annotation as any).payload;
    const url = `/n/${id}${childId ? `/${childId}` : ""}`;

    if (rootNode) {
      const now = new Date();
      const parsedNode: ParsedContentNode = {
        id: rootNode.id,
        title: rootNode.title,
        createdAt: now,
        updatedAt: now,
        markdown: null,
        metadata: MetadataSchema.parse(JSON.parse(rootNode.metadata)),
        sources: z.array(SourceSchema).parse(JSON.parse(rootNode.sources)),
        path: rootNode.id,
        type: rootNode.type,
        userId: "",
      };

      console.log("ParsedNode", parsedNode);

      try {
        localStorage.clear();
        localStorage.setItem(
          `/api/nodes/${rootNode.id}`,
          JSON.stringify(parsedNode),
        );
      } catch (err) {
        console.warn("Failed to write to localStorage:", err);
      }
    }

    router.push(url);
  }, [assistantMessage, rootNode, router]);

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex">
        <Input
          type="text"
          placeholder="Enter your query..."
          className="text-sm rounded-none border-r-0 focus-visible:border-primary focus-visible:ring-0 shadow-none resize-none dark:bg-transparent rounded-bl rounded-tl"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={isLoading}
          className="rounded-none rounded-tr rounded-br"
        >
          {isLoading ? (
            <CircleNotch className="animate-spin" />
          ) : (
            <MagnifyingGlass />
          )}
        </Button>
      </form>

      {error && (
        <div className="text-sm text-red-500">Error: {error.message}</div>
      )}

      {shouldShowOutput && (
        <div className="space-y-2 border rounded p-3">
          <div>
            {isLoading ? (
              <Skeleton className="h-4 w-48" />
            ) : (
              assistantMessage?.content && (
                <p className="text-lg font-semibold tracking-tight">
                  {assistantMessage.content}
                </p>
              )
            )}
          </div>

          <div className="space-y-1">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-3 w-42 rounded" />
                <Skeleton className="h-3 w-58 rounded" />
                <Skeleton className="h-3 w-50 rounded" />
              </div>
            ) : (
              contentData
                .filter((d) => d.type === "group")
                .map((d) => (
                  <li key={d.id} className="list-disc list-inside text-sm">
                    {d.title}
                  </li>
                ))
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 items-start pt-3">
            {toolCall?.state === "result" ? (
              (toolCall.result as ContentSource[]).map((r) => (
                <Link
                  key={r.url}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex gap-2 items-center text-xs px-2 py-0.5 bg-muted/50 text-muted-foreground rounded"
                >
                  <img src={r.favicon} alt={r.hostname} className="size-2.5" />
                  <span>{r.hostname}</span>
                </Link>
              ))
            ) : (
              <Fragment>
                <Skeleton className="h-3.5 w-30 rounded" />
                <Skeleton className="h-3.5 w-30 rounded" />
                <Skeleton className="h-3.5 w-30 rounded" />
              </Fragment>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
