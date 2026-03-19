/**
 * Pre-defined AI Pipeline Definitions
 *
 * Common multi-step generation workflows for creative writing.
 */

import type { PipelineDefinition, StepInput } from "./pipeline-types";

/**
 * Book Generation Pipeline
 *
 * Multi-step workflow: concept → outline → chapters → refinement
 */
export const BOOK_GENERATION_PIPELINE: PipelineDefinition = {
  id: "book_generation",
  name: "Book Generation",
  description: "Generate a complete book from concept to polished chapters",
  steps: [
    {
      id: "concept",
      name: "Concept Development",
      description: "Develop the core concept, themes, and premise",
      systemPrompt: `You are a creative book concept developer. Create a compelling book concept.

Return valid JSON with this structure:
{
  "title": "Book title",
  "genre": "Primary genre",
  "premise": "2-3 sentence premise",
  "themes": ["Theme 1", "Theme 2"],
  "target_audience": "Description of target readers",
  "unique_angle": "What makes this book special"
}`,
      buildPrompt: (input: StepInput) => {
        return `Develop a book concept with the following direction:\n\n${input.prompt || "Create an original, compelling book concept."}`;
      },
      options: {
        temperature: 0.9,
        maxTokens: 2048,
      },
    },
    {
      id: "outline",
      name: "Story Outline",
      description: "Create detailed chapter-by-chapter outline",
      systemPrompt: `You are an expert story architect. Create a detailed chapter outline.

Return valid JSON with this structure:
{
  "act_structure": "Three-act or other structure used",
  "chapters": [
    {
      "number": 1,
      "title": "Chapter title",
      "summary": "What happens in this chapter",
      "key_scenes": ["Scene 1", "Scene 2"],
      "character_focus": ["Character names"],
      "arc_progression": "How this chapter advances the story"
    }
  ],
  "estimated_word_count": 0
}`,
      buildPrompt: (input: StepInput) => {
        const concept = input.previousOutputs?.[0]?.structured;
        const themes = Array.isArray(concept?.themes) ? concept.themes.join(", ") : "To be determined";
        return `Create a detailed chapter outline for this book:

Title: ${concept?.title || "Untitled"}
Premise: ${concept?.premise || input.prompt}
Genre: ${concept?.genre || "Fiction"}
Themes: ${themes}

Create 10-15 chapters that build a complete, satisfying story arc.`;
      },
      options: {
        temperature: 0.8,
        maxTokens: 4096,
      },
    },
    {
      id: "chapter_expansion",
      name: "Chapter Content Generation",
      description: "Generate detailed content for each chapter",
      systemPrompt: `You are a masterful fiction writer. Write engaging, vivid chapter content.

Return valid JSON with this structure:
{
  "chapters": [
    {
      "number": 1,
      "title": "Chapter title",
      "content": "Full chapter text with proper paragraphs (use \\n\\n for breaks)",
      "word_count": 0,
      "opening_hook": "First sentence or paragraph",
      "closing_hook": "Last sentence or paragraph"
    }
  ]
}

Focus on vivid prose, authentic dialogue, and compelling pacing.`,
      buildPrompt: (input: StepInput) => {
        const concept = input.previousOutputs?.[0]?.structured;
        const outline = input.previousOutputs?.[1]?.structured;
        const chapters = Array.isArray(outline?.chapters) ? outline.chapters.slice(0, 3) : [];

        return `Write full chapter content for this book:

Title: ${concept?.title || "Untitled"}
Premise: ${concept?.premise}
Genre: ${concept?.genre}

Chapter Outline:
${JSON.stringify(chapters, null, 2)}

Write the first 3 chapters with vivid prose, showing character development and advancing the plot.
Each chapter should be approximately 2,000-3,000 words.`;
      },
      options: {
        temperature: 0.9,
        maxTokens: 8192,
      },
    },
    {
      id: "refinement",
      name: "Content Refinement",
      description: "Polish and refine the generated content",
      systemPrompt: `You are an expert editor. Refine and polish the story for publication quality.

Return valid JSON with this structure:
{
  "refined_chapters": [
    {
      "number": 1,
      "title": "Chapter title",
      "content": "Polished chapter text",
      "improvements_made": ["Improvement 1", "Improvement 2"]
    }
  ],
  "overall_notes": "Editorial notes about the refinement"
}

Focus on: clarity, pacing, consistency, voice, and eliminating awkward phrasing.`,
      buildPrompt: (input: StepInput) => {
        const chapters = input.previousOutputs?.[2]?.structured?.chapters || [];

        return `Refine and polish these chapters for publication:

${JSON.stringify(chapters, null, 2)}

Improve clarity, pacing, and prose quality while maintaining the author's voice and story intent.`;
      },
      options: {
        temperature: 0.7,
        maxTokens: 8192,
      },
    },
  ],
  config: {
    saveIntermediateResults: true,
    allowPause: true,
    timeout: 600000, // 10 minutes
  },
};

/**
 * Chapter Expansion Pipeline
 *
 * Takes a brief outline and expands it into full chapter content
 */
