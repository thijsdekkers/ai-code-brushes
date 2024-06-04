import { OpenRouterResponse, OpenRouterNonStreamingChoice } from "../types/openrouter";
export default class ProviderOpenRouter {
  constructor(private apiKey: string, private modelName: string) {
    this.apiKey = apiKey;
    this.modelName = modelName;
  }
  
  async runPrompt(prompt: string) {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "HTTP-Referer": "https://github.com/thijsdekkers/ai-code-brushes",
        "X-Title": "AI Code Brushes",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": this.modelName,
        "temperature": 0,
        "response_format": { type: 'json_object' },
        "messages": [
          {"role": "user", "content": prompt},
        ],
      })
    });

    const result = await response.json() as OpenRouterResponse;
    const choice = result.choices[0];

    return 'message' in choice ? (choice as OpenRouterNonStreamingChoice).message.content : undefined;
  }
}
