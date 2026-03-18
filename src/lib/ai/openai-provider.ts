import OpenAI from "openai";
import type {
  AIProvider,
  AIGenerateOptions,
  AIGenerateResult,
  AIStreamChunk,
} from "./types";

const DEFAULT_MODEL = "gpt-4o";
const DEFAULT_MAX_TOKENS = 4096;

export class OpenAIProvider implements AIProvider {
  readonly name = "openai" as const;
  private client: OpenAI;

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  async generate(options: AIGenerateOptions): Promise<AIGenerateResult> {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

    if (options.system) {
      messages.push({ role: "system", content: options.system });
    }

    for (const msg of options.messages) {
      if (msg.role === "system" && options.system) continue;
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }

    const response = await this.client.chat.completions.create({
      model: options.model || DEFAULT_MODEL,
      max_tokens: options.maxTokens || DEFAULT_MAX_TOKENS,
      temperature: options.temperature,
      messages,
    });

    const choice = response.choices[0];

    return {
      text: choice.message.content || "",
      model: response.model,
      finishReason: choice.finish_reason,
      usage: {
        promptTokens: response.usage?.prompt_tokens ?? 0,
        completionTokens: response.usage?.completion_tokens ?? 0,
        totalTokens: response.usage?.total_tokens ?? 0,
      },
    };
  }

  async *stream(options: AIGenerateOptions): AsyncIterable<AIStreamChunk> {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

    if (options.system) {
      messages.push({ role: "system", content: options.system });
    }

    for (const msg of options.messages) {
      if (msg.role === "system" && options.system) continue;
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }

    const stream = await this.client.chat.completions.create({
      model: options.model || DEFAULT_MODEL,
      max_tokens: options.maxTokens || DEFAULT_MAX_TOKENS,
      temperature: options.temperature,
      messages,
      stream: true,
      stream_options: { include_usage: true },
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      const finishReason = chunk.choices[0]?.finish_reason;

      if (delta?.content) {
        yield { text: delta.content };
      }

      if (finishReason) {
        yield {
          text: "",
          finishReason,
          usage: chunk.usage
            ? {
                promptTokens: chunk.usage.prompt_tokens,
                completionTokens: chunk.usage.completion_tokens,
                totalTokens: chunk.usage.total_tokens,
              }
            : undefined,
        };
      }
    }
  }
}
