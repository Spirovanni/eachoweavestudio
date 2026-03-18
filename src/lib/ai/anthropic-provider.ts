import Anthropic from "@anthropic-ai/sdk";
import type {
  AIProvider,
  AIGenerateOptions,
  AIGenerateResult,
  AIStreamChunk,
} from "./types";

const DEFAULT_MODEL = "claude-sonnet-4-5-20250929";
const DEFAULT_MAX_TOKENS = 4096;

export class AnthropicProvider implements AIProvider {
  readonly name = "anthropic" as const;
  private client: Anthropic;

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
  }

  async generate(options: AIGenerateOptions): Promise<AIGenerateResult> {
    const response = await this.client.messages.create({
      model: options.model || DEFAULT_MODEL,
      max_tokens: options.maxTokens || DEFAULT_MAX_TOKENS,
      temperature: options.temperature,
      system: options.system,
      messages: options.messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
    });

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");

    return {
      text,
      model: response.model,
      finishReason: response.stop_reason,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens:
          response.usage.input_tokens + response.usage.output_tokens,
      },
    };
  }

  async *stream(options: AIGenerateOptions): AsyncIterable<AIStreamChunk> {
    const stream = this.client.messages.stream({
      model: options.model || DEFAULT_MODEL,
      max_tokens: options.maxTokens || DEFAULT_MAX_TOKENS,
      temperature: options.temperature,
      system: options.system,
      messages: options.messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield { text: event.delta.text };
      }
    }

    // Emit final chunk with usage
    const finalMessage = await stream.finalMessage();
    yield {
      text: "",
      finishReason: finalMessage.stop_reason,
      usage: {
        promptTokens: finalMessage.usage.input_tokens,
        completionTokens: finalMessage.usage.output_tokens,
        totalTokens:
          finalMessage.usage.input_tokens + finalMessage.usage.output_tokens,
      },
    };
  }
}
