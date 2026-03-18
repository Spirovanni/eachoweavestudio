import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedClient } from "@/lib/api/helpers";
import { getAIProvider, aiStreamToReadableStream } from "@/lib/ai";

const SYSTEM_PROMPT = `You are an expert book architect. Generate a detailed chapter-by-chapter outline.

Return your response as valid JSON with this structure:
{
  "title": "Book title",
  "concept": "One-paragraph concept summary",
  "chapters": [
    {
      "number": 1,
      "title": "Chapter title",
      "summary": "2-3 sentence chapter summary",
      "key_scenes": ["Scene 1", "Scene 2"],
      "characters_present": ["Character 1"],
      "themes_explored": ["Theme 1"],
      "emotional_arc": "The emotional journey in this chapter"
    }
  ],
  "narrative_arc": "Overview of how the story builds across chapters",
  "pacing_notes": "Notes on pacing and structure"
}

Create chapters that build naturally with rising tension and meaningful character development.
Always return valid JSON only — no markdown fences or extra text.`;

/**
 * POST /api/ai/generate/outline
 * Generate a chapter-by-chapter outline.
 * Body: { concept, goals?, chapterCount?, characters?, themes?, project_id?, stream? }
 */
export async function POST(request: NextRequest) {
  const { supabase, user, error } = await getAuthenticatedClient();
  if (error) return error;

  const body = await request.json();
  const { concept, goals, chapterCount, characters, themes, project_id, stream: shouldStream = false } = body;

  if (!concept) {
    return NextResponse.json({ error: "concept is required" }, { status: 400 });
  }

  const parts = [
    `Concept: ${concept}`,
    goals ? `Goals: ${goals}` : null,
    chapterCount ? `Target chapter count: ${chapterCount}` : "Target chapter count: 10-15",
    characters ? `Key characters: ${Array.isArray(characters) ? characters.join(", ") : characters}` : null,
    themes ? `Core themes: ${Array.isArray(themes) ? themes.join(", ") : themes}` : null,
  ].filter(Boolean);

  const userPrompt = `Generate a detailed chapter outline for:\n${parts.join("\n")}`;

  const provider = getAIProvider();
  const startTime = Date.now();
  const messages = [{ role: "user" as const, content: userPrompt }];

  if (shouldStream) {
    const aiStream = provider.stream({ messages, system: SYSTEM_PROMPT, temperature: 0.7, maxTokens: 8192 });
    supabase!.from("ews_ai_generations").insert({
      user_id: user!.id, project_id: project_id || null,
      tool: "outline_generator", prompt: userPrompt,
      context: { concept, goals, chapterCount, characters, themes },
      model: "default", provider: provider.name,
      prompt_tokens: 0, completion_tokens: 0, total_tokens: 0, status: "completed",
    }).then(() => {});

    return new Response(aiStreamToReadableStream(aiStream), {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
    });
  }

  try {
    const result = await provider.generate({ messages, system: SYSTEM_PROMPT, temperature: 0.7, maxTokens: 8192 });
    const durationMs = Date.now() - startTime;

    await supabase!.from("ews_ai_generations").insert({
      user_id: user!.id, project_id: project_id || null,
      tool: "outline_generator", prompt: userPrompt,
      context: { concept, goals, chapterCount, characters, themes },
      result: result.text, model: result.model, provider: provider.name,
      prompt_tokens: result.usage.promptTokens,
      completion_tokens: result.usage.completionTokens,
      total_tokens: result.usage.totalTokens,
      duration_ms: durationMs, status: "completed",
    });

    let parsed;
    try { parsed = JSON.parse(result.text); } catch { parsed = null; }

    return NextResponse.json({
      text: result.text,
      structured: parsed,
      model: result.model,
      usage: result.usage,
      durationMs,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Outline generation failed";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
