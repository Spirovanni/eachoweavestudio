import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedClient } from "@/lib/api/helpers";
import { getAIProvider } from "@/lib/ai";
import { logAIGeneration } from "@/lib/ai/generations";

const SYSTEM_PROMPT = `You are a creative writing prompt generator. Generate compelling, original writing prompts.

Return your response as valid JSON with this structure:
{
  "prompts": [
    {
      "premise": "The core story concept or scenario (1-2 sentences)",
      "character": "Optional character suggestion (name, brief description)",
      "setting": "Optional setting/world description",
      "hooks": ["Hook 1", "Hook 2"]
    }
  ]
}

Each prompt should be:
- Specific enough to spark ideas
- Open-ended enough for creative freedom
- Compelling and emotionally resonant
- Diverse in themes and tones

Always return valid JSON only — no markdown fences or extra text.`;

/**
 * POST /api/ai/generate/prompts
 * Generate creative writing prompts.
 * Body: { genre?, tone?, theme?, count?, project_id? }
 */
export async function POST(request: NextRequest) {
  const { supabase, user, error } = await getAuthenticatedClient();
  if (error) return error;

  const body = await request.json();
  const {
    genre,
    tone,
    theme,
    count = 5,
    project_id,
  } = body;

  // Validate count
  if (typeof count !== "number" || count < 1 || count > 20) {
    return NextResponse.json(
      { error: "count must be between 1 and 20" },
      { status: 400 }
    );
  }

  const parts = [
    `Generate ${count} creative writing prompts.`,
    genre ? `Genre: ${genre}` : null,
    tone ? `Tone: ${tone}` : null,
    theme ? `Theme: ${theme}` : null,
  ].filter(Boolean);

  const userPrompt = parts.join("\n");

  const provider = getAIProvider();
  const startTime = Date.now();
  const messages = [{ role: "user" as const, content: userPrompt }];

  try {
    const result = await provider.generate({
      messages,
      system: SYSTEM_PROMPT,
      temperature: 0.9,
      maxTokens: 4096,
    });

    const durationMs = Date.now() - startTime;

    // Log AI generation if project_id is provided
    if (project_id) {
      await logAIGeneration(supabase!, {
        projectId: project_id,
        toolType: "assist",
        prompt: userPrompt,
        output: result.text,
        metadata: {
          genre,
          tone,
          theme,
          count,
          model: result.model,
          provider: provider.name,
          usage: result.usage,
          durationMs,
        },
        userId: user!.id,
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(result.text);
    } catch {
      parsed = null;
    }

    return NextResponse.json({
      text: result.text,
      prompts: parsed?.prompts || [],
      model: result.model,
      usage: result.usage,
      durationMs,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Prompt generation failed";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
