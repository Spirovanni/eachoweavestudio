import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedClient } from "@/lib/api/helpers";
import { getAIProvider, aiStreamToReadableStream } from "@/lib/ai";
import type { AIMessage } from "@/lib/ai";

/**
 * POST /api/ai/generate
 * Generate text with the configured AI provider.
 *
 * Body: {
 *   tool: string,          — tool name for tracking (e.g. "copilot", "story_generator")
 *   prompt: string,        — the user prompt
 *   context?: object,      — additional context (chapter content, project info, etc.)
 *   system?: string,       — system prompt override
 *   messages?: AIMessage[], — full conversation history (overrides prompt if provided)
 *   stream?: boolean,      — whether to stream the response (default: false)
 *   project_id?: string,   — project for tracking
 *   options?: {
 *     maxTokens?: number,
 *     temperature?: number,
 *     model?: string,
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  const { supabase, user, error } = await getAuthenticatedClient();
  if (error) return error;

  const body = await request.json();
  const {
    tool,
    prompt,
    context,
    system,
    messages: rawMessages,
    stream: shouldStream = false,
    project_id,
    options = {},
  } = body;

  if (!tool || (!prompt && !rawMessages?.length)) {
    return NextResponse.json(
      { error: "tool and prompt (or messages) are required" },
      { status: 400 }
    );
  }

  // Build messages array
  const messages: AIMessage[] = rawMessages?.length
    ? rawMessages
    : [{ role: "user" as const, content: prompt }];

  const provider = getAIProvider();
  const startTime = Date.now();

  if (shouldStream) {
    // Streaming response
    const aiStream = provider.stream({
      messages,
      system,
      maxTokens: options.maxTokens,
      temperature: options.temperature,
      model: options.model,
    });

    // Log generation (best-effort, don't block the stream)
    supabase!.from("ews_ai_generations").insert({
      user_id: user!.id,
      project_id: project_id || null,
      tool,
      prompt: prompt || messages[messages.length - 1]?.content || "",
      context: context || null,
      result: null,
      model: options.model || "default",
      provider: provider.name,
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
      duration_ms: null,
      status: "completed",
    }).then(() => {});

    const readableStream = aiStreamToReadableStream(aiStream);

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  }

  // Non-streaming response
  try {
    const result = await provider.generate({
      messages,
      system,
      maxTokens: options.maxTokens,
      temperature: options.temperature,
      model: options.model,
    });

    const durationMs = Date.now() - startTime;

    // Log generation
    await supabase!.from("ews_ai_generations").insert({
      user_id: user!.id,
      project_id: project_id || null,
      tool,
      prompt: prompt || messages[messages.length - 1]?.content || "",
      context: context || null,
      result: result.text,
      model: result.model,
      provider: provider.name,
      prompt_tokens: result.usage.promptTokens,
      completion_tokens: result.usage.completionTokens,
      total_tokens: result.usage.totalTokens,
      duration_ms: durationMs,
      status: "completed",
    });

    return NextResponse.json({
      text: result.text,
      model: result.model,
      usage: result.usage,
      durationMs,
    });
  } catch (err) {
    const durationMs = Date.now() - startTime;
    const errorMessage =
      err instanceof Error ? err.message : "AI generation failed";

    // Log error
    await supabase!
      .from("ews_ai_generations")
      .insert({
        user_id: user!.id,
        project_id: project_id || null,
        tool,
        prompt: prompt || messages[messages.length - 1]?.content || "",
        context: context || null,
        result: null,
        model: options.model || "default",
        provider: provider.name,
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
        duration_ms: durationMs,
        status: "error",
        error_message: errorMessage,
      });

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
