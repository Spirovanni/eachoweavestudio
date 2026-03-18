import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedClient } from "@/lib/api/helpers";
import { getAIProvider, aiStreamToReadableStream } from "@/lib/ai";

type AssistMode =
  | "grammar"
  | "style"
  | "tone"
  | "rewrite"
  | "expand"
  | "summarize"
  | "continue";

const MODE_PROMPTS: Record<AssistMode, string> = {
  grammar: `You are a precise copy editor. Fix grammar, spelling, and punctuation errors in the text.
Keep the author's voice and style intact. Return only the corrected text — no explanations.`,

  style: `You are a literary style editor. Improve the writing style — make prose more vivid,
eliminate weak verbs, tighten sentences, and enhance readability. Preserve the author's voice
and intent. Return only the improved text — no explanations.`,

  tone: `You are a tone specialist. Adjust the text to match the requested tone while preserving
meaning and key details. If no specific tone is requested, make the writing more engaging.
Return only the adjusted text — no explanations.`,

  rewrite: `You are a creative rewriter. Rewrite the text with fresh phrasing while keeping
the same meaning, key information, and narrative purpose. Return only the rewritten text — no explanations.`,

  expand: `You are a creative writing expander. Expand the text with more detail, description,
dialogue, or internal monologue as appropriate. Add depth without changing the direction or meaning.
Return only the expanded text — no explanations.`,

  summarize: `You are a concise summarizer. Summarize the key points of the text in 2-4 sentences.
Be clear and preserve the most important information. Return only the summary — no explanations.`,

  continue: `You are a creative writing collaborator. Continue writing from where the text leaves off.
Match the existing style, tone, voice, and pacing. Write 1-3 natural paragraphs that flow seamlessly
from the provided text. Return only the continuation — no explanations.`,
};

const VALID_MODES = Object.keys(MODE_PROMPTS) as AssistMode[];

/**
 * POST /api/ai/assist
 * In-editor writing assistant.
 *
 * Body: {
 *   text: string,          — the selected or relevant text
 *   instruction?: string,  — optional user instruction (e.g. "make it more dramatic")
 *   mode: AssistMode,      — the assist mode
 *   context?: {             — optional chapter context for better results
 *     chapterTitle?: string,
 *     chapterSummary?: string,
 *     recentContent?: string,
 *   },
 *   project_id?: string,
 *   stream?: boolean,
 * }
 */
export async function POST(request: NextRequest) {
  const { supabase, user, error } = await getAuthenticatedClient();
  if (error) return error;

  const body = await request.json();
  const {
    text,
    instruction,
    mode,
    context,
    project_id,
    stream: shouldStream = true,
  } = body;

  if (!text || !mode) {
    return NextResponse.json(
      { error: "text and mode are required" },
      { status: 400 }
    );
  }

  if (!VALID_MODES.includes(mode)) {
    return NextResponse.json(
      { error: `Invalid mode. Must be one of: ${VALID_MODES.join(", ")}` },
      { status: 400 }
    );
  }

  // Build system prompt with context
  let systemPrompt = MODE_PROMPTS[mode as AssistMode];

  if (context) {
    const contextParts: string[] = [];
    if (context.chapterTitle)
      contextParts.push(`Chapter: "${context.chapterTitle}"`);
    if (context.chapterSummary)
      contextParts.push(`Summary: ${context.chapterSummary}`);
    if (context.recentContent)
      contextParts.push(
        `Recent content for context:\n---\n${context.recentContent}\n---`
      );

    if (contextParts.length > 0) {
      systemPrompt += `\n\nContext about the work:\n${contextParts.join("\n")}`;
    }
  }

  // Build user message
  let userMessage = text;
  if (instruction) {
    userMessage = `${instruction}\n\nText:\n${text}`;
  }

  const provider = getAIProvider();
  const startTime = Date.now();
  const messages = [{ role: "user" as const, content: userMessage }];

  if (shouldStream) {
    const aiStream = provider.stream({
      messages,
      system: systemPrompt,
      temperature: mode === "grammar" ? 0.2 : 0.7,
    });

    supabase!
      .from("ews_ai_generations")
      .insert({
        user_id: user!.id,
        project_id: project_id || null,
        tool: `assist_${mode}`,
        prompt: userMessage.slice(0, 500),
        context: context || null,
        model: "default",
        provider: provider.name,
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
        status: "completed",
      })
      .then(() => {});

    return new Response(aiStreamToReadableStream(aiStream), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  }

  try {
    const result = await provider.generate({
      messages,
      system: systemPrompt,
      temperature: mode === "grammar" ? 0.2 : 0.7,
    });

    const durationMs = Date.now() - startTime;

    await supabase!.from("ews_ai_generations").insert({
      user_id: user!.id,
      project_id: project_id || null,
      tool: `assist_${mode}`,
      prompt: userMessage.slice(0, 500),
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
      mode,
      model: result.model,
      usage: result.usage,
      durationMs,
    });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Writing assist failed";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
