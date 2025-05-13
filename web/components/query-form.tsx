"use client";

import { useState, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import type { ContentChild, ContentSource } from "@/lib/db/types";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";
import { MagnifyingGlass, CircleNotch } from "@phosphor-icons/react/dist/ssr";

export function QueryForm() {
  const { append, messages, isLoading, setMessages, data, error } = useChat({
    api: "/api/gen/root",
  });

  const [query, setQuery] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setMessages([]);
    await append({ role: "user", content: trimmed });
    setQuery("");
  };

  const { assistantMessage, toolCall } = useMemo(() => {
    let assistantMessage = null;
    let toolCall = null;

    if (messages?.length) {
      for (let i = messages.length - 1; i >= 0; i--) {
        const msg = messages[i];
        if (msg.role !== "assistant" || !msg.parts) continue;

        if (!assistantMessage && msg.parts.some((p) => p.type === "text")) {
          assistantMessage = msg;
        }

        if (!toolCall) {
          const part = msg.parts.find((p) => p.type === "tool-invocation");
          if (part?.toolInvocation) {
            toolCall = part.toolInvocation;
          }
        }

        if (assistantMessage && toolCall) break;
      }
    }

    return { assistantMessage, toolCall };
  }, [messages]);

  const contentData = Array.isArray(data) ? (data as ContentChild[]) : [];

  const shouldShowOutput =
    isLoading || assistantMessage || toolCall || contentData.length > 0;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex">
        <Input
          type="text"
          placeholder="Enter your query..."
          className="text-sm rounded-none border-r-transparent focus-visible:border-primary focus-visible:border-r-transparent focus-visible:ring-0 shadow-none resize-none dark:bg-transparent rounded-bl rounded-tl"
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
            ) : assistantMessage ? (
              <p className="text-lg font-semibold tracking-tight">
                {assistantMessage.content}
              </p>
            ) : null}
          </div>

          <div className="space-y-1">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-3 w-42 rounded" />
                <Skeleton className="h-3 w-58 rounded" />
                <Skeleton className="h-3 w-50 rounded" />
              </div>
            ) : contentData.length > 0 ? (
              <ul className="list-disc pl-4 space-y-1">
                {contentData.map((d) => (
                  <li key={d.id} className="text-sm">
                    {d.title}
                  </li>
                ))}
              </ul>
            ) : null}
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
              <>
                <Skeleton className="h-3.5 w-30 rounded" />
                <Skeleton className="h-3.5 w-30 rounded" />
                <Skeleton className="h-3.5 w-30 rounded" />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
