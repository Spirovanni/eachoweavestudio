/**
 * AI Pipeline Types and Interfaces
 *
 * Architecture for complex, multi-step AI generation workflows.
 * Supports sequential step execution with context passing, state management,
 * and persistence of results.
 */

import type { AIGenerateOptions } from "./types";

/**
 * Status of a pipeline execution
 */
export type PipelineStatus =
  | "pending"      // Pipeline created but not started
  | "running"      // Currently executing
  | "paused"       // Paused by user, can be resumed
  | "completed"    // Successfully completed all steps
  | "failed"       // Failed during execution
  | "cancelled";   // Cancelled by user

/**
 * Status of an individual pipeline step
 */
export type StepStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "skipped";

/**
 * Input for a pipeline step
 */
export interface StepInput {
  /** User-provided initial input */
  prompt?: string;
  /** Context from previous steps */
  context?: Record<string, unknown>;
  /** Outputs from all previous completed steps */
  previousOutputs?: StepOutput[];
  /** Additional parameters */
  params?: Record<string, unknown>;
}

/**
 * Output from a pipeline step
 */
export interface StepOutput {
  /** Step identifier */
  stepId: string;
  /** Generated text content */
  text: string;
  /** Structured data (if applicable) */
  structured?: Record<string, unknown>;
  /** AI model used */
  model: string;
  /** Token usage */
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  /** Generation metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Configuration for a pipeline step
 */
export interface PipelineStep {
  /** Unique identifier for this step */
  id: string;
  /** Display name */
  name: string;
  /** Description of what this step does */
  description: string;
  /** System prompt for this step */
  systemPrompt: string;
  /** Function to build the user prompt for this step */
  buildPrompt: (input: StepInput) => string;
  /** AI generation options (temperature, maxTokens, etc.) */
  options?: Partial<AIGenerateOptions>;
  /** Whether this step can be skipped */
  optional?: boolean;
  /** Condition function to determine if step should run */
  shouldRun?: (input: StepInput) => boolean;
}

/**
 * Complete pipeline definition
 */
export interface PipelineDefinition {
  /** Unique identifier for this pipeline type */
  id: string;
  /** Display name */
  name: string;
  /** Description */
  description: string;
  /** Ordered list of steps */
  steps: PipelineStep[];
  /** Global configuration */
  config?: {
    /** Whether to save intermediate results */
    saveIntermediateResults?: boolean;
    /** Whether to allow pausing */
    allowPause?: boolean;
    /** Maximum total execution time (ms) */
    timeout?: number;
  };
}

/**
 * State of a pipeline execution
 */
export interface PipelineState {
  /** Unique execution ID */
  executionId: string;
  /** Pipeline definition ID */
  pipelineId: string;
  /** Current status */
  status: PipelineStatus;
  /** Index of current step */
  currentStepIndex: number;
  /** Completed step outputs */
  completedSteps: StepOutput[];
  /** Step-level status tracking */
  stepStatuses: Record<string, StepStatus>;
  /** Initial input provided by user */
  initialInput: StepInput;
  /** Error information (if failed) */
  error?: {
    message: string;
    stepId: string;
    timestamp: string;
  };
  /** Timestamps */
  startedAt?: string;
  pausedAt?: string;
  completedAt?: string;
  /** Project and user context */
  projectId?: string;
  userId: string;
}

/**
 * Result of a pipeline execution
 */
export interface PipelineResult {
  /** Execution ID */
  executionId: string;
  /** Final status */
  status: PipelineStatus;
  /** All step outputs */
  outputs: StepOutput[];
  /** Final combined output (if applicable) */
  finalOutput?: string;
  /** Total execution time (ms) */
  durationMs: number;
  /** Total tokens used across all steps */
  totalTokens: number;
  /** Error (if failed) */
  error?: string;
}

/**
 * Options for executing a pipeline
 */
export interface PipelineExecutionOptions {
  /** Project ID for logging */
  projectId?: string;
  /** User ID */
  userId: string;
  /** Initial input */
  input: StepInput;
  /** Callback for step completion */
  onStepComplete?: (step: PipelineStep, output: StepOutput) => void;
  /** Callback for status changes */
  onStatusChange?: (status: PipelineStatus) => void;
  /** Whether to persist state to database */
  persistState?: boolean;
}
