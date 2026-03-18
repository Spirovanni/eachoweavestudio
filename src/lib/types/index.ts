// Shared TypeScript types for Arcana Co-Author Studio
// These will be expanded as the data model is implemented

export type EntityType =
  | "chapter"
  | "song"
  | "image"
  | "conversation"
  | "character"
  | "theme"
  | "note";

export type ChapterStatus =
  | "idea"
  | "outline"
  | "draft"
  | "revision"
  | "complete"
  | "published";