export const CHAPTER_EXPANSION_PIPELINE: PipelineDefinition = {
  id: "chapter_expansion",
  name: "Chapter Expansion",
  description: "Expand a chapter outline into full narrative content",
  steps: [
    {
      id: "scene_breakdown",
      name: "Scene Breakdown",
      description: "Break chapter into individual scenes",
      systemPrompt: `You are a story structure expert. Break a chapter into detailed scenes.

Return valid JSON with this structure:
{
  "scenes": [
    {
      "number": 1,
      "description": "What happens in this scene",
      "pov_character": "Character name",
      "setting": "Where this takes place",
      "key_beats": ["Beat 1", "Beat 2"],
      "emotional_arc": "How emotions change in this scene"
    }
  ]
}`,
      buildPrompt: (input: StepInput) => {
        return `Break this chapter outline into detailed scenes:

${input.prompt}

Create 3-5 scenes that fully develop the chapter's narrative arc.`;
      },
      options: {
        temperature: 0.8,
        maxTokens: 2048,
      },
    },
    {
      id: "scene_writing",
      name: "Scene Writing",
      description: "Write full prose for each scene",
      systemPrompt: `You are a fiction writer. Write vivid, engaging scenes.

Return valid JSON with this structure:
{
  "scenes": [
    {
      "number": 1,
      "content": "Full scene prose",
      "word_count": 0
    }
  ]
}`,
      buildPrompt: (input: StepInput) => {
        const sceneBreakdown = input.previousOutputs?.[0]?.structured;

        return `Write full prose for these scenes:

${JSON.stringify(sceneBreakdown?.scenes || [], null, 2)}

Use vivid description, authentic dialogue, and strong pacing. Show, don't tell.`;
      },
      options: {
        temperature: 0.9,
        maxTokens: 6144,
      },
    },
    {
      id: "chapter_assembly",
      name: "Chapter Assembly",
      description: "Combine scenes into cohesive chapter",
      systemPrompt: `You are an editor. Combine scenes into a polished chapter.

Return valid JSON with this structure:
{
  "chapter": {
    "content": "Complete chapter text",
    "word_count": 0,
    "transitions_added": "Description of how scenes were connected"
  }
}`,
      buildPrompt: (input: StepInput) => {
        const scenes = input.previousOutputs?.[1]?.structured?.scenes || [];

        return `Combine these scenes into a cohesive chapter, adding smooth transitions:

${JSON.stringify(scenes, null, 2)}

Ensure natural flow between scenes and maintain narrative momentum.`;
      },
      options: {
        temperature: 0.7,
        maxTokens: 6144,
      },
    },
  ],
  config: {
    saveIntermediateResults: true,
    allowPause: false,
  },
};

/**
 * Story Refinement Pipeline
 *
 * Multi-pass refinement for existing content
 */
export const STORY_REFINEMENT_PIPELINE: PipelineDefinition = {
  id: "story_refinement",
  name: "Story Refinement",
  description: "Multi-pass refinement of existing story content",
  steps: [
    {
      id: "structural_edit",
      name: "Structural Edit",
      description: "Improve story structure and pacing",
      systemPrompt: `You are a structural editor. Analyze and improve story structure.

Return valid JSON with this structure:
{
  "improved_content": "Restructured text",
  "structural_changes": ["Change 1", "Change 2"],
  "pacing_notes": "Notes about pacing improvements"
}`,
      buildPrompt: (input: StepInput) => {
        return `Perform structural editing on this content:

${input.prompt}

Focus on pacing, scene order, and narrative flow. Maintain the core story.`;
      },
      options: {
        temperature: 0.6,
        maxTokens: 6144,
      },
    },
    {
      id: "line_edit",
      name: "Line Edit",
      description: "Improve prose quality line-by-line",
      systemPrompt: `You are a line editor. Polish prose for clarity and style.

Return valid JSON with this structure:
{
  "improved_content": "Line-edited text",
  "improvements": ["Improvement 1", "Improvement 2"]
}`,
      buildPrompt: (input: StepInput) => {
        const structuralEdit = input.previousOutputs?.[0]?.structured;

        return `Perform line editing on this content:

${structuralEdit?.improved_content || input.prompt}

Improve clarity, eliminate awkward phrasing, and enhance prose quality.`;
      },
      options: {
        temperature: 0.5,
        maxTokens: 6144,
      },
    },
  ],
  config: {
    saveIntermediateResults: true,
    allowPause: false,
  },
};

/**
 * Registry of all available pipelines
 */
export const PIPELINE_REGISTRY: Record<string, PipelineDefinition> = {
  book_generation: BOOK_GENERATION_PIPELINE,
  chapter_expansion: CHAPTER_EXPANSION_PIPELINE,
  story_refinement: STORY_REFINEMENT_PIPELINE,
};

/**
 * Get a pipeline definition by ID
 */
export function getPipelineDefinition(id: string): PipelineDefinition | undefined {
  return PIPELINE_REGISTRY[id];
}
