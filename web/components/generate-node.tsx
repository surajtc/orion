"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef } from "react";
import { Markdown } from "./markdown";
import { useRouter } from "next/navigation";

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
  const { messages, append } = useChat({
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

  return messages.map((message) => {
    if (message.role === "assistant") {
      return (
        <div key={message.id} className="max-w-3xl mx-auto p-4 space-y-4">
          {message.parts.map((part, partIndex) =>
            part.type === "text" ? (
              <Markdown
                key={`${message.id}-${partIndex}`}
                markdown={part.text}
              />
            ) : null,
          )}
        </div>
      );
    }
    return null;
  });
}
