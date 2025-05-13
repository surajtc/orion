export interface SearchResult {
  url: string;
  title: string;
  description: string;
  meta_url: {
    hostname: string;
    favicon: string;
  };
  extra_snippets?: string[];
}

interface APIResponse {
  web: {
    results: SearchResult[];
  };
}

export class BraveSearchAPI {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("API key is required for initialization.");
    }
    this.apiKey = apiKey;
  }

  async search(query: string): Promise<SearchResult[]> {
    const endpoint = "https://api.search.brave.com/res/v1/web/search";

    const params = new URLSearchParams({
      q: query,
      count: "6",
      safesearch: "strict",
      search_lang: "en",
      country: "US",
      text_decorations: "false",
      result_filter: "web",
    });

    const headers = new Headers({
      Accept: "application/json",
      "Accept-Encoding": "gzip",
      "X-Subscription-Token": this.apiKey,
    });

    try {
      const response = await fetch(`${endpoint}?${params.toString()}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: APIResponse = await response.json();

      return data.web.results;
    } catch (error) {
      console.error("Error fetching search results:", error);
      throw error;
    }
  }
}
