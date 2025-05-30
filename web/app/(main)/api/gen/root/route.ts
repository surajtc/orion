import { NextResponse } from "next/server";
import {
  createDataStreamResponse,
  streamObject,
  streamText,
  type UIMessage,
} from "ai";
import { z } from "zod";

import { auth } from "@/app/(auth)/auth";
import { models } from "@/lib/ai/models";
import { objectPrompt, titlePrompt } from "@/lib/ai/prompts";
import { webSearch } from "@/lib/ai/tools";
import { generateSlug } from "@/lib/utils";
import { createContentNode } from "@/lib/db/queries";
import type { ContentChild, ContentSource } from "@/lib/db/types";

const ObjectSchema = z.object({
  title: z.string().describe("Topic Segment"),
  children: z.array(
    z.object({
      title: z.string().describe("Concepts to explore in this topic"),
    }),
  ),
});

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  const userId = session?.user?.id;

  const { messages }: { messages: UIMessage[] } = await req.json();
  const userMessages = messages.filter((m) => m.role === "user");

  if (userMessages.length === 0) {
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
        system: titlePrompt,
        prompt: userMessages.at(-1)?.content ?? "",
        maxSteps: 4,
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
          if (finishReason !== "stop" || !text) return;

          const objects = streamObject({
            model: models.openai,
            output: "array",
            schema: ObjectSchema,
            system: objectPrompt,
            prompt: text,
          });

          const children: ContentChild[] = [];

          for await (const object of objects.elementStream) {
            const validated = ObjectSchema.safeParse(object);
            if (!validated.success) {
              console.warn("Invalid object skipped:", validated.error);
              continue;
            }

            const item = {
              id: generateSlug(validated.data.title),
              title: validated.data.title,
              type: "group",
              children: validated.data.children.map((child) => ({
                id: generateSlug(child.title),
                title: child.title,
                type: "node",
              })),
            };

            children.push(item as ContentChild);

            dataStream.writeData(item);
          }

          const id = generateSlug(text);

          if (userId) {
            try {
              await createContentNode({
                id,
                title: text,
                userId,
                metadata: JSON.stringify({ children }),
                sources: JSON.stringify(sources),
                type: "root",
              });
            } catch (err) {
              console.error("Failed to save content node:", err);
            }
          } else {
            dataStream.writeData({
              id,
              userId: "",
              title: text,
              metadata: JSON.stringify({ children }),
              sources: JSON.stringify(sources),
              type: "root",
            });
          }

          dataStream.writeMessageAnnotation({
            type: "navigation",
            payload: {
              id,
              childId: children[0]?.children?.[0]?.id ?? null,
            },
          });
        },
      });

      result.mergeIntoDataStream(dataStream);
      result.consumeStream();
    },
  });
}
