# AI Pipeline Architecture

## Overview

The AI Pipeline system provides a structured approach to complex, multi-step AI generation workflows. It enables sequential execution of AI generation steps where each step can use outputs from previous steps as context.

## Core Concepts

### Pipeline Definition

A `PipelineDefinition` specifies the complete workflow:

```typescript
const myPipeline: PipelineDefinition = {
  id: "my_pipeline",
  name: "My Pipeline",
  description: "What this pipeline does",
  steps: [
    // Array of PipelineStep objects
  ],
  config: {
    saveIntermediateResults: true,
    allowPause: true,
    timeout: 600000,
  },
};
```

### Pipeline Step

Each `PipelineStep` represents one AI generation task:

```typescript
{
  id: "step_1",
  name: "Step Name",
  description: "What this step does",
  systemPrompt: "System prompt for AI",
  buildPrompt: (input: StepInput) => {
    // Build user prompt using input and previous outputs
    return "Your prompt here";
  },
  options: {
    temperature: 0.8,
    maxTokens: 4096,
  },
}
```

### Step Input & Output

- **StepInput**: Contains the user's initial prompt, context, and outputs from previous steps
- **StepOutput**: Contains generated text, structured data (if JSON), model info, and token usage

## Execution Flow

1. **Initialize**: Create a `PipelineExecutor` with definition and options
2. **Execute Steps**: Steps run sequentially, each receiving outputs from previous steps
3. **Context Passing**: Each step's `buildPrompt` function can access all previous outputs
4. **State Management**: Pipeline state tracks progress, allowing pause/resume
5. **Result Collection**: Final `PipelineResult` contains all outputs and metadata

## Usage Examples

### Basic Execution

```typescript
import { executePipeline } from "@/lib/ai/pipeline-executor";
import { BOOK_GENERATION_PIPELINE } from "@/lib/ai/pipeline-definitions";

const result = await executePipeline(BOOK_GENERATION_PIPELINE, {
  userId: "user-123",
  projectId: "proj-456",
  input: {
    prompt: "A sci-fi thriller set on Mars",
    params: { targetWordCount: 50000 },
  },
});

console.log(result.status); // "completed"
console.log(result.outputs); // Array of StepOutput
```

### Advanced: Pause/Resume

```typescript
const executor = new PipelineExecutor(definition, options);

// Start execution
const promise = executor.execute();

// Later, pause
executor.pause();

// Resume when ready
const result = await executor.resume();
```

### With Callbacks

```typescript
const result = await executePipeline(definition, {
  userId: "user-123",
  input: { prompt: "..." },
  onStepComplete: (step, output) => {
    console.log(`Completed: ${step.name}`);
    console.log(`Tokens used: ${output.usage.totalTokens}`);
  },
  onStatusChange: (status) => {
    console.log(`Pipeline status: ${status}`);
  },
});
```

## Pre-defined Pipelines

### 1. Book Generation Pipeline

**ID**: `book_generation`

**Steps**:
1. **Concept Development**: Generate title, premise, themes
2. **Story Outline**: Create chapter-by-chapter outline
3. **Chapter Expansion**: Write first 3 chapters
4. **Refinement**: Polish and refine content

**Use Case**: Generate a complete book from a basic concept

```typescript
import { BOOK_GENERATION_PIPELINE } from "@/lib/ai/pipeline-definitions";

const result = await executePipeline(BOOK_GENERATION_PIPELINE, {
  userId: currentUser.id,
  projectId: currentProject.id,
  input: {
    prompt: "A fantasy adventure about a reluctant hero",
  },
});
```

### 2. Chapter Expansion Pipeline

**ID**: `chapter_expansion`

**Steps**:
1. **Scene Breakdown**: Break chapter into scenes
2. **Scene Writing**: Write full prose for each scene
3. **Chapter Assembly**: Combine scenes cohesively

**Use Case**: Expand a brief chapter outline into full narrative

```typescript
import { CHAPTER_EXPANSION_PIPELINE } from "@/lib/ai/pipeline-definitions";

const result = await executePipeline(CHAPTER_EXPANSION_PIPELINE, {
  userId: currentUser.id,
  input: {
    prompt: `Chapter 5: The protagonist discovers the truth about their past.
    - Opens with a flashback
    - Confrontation with mentor character
    - Ends with a major revelation`,
  },
});
```

