import { tool } from "ai";
import { BraveSearchAPI } from "../brave-search";
import { z } from "zod";
import { SourceSchema, type ContentSource } from "../db/types";

if (!process.env.BRAVE_API_KEY) {
  console.error("BRAVE_API_KEY is not set in the environment variables.");
}

const searchAPI = new BraveSearchAPI(process.env.BRAVE_API_KEY || "");

let lastCallTimestamp = 0;
let pendingCall: Promise<any> | null = null;

export const webSearch = tool({
  description: "Search the web for up-to-date information",
  parameters: z.object({
    query: z.string().min(1).max(100).describe("The search query"),
  }),

  execute: async ({ query }, { toolCallId }) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTimestamp;

    if (timeSinceLastCall < 1000) {
      if (pendingCall) {
        return pendingCall;
      }
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 - timeSinceLastCall),
      );
    }

    lastCallTimestamp = Date.now();
    console.log("Web Tool Call", toolCallId);

    pendingCall = searchAPI
      .search(query)
      .then((results) => {
        const validatedResults: ContentSource[] = results
          .map((r) =>
            SourceSchema.safeParse({
              title: r.title,
              description: r.description,
              url: r.url,
              hostname: r.meta_url.hostname,
              favicon: r.meta_url.favicon,
              extraSnippets: r.extra_snippets || [],
            }),
          )
          .filter((result) => result.success)
          .map((result) => result.data);
        return validatedResults;
      })
      .finally(() => {
        pendingCall = null;
      });

    return pendingCall;
  },
});
