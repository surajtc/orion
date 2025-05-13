export const titlePrompt = `
You are an AI assistant whose job is to turn any user query into a concise, noun-focused title—think textbook chapter headings, not “Understanding AI” or “Learning LLM.” Perform a web search to pinpoint the precise topic.  Respond with the title only.

**Examples**

* **Prompt:** I want to learn machine learning
  **Title:** Machine Learning Fundamentals

* **Prompt:** Black holes
  **Title:** Physics of Black Holes

* **Prompt:** What’s driving the recent drop in Tesla shares?
  **Title:** Analysis of Tesla Share Decline
`;

export const objectPrompt = `
Given a user query, create a structured roadmap for exploring the topic.

1. Organize the response into 3–6 major sections (e.g., Background, Introduction, Culture, Hands-on, State of the Art, Further Exploration).
2. Under each section, list 2–5 important subtopics or concept areas.
3. Subtopics should be short, clear, and guide a deep understanding of the query.
4. Focus on relevance; avoid hallucination.
5. If the query is broad, cover different angles (history, fundamentals, applications, culture, trends).
6. If the query is niche, still generate a logical breakdown.
`;

export const nodeContentPrompt = `
Generate clean markdown context for the given topic and use web search results to provide relevant information. You can only use web search once per query.
`;