### 3. Story Refinement Pipeline

**ID**: `story_refinement`

**Steps**:
1. **Structural Edit**: Improve pacing and structure
2. **Line Edit**: Polish prose quality

**Use Case**: Multi-pass refinement of existing content

## State Management

### Pipeline Status

- `pending`: Created but not started
- `running`: Currently executing
- `paused`: Paused, can be resumed
- `completed`: Successfully finished
- `failed`: Error during execution
- `cancelled`: Cancelled by user

### Step Status

- `pending`: Not yet started
- `running`: Currently executing
- `completed`: Successfully finished
- `failed`: Error occurred
- `skipped`: Skipped (optional step or condition not met)

### Persisting State

Pipeline state can be persisted to enable long-running workflows:

```typescript
const executor = new PipelineExecutor(definition, options);

// Get current state at any time
const state = executor.getState();

// Save to database
await saveToDatabase(state);

// Later, restore and resume
const restoredExecutor = PipelineExecutor.fromState(savedState);
await restoredExecutor.resume();
```

## Creating Custom Pipelines

### Define Your Pipeline

```typescript
import type { PipelineDefinition } from "@/lib/ai/pipeline-types";

export const MY_CUSTOM_PIPELINE: PipelineDefinition = {
  id: "custom_workflow",
  name: "Custom Workflow",
  description: "My custom multi-step workflow",
  steps: [
    {
      id: "analyze",
      name: "Analysis",
      description: "Analyze the input",
      systemPrompt: "You are an expert analyzer...",
      buildPrompt: (input) => {
        return `Analyze: ${input.prompt}`;
      },
      options: { temperature: 0.3 },
    },
    {
      id: "generate",
      name: "Generation",
      description: "Generate based on analysis",
      systemPrompt: "You are a creative generator...",
      buildPrompt: (input) => {
        const analysis = input.previousOutputs?.[0]?.structured;
        return `Based on this analysis: ${JSON.stringify(analysis)}

        Generate creative content.`;
      },
      options: { temperature: 0.9 },
    },
  ],
};
```

### Optional Steps

```typescript
{
  id: "optional_step",
  name: "Optional Enhancement",
  description: "Only runs if condition is met",
  optional: true,
  shouldRun: (input) => {
    // Check if we should run this step
    return input.params?.enhance === true;
  },
  systemPrompt: "...",
  buildPrompt: (input) => "...",
}
```

## Integration with AI Generations Table

Pipeline results should be logged to the `ews_ai_generations` table:

```typescript
import { logAIGeneration } from "@/lib/ai/generations";

const result = await executePipeline(definition, options);

// Log the final result
await logAIGeneration(supabase, {
  projectId: options.projectId!,
  toolType: "assist", // or create new type: "pipeline"
  prompt: JSON.stringify(options.input),
  output: JSON.stringify(result.outputs),
  metadata: {
    pipelineId: definition.id,
    executionId: result.executionId,
    totalTokens: result.totalTokens,
    durationMs: result.durationMs,
    stepCount: result.outputs.length,
  },
  userId: options.userId,
});
```

## Best Practices

1. **Keep Steps Focused**: Each step should have a single, clear purpose
2. **Use Context Wisely**: Pass only relevant information between steps
3. **Handle Errors**: Consider what happens if a step fails
4. **Set Timeouts**: Prevent infinitely running pipelines
5. **Log Results**: Always persist important pipeline executions
6. **Test Incrementally**: Test each step individually before running full pipeline
7. **Use Structured Output**: JSON outputs make it easier to pass data between steps

## Future Enhancements

- **Parallel Steps**: Support steps that can run concurrently
- **Conditional Branching**: Different paths based on step outcomes
- **Human-in-the-Loop**: Pause for user review/editing between steps
- **Template Variables**: Reusable prompt templates with placeholders
- **Pipeline Composition**: Combine multiple pipelines
- **Streaming Support**: Stream outputs as they're generated
