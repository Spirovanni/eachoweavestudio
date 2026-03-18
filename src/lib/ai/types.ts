/** Supported AI provider names */
export type AIProviderName = "anthropic" | "openai";

/** A single message in a conversation */
export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/** Options for a generation request */
export interface AIGenerateOptions {
  /** The messages to generate from */
  messages: AIMessage[];
  /** Maximum tokens to generate */
  maxTokens?: number;
  /** Temperature (0-1) */
  temperature?: number;
  /** System prompt (applied as first message or system parameter) */
  system?: string;
  /** Model override (uses provider default if not set) */
  model?: string;
}

/** Non-streaming generation result */
export interface AIGenerateResult {
  text: string;
  usage: AITokenUsage;
  model: string;
  finishReason: string | null;
}

/** Token usage tracking */
export interface AITokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/** A chunk from a streaming response */
export interface AIStreamChunk {
  text: string;
  /** Only present on the final chunk */
  usage?: AITokenUsage;
  finishReason?: string | null;
}

/** Abstract AI provider interface */
export interface AIProvider {
  /** Provider name */
  readonly name: AIProviderName;

  /** Generate a complete response (non-streaming) */
  generate(options: AIGenerateOptions): Promise<AIGenerateResult>;

  /** Generate a streaming response */
  stream(
    options: AIGenerateOptions
  ): AsyncIterable<AIStreamChunk>;
}
