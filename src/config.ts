import { LLMProvider } from "./types";

export function getApiKey(provider: LLMProvider): string | undefined {
  switch (provider) {
    case LLMProvider.Gemini:
      return process.env.GEMINI_API_KEY;
    case LLMProvider.OpenAI:
      return process.env.OPENAI_API_KEY;
    case LLMProvider.Claude:
      return process.env.ANTHROPIC_API_KEY;
    default:
      console.warn(`API key environment variable not specified for ${provider}`);
      return undefined;
  }
}
