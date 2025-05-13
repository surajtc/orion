import { NextResponse } from "next/server";
import { createDataStreamResponse, streamText, type UIMessage } from "ai";

import { auth } from "@/app/(auth)/auth";
import { models } from "@/lib/ai/models";
import { nodeContentPrompt } from "@/lib/ai/prompts";
import { webSearch } from "@/lib/ai/tools";
import { createOrUpdateContentNode } from "@/lib/db/queries";
import type { ContentSource } from "@/lib/db/types";
import { permanentRedirect, redirect } from "next/navigation";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    messages,
    rootId,
    nodeId,
    titleArray,
  }: {
    messages: UIMessage[];
    rootId: string;
    nodeId: string;
    titleArray: string[];
  } = await req.json();
  const userMessages = messages.filter((m) => m.role === "user");

  if (userMessages.length === 0) {
    console.error("No user messages found");
    return NextResponse.json(
      { error: "Missing user messages" },
      { status: 400 },
    );
  }

  return createDataStreamResponse({
    execute: (dataStream) => {
      let sources: ContentSource[] = [];

      const result = streamText({
        model: models.openai,
        system: nodeContentPrompt,
        prompt: userMessages.at(-1)?.content ?? "",
        maxSteps: 6,
        tools: { webSearch },
        onChunk: (chunk) => {
          if (
            chunk.chunk.type === "tool-result" &&
            chunk.chunk.toolName === "webSearch"
          ) {
            if (Array.isArray(chunk.chunk.result)) {
              sources = chunk.chunk.result as ContentSource[];
            }
          }
        },
        onFinish: async ({ finishReason, text }) => {
          if (finishReason === "stop" && text) {
            try {
              await createOrUpdateContentNode({
                id: nodeId,
                title: titleArray.at(-1) ?? "",
                markdown: text,
                userId,
                sources: JSON.stringify(sources),
                parentPath: rootId,
                metadata: JSON.stringify({ children: [] }),
              });
              console.log("Node created successfully");
            } catch (err) {
              console.error("Failed to create node:", err);
            }
          }
        },
      });

      result.mergeIntoDataStream(dataStream);
      result.consumeStream();
    },
  });
}
