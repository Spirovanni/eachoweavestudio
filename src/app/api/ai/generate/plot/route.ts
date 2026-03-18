import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedClient } from "@/lib/api/helpers";
import { getAIProvider, aiStreamToReadableStream } from "@/lib/ai";

const SYSTEM_PROMPT = `You are an expert storytelling architect. Generate a detailed plot structure.

Return your response as valid JSON with this structure:
{
  "title": "A compelling working title",
  "logline": "A one-sentence summary of the story",
  "acts": [
    {
      "act": 1,
      "title": "Act title",
      "description": "What happens in this act",
      "key_events": ["Event 1", "Event 2"],
      "turning_point": "The key turning point ending this act"
    }
  ],
  "themes": ["Theme 1", "Theme 2"],
  "conflict": "The central conflict",
  "resolution": "How the story resolves"
}

Be creative, nuanced, and consider the interplay between characters and themes.
Always return valid JSON only — no markdown fences or extra text.`;

/**
 * POST /api/ai/generate/plot
 * Generate a plot structure.
 * Body: { genre, tone, archetypes?, characters?, settings?, project_id?, stream? }
 */
export async function POST(request: NextRequest) {
  const { supabase, user, error } = await getAuthenticatedClient();
  if (error) return error;

  const body = await request.json();
  const { genre, tone, archetypes, characters, settings, project_id, stream: shouldStream = false } = body;

  if (!genre || !tone) {
    return NextResponse.json(
      { error: "genre and tone are required" },
      { status: 400 }
    );
  }

  const parts = [
    `Genre: ${genre}`,
    `Tone: ${tone}`,
    archetypes ? `Archetypes: ${Array.isArray(archetypes) ? archetypes.join(", ") : archetypes}` : null,
    characters ? `Characters: ${Array.isArray(characters) ? characters.join(", ") : characters}` : null,
    settings ? `Settings: ${settings}` : null,
  ].filter(Boolean);

  const userPrompt = `Generate a plot structure for a story with:\n${parts.join("\n")}`;

  const provider = getAIProvider();
  const startTime = Date.now();
  const messages = [{ role: "user" as const, content: userPrompt }];

  if (shouldStream) {
    const aiStream = provider.stream({ messages, system: SYSTEM_PROMPT, temperature: 0.8 });
    supabase!.from("ews_ai_generations").insert({
      user_id: user!.id, project_id: project_id || null,
      tool: "plot_generator", prompt: userPrompt,
      context: { genre, tone, archetypes, characters, settings },
      model: "default", provider: provider.name,
      prompt_tokens: 0, completion_tokens: 0, total_tokens: 0, status: "completed",
    }).then(() => {});

    return new Response(aiStreamToReadableStream(aiStream), {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
    });
  }

  try {
    const result = await provider.generate({ messages, system: SYSTEM_PROMPT, temperature: 0.8 });
    const durationMs = Date.now() - startTime;

    await supabase!.from("ews_ai_generations").insert({
      user_id: user!.id, project_id: project_id || null,
      tool: "plot_generator", prompt: userPrompt,
      context: { genre, tone, archetypes, characters, settings },
      result: result.text, model: result.model, provider: provider.name,
      prompt_tokens: result.usage.promptTokens,
      completion_tokens: result.usage.completionTokens,
      total_tokens: result.usage.totalTokens,
      duration_ms: durationMs, status: "completed",
    });

    // Try to parse as JSON for structured response
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
    const errorMessage = err instanceof Error ? err.message : "Plot generation failed";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
