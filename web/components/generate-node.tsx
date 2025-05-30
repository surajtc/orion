"use client";

import { useChat } from "@ai-sdk/react";
import { Fragment, useEffect, useRef } from "react";
import { Markdown } from "./markdown";
import { useRouter } from "next/navigation";
import {
  MetadataSchema,
  ParsedContentNode,
  SourceSchema,
} from "@/lib/db/types";
import { z } from "zod";

type NodeType = {
  id: string;
  title: string;
  type: "node";
  markdown: string;
  metadata: string;
  sources: string;
  parentPath: string;
  userId: string;
};

export function GenerateNode({
  rootId,
  nodeId,
  titleArray,
}: {
  rootId: string;
  nodeId: string;
  titleArray: string[];
}) {
  const router = useRouter();
  const { messages, append, data } = useChat({
    api: "/api/gen/node",
    body: { rootId, nodeId, titleArray },
    onFinish: () => {
      console.log("Finished Generation");
      router.refresh();
    },
  });

  const calledRef = useRef(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: skip
  useEffect(() => {
    if (!calledRef.current) {
      append({
        role: "user",
        content: titleArray.join("> "),
      });
      calledRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!Array.isArray(data)) return;

    const node = data.find(
      (n): n is NodeType =>
        typeof n === "object" && n !== null && "type" in n && n.type === "node",
    );

    if (!node) return;

    const now = new Date();

    const parsedNode: ParsedContentNode = {
      id: node.id,
      title: node.title,
      type: node.type,
      userId: "",
      path: `${node.parentPath}/${node.id}`,
      markdown: node.markdown,
      metadata: MetadataSchema.parse(JSON.parse(node.metadata)),
      sources: z.array(SourceSchema).parse(JSON.parse(node.sources)),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    try {
      localStorage.setItem(
        `/api/nodes/${node.parentPath}/${node.id}`,
        JSON.stringify(parsedNode),
      );
      console.log("Saved node to localStorage", parsedNode);
    } catch (err) {
      console.warn("Failed to write node to localStorage:", err);
    }
  }, [data]);

  return messages.map((message) => {
    if (message.role === "assistant") {
      return (
        <Fragment key={message.id}>
          {message.parts.map((part, partIndex) =>
            part.type === "text" ? (
              <Markdown
                key={`${message.id}-${partIndex}`}
                markdown={part.text}
              />
            ) : null,
          )}
        </Fragment>
      );
    }
    return null;
  });
}
