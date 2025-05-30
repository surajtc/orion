import { openai } from "@ai-sdk/openai";

if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is not set ");
}

export const models = {
  openai: openai("gpt-4.1-nano"),
};
