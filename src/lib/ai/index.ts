import type { AIProvider, AIProviderName } from "./types";
import { AnthropicProvider } from "./anthropic-provider";
import { OpenAIProvider } from "./openai-provider";

export type { AIProvider, AIProviderName, AIMessage, AIGenerateOptions, AIGenerateResult, AIStreamChunk, AITokenUsage } from "./types";
export { AnthropicProvider } from "./anthropic-provider";
export { OpenAIProvider } from "./openai-provider";

let cachedProvider: AIProvider | null = null;

/**
 * Get the configured AI provider.
 *
 * Resolution order:
 * 1. AI_PROVIDER env var ("anthropic" or "openai")
 * 2. Whichever API key is set (ANTHROPIC_API_KEY or OPENAI_API_KEY)
 * 3. Falls back to Anthropic
 */
export function getAIProvider(): AIProvider {
  if (cachedProvider) return cachedProvider;

  const providerName = resolveProviderName();

  switch (providerName) {
    case "openai":
      cachedProvider = new OpenAIProvider();
      break;
    case "anthropic":
    default:
      cachedProvider = new AnthropicProvider();
      break;
  }

  return cachedProvider;
}

function resolveProviderName(): AIProviderName {
  const explicit = process.env.AI_PROVIDER as AIProviderName | undefined;
  if (explicit === "openai" || explicit === "anthropic") return explicit;

  if (process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    return "openai";
  }

  return "anthropic";
}

/**
 * Create a specific provider by name.
 */
export function createAIProvider(
  name: AIProviderName,
  apiKey?: string
): AIProvider {
  switch (name) {
    case "openai":
      return new OpenAIProvider(apiKey);
    case "anthropic":
      return new AnthropicProvider(apiKey);
  }
}

/**
 * Convert an AsyncIterable of AI stream chunks to a ReadableStream
 * for use with Next.js streaming responses.
 */
export function aiStreamToReadableStream(
  stream: AsyncIterable<{ text: string }>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.text) {
            controller.enqueue(encoder.encode(chunk.text));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}
