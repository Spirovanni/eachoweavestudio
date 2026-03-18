# Arcana Co-Author Studio - Product Requirements Document (PRD)

**Working product name:** Arcana Co-Author Studio  
**Integrated AI feature suite:** EchoWeave Studio AI Tools  
**Document type:** Consolidated PRD  
**Status:** Draft - merged from source documents  
**Last updated:** March 17, 2026

## 1. Executive Summary

Arcana Co-Author Studio is a collaborative creative workspace designed for two authors to co-create a multimedia book using chapters, conversations, songs, artwork, characters, themes, and notes. Rather than treating the book as a static document, the platform organizes the work as a connected network of creative artifacts, allowing authors to trace how scenes, songs, images, and conversations influence one another.

This PRD combines the core product vision and system design from the Arcana Co-Author Studio PRD with the generative AI capabilities defined in the EchoWeave Studio supplemental specification. The result is a single product definition for a collaborative writing and story development platform with embedded AI tools for drafting, ideation, outlining, plot generation, prompt generation, and optional mature-content generation controls.

## 2. Vision

Create a central creative operating system where two co-authors can build a multimedia story world, organize every creative input that contributes to the book, and use embedded AI tools to accelerate ideation, drafting, revision, and narrative development.

## 3. Core Concept

Instead of writing inside a single linear document, the story is built as a connected network of creative elements, including:

- chapters
- songs
- conversations
- images
- characters
- themes
- notes
- AI-generated outputs

Each element can be linked to other elements so authors can move fluidly between inspiration and execution. A chapter can link to the conversation that inspired it, the song that captures its emotional tone, the artwork that shaped its mood, and the characters and themes that drive the scene.

## 4. Product Goals

### 4.1 Primary Goals

- Enable two authors to collaborate in a shared creative workspace.
- Organize story development across multiple media types.
- Preserve the relationships between chapters, songs, images, conversations, and themes.
- Embed AI assistance directly into the writing workflow.
- Support both ideation and production, from first prompt to full draft.
- Provide a foundation for later public publishing of selected content.

### 4.2 Success Criteria

- Authors can create, edit, and link all major creative entities.
- Authors can comment on and revise creative assets collaboratively.
- Authors can trigger AI tools without leaving the workspace.
- The system can support structured drafting workflows from outline to chapter development.
- Selected content can later be exposed through a public-facing publishing layer.

## 5. Non-Goals (Initial Scope Boundaries)

The following are not required for the initial launch unless intentionally added later:

- multi-tenant enterprise collaboration beyond the core author team
- marketplace functionality
- advanced reader community features
- live co-editing at Google Docs scale
- complex rights management or royalty accounting
- full social networking features

## 6. Primary Users

### 6.1 Core Authors

- **Author 1:** Xavier
- **Author 2:** Natalie

Both users have full editing permissions and collaboration capabilities.

### 6.2 Future User Types (Later Phases)

- readers viewing public content
- invited collaborators or editors
- project administrators managing content controls and AI settings

## 7. Key Product Principles

- **Connected creativity:** every artifact should be linkable to other artifacts.
- **In-workflow assistance:** AI should be accessible inside the editor and workspace, not as a separate disconnected tool.
- **Traceable inspiration:** the platform should preserve the origin and emotional context of creative work.
- **Flexible drafting:** users should be able to move between outline, scene, chapter, and book-level generation.
- **Selective publishing:** private creation first, public release later.

## 8. Primary Use Cases

- Build and revise narrative chapters.
- Archive meaningful conversations that inspire narrative material.
- Store and connect songs, lyrics, and audio references to story elements.
- Collect and organize artwork tied to narrative symbolism or chapter development.
- Maintain a structured database of characters and recurring themes.
- Use AI to generate prompts, plots, outlines, scenes, stories, and full draft components.
- Maintain revision history and collaborative comments.
- Publish curated portions of the work to a public website in later phases.

## 9. Functional Scope

## 9.1 Dashboard

The dashboard is the creative command center for the project.

### Requirements

- Display project overview.
- Display recent edits.
- Display activity feed.
- Display progress indicators.
- Surface recently updated chapters, songs, conversations, and images.
- Surface AI activity summaries or recent generated outputs.

## 9.2 Chapter Builder

The chapter builder is the primary writing environment.

### Requirements

- Create and edit chapters.
- Store chapter title, summary, body content, status, creator, timestamps, and linked assets.
- Link chapters to songs, images, conversations, and themes.
- Support draft progression and status tracking.
- Support inline AI assistance in the chapter editor.
- Maintain revision history for chapters.

### Expected Chapter Statuses

Suggested statuses include:

- idea
- outline
- draft
- revision
- complete
- published

## 9.3 Conversations Vault

The conversations vault stores meaningful conversations that inspire chapters, songs, or emotional themes.

### Requirements

- Archive conversation records.
- Store title, content, tags, creator, and timestamps.
- Link conversations to one or more chapters.
- Support search and filtering by tag or relevance.

## 9.4 Songs Library

The songs library stores lyrical and musical assets tied to the project.

### Requirements

- Store song title, lyrics, audio reference, mood, creator, and timestamps.
- Link songs to chapters.
- Allow notes on emotional tone and narrative relevance.

## 9.5 Image Gallery

The image gallery manages visual inspiration and related narrative artwork.

### Requirements

- Store image title, URL or storage reference, caption, symbolism, creator, and timestamps.
- Link images to chapters.
- Support image detail pages.
- Preserve symbolic or interpretive notes.

## 9.6 Character Database

The character database tracks narrative roles, symbolism, and story relevance.

### Requirements

- Store character name, description, symbolism, and project association.
- Support linking characters to relevant chapters and themes in future iterations.
- Provide a structured reference system for recurring narrative roles.

## 9.7 Theme Library

The theme library organizes recurring motifs, emotional arcs, and symbolic through-lines.

### Requirements

- Store theme name and description.
- Link themes to chapters.
- Support theme detail pages.
- Support thematic filtering and discovery later.

## 9.8 Notes

Notes act as a lightweight capture layer for ideas that are not yet formalized.

### Requirements

- Create and manage loose notes.
- Associate notes with project, chapter, character, theme, or song where relevant.
- Support future conversion of notes into formal content items.

## 9.9 Comment System

The comment system supports collaboration across creative entities.

### Requirements

- Allow comments on chapters, songs, images, and notes.
- Store comment author, target entity type, target entity ID, content, and timestamp.
- Provide contextual discussion history on entity detail pages.

## 9.10 Version History

Version history preserves chapter revisions for accountability and creative recovery.

### Requirements

- Store chapter revision snapshots.
- Record editor and timestamp.
- Allow viewing historical revisions.
- Enable comparison and possible restoration in future iterations.

## 9.11 Activity Feed

The activity feed provides visibility into ongoing work.

### Requirements

- Show recent edits and content changes.
- Show comments and revision events.
- Show AI generation events in a later iteration.

## 9.12 Settings

Settings support project-level preferences and user-level controls.

### Requirements

- Manage authentication and profile access.
- Manage project metadata.
- Configure AI feature access and optional content controls.
- Manage publishing visibility later.

## 9.13 Public Publishing Layer

A future public layer allows selected content to be visible to readers.

### Requirements

- Publish selected chapters or excerpts.
- Publish artwork galleries.
- Publish music-related content where applicable.
- Support sample chapters and book release pages.
- Keep unpublished/private work inaccessible by default.

## 10. Integrated AI Feature Suite (EchoWeave Studio)

All AI tools are embedded into the chapter editor and broader creative workspace. Authors should be able to trigger AI assistance directly within their workflow without leaving the application.

## 10.1 AI Novelist / Novel Generator

Provides long-form narrative generation assistance.

### Requirements

- Accept prompts based on themes, characters, scenes, or story goals.
- Generate structured narrative passages or chapter drafts.
- Continue existing text from the current working draft.
- Support novel ideation and chapter drafting workflows.

## 10.2 Writing Assistant / Creative Writing Assistant

A contextual AI assistant embedded within the chapter editor.

### Requirements

- Provide grammar assistance.
- Provide style suggestions.
- Offer rewriting options.
- Adjust tone based on user instruction.
- Expand scenes or rewrite selected sections.
- Operate on selected text or current draft context.

## 10.3 Story Generator / Narrative Generator

Generates complete short-form narratives from prompt inputs.

### Requirements

- Accept themes, genres, characters, or settings.
- Produce a structured story with beginning, conflict, climax, and resolution.
- Save generated results as notes, drafts, or chapter seeds.

## 10.4 Plot Generator / Story Plot Generator / Storyline Generator

Generates structured plot frameworks and story arcs.

### Requirements

- Accept genre, emotional tone, and narrative archetypes.
- Produce possible plot progressions.
- Suggest character conflicts.
- Generate act structures suitable for novels or episodic stories.

## 10.5 Book Outline Generator

Produces structured outlines for long-form books.

### Requirements

- Accept high-level concepts and story goals.
- Generate chapter breakdowns.
- Suggest narrative arcs and thematic development.
- Support export into the chapter planning workflow.

## 10.6 Fan Fiction and Fandom Generators

Specialized tools for generating fandom-inspired or alternate-universe narratives.

### Requirements

- Support alternate versions of characters, universes, and narrative paths.
- Maintain coherent story structure.
- Save outputs as idea objects, notes, or drafts.

## 10.7 Story Prompt Generator

Generates prompts for scenes, story arcs, dialogue, or writing exercises.

### Requirements

- Filter prompts by genre, tone, emotional theme, or narrative style.
- Save prompts into notes or writing sessions.

## 10.8 AI Book Generator

Combines multiple AI tools into a pipeline for generating a full draft based on structured inputs.

### Requirements

- Accept outline, character descriptions, and narrative goals.
- Generate draft material across chapter-level outputs.
- Allow author review and manual refinement before content is treated as canonical.

## 10.9 Adult Story Generator (Optional Module)

An optional mature-content generation module.

### Requirements

- Disabled by default.
- Can be enabled only by project administrators.
- Must be configurable at the project or workspace level.
- Must remain clearly separated from standard writing workflows if enabled.

## 10.10 AI Workflow Integration

AI tools should be usable from inside the editor and creative workspace.

### Requirements

- Trigger AI from the chapter editor.
- Allow outputs to be inserted, saved as notes, or stored as separate generated artifacts.
- Preserve author control over what becomes part of the final draft.
- Track AI-generated content as distinct from human-authored revisions when practical.

## 11. Information Architecture / Site Map

- Home
- Dashboard
- Chapters
  - Chapter Detail
  - Edit Chapter
- Conversations
  - Conversation Detail
- Songs
  - Song Detail
- Images
  - Gallery
  - Image Detail
- Characters
  - Character Detail
- Themes
  - Theme Detail
- Notes
- Activity Feed
- Settings

## 12. User Stories

### 12.1 Collaboration

- As a co-author, I want to create and edit chapters so that I can develop the book collaboratively.
- As a co-author, I want to comment on chapters, songs, images, and notes so that collaboration stays attached to the work itself.
- As a co-author, I want revision history for chapters so that I can recover earlier drafts or review progress.

### 12.2 Creative Asset Linking

- As a co-author, I want to link songs, images, conversations, and themes to chapters so that inspiration stays connected to the writing.
- As a co-author, I want to browse all creative assets by type so that the workspace feels organized instead of chaotic.

### 12.3 AI-Assisted Writing

- As a co-author, I want AI assistance inside the editor so that I can draft and revise without switching tools.
- As a co-author, I want plot and outline generation so that I can move from concept to structure quickly.
- As a co-author, I want story prompts and story generation tools so that I can break through creative blocks.
- As an administrator, I want optional mature-content generation to be explicitly controlled so that sensitive content is not enabled accidentally.

## 13. Functional Requirements by Domain

## 13.1 Authentication and Access

- The platform must support authenticated access for authorized users.
- The initial system must support at least two full-access co-authors.
- The platform should support Supabase Auth or Clerk.

## 13.2 Project Management

- The platform must support projects as top-level containers.
- All creative entities must belong to a project.
- A project must include title, description, creator, and timestamps.

## 13.3 Content Entities

- The platform must support CRUD operations for chapters, conversations, songs, images, characters, themes, and notes.
- The platform must support relationship tables for linking chapters to other entities.
- The platform should support structured search and filtering in later iterations.

## 13.4 Collaboration

- Users must be able to comment on supported entity types.
- The system must preserve chapter revision records.
- Activity events should be visible through the dashboard or activity feed.

## 13.5 AI Operations

- AI tools must be available in the editor/workspace context.
- Generated outputs should be reviewable before final adoption.
- Optional admin controls must exist for mature-content features.

## 13.6 Publishing

- The system should support a later public-facing layer for selected content.
- Publishing controls must separate public and private material.

## 14. Data Model Overview

## 14.1 Core Tables

```text
users (id, name, email, role, created_at)
projects (id, title, description, created_by, created_at)
chapters (id, project_id, title, summary, content, status, created_by, created_at, updated_at)
conversations (id, project_id, title, content, tags, created_by, created_at)
songs (id, project_id, title, lyrics, audio_url, mood, created_by, created_at)
images (id, project_id, title, image_url, caption, symbolism, created_by, created_at)
characters (id, project_id, name, description, symbolism)
themes (id, project_id, name, description)
```

## 14.2 Relationship Tables

```text
chapter_songs (chapter_id, song_id)
chapter_images (chapter_id, image_id)
chapter_conversations (chapter_id, conversation_id)
chapter_themes (chapter_id, theme_id)
```

## 14.3 Collaboration Tables

```text
comments (user_id, entity_type, entity_id, content, created_at)
chapter_revisions (chapter_id, content, edited_by, created_at)
```

## 14.4 Recommended Future Tables

These are not required by the source documents but are recommended to support the integrated AI workflow more cleanly:

```text
notes (id, project_id, title, content, created_by, created_at, updated_at)
ai_generations (id, project_id, tool_type, prompt, output, created_by, created_at, source_entity_type, source_entity_id)
project_settings (id, project_id, adult_module_enabled, publishing_enabled, created_at, updated_at)
activity_events (id, project_id, user_id, event_type, entity_type, entity_id, metadata, created_at)
```

## 15. Permissions and Roles

### 15.1 Initial Roles

- **Author:** full read/write access to all project content
- **Administrator:** full access plus feature toggles and optional module controls
- **Reader (future):** public-facing access to selected published content only

### 15.2 Permission Expectations

- Co-authors can create, edit, link, and comment on content.
- Administrators can manage feature configuration.
- Readers cannot access unpublished content.

## 16. Recommended Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS, shadcn/ui
- **Backend:** Supabase with PostgreSQL
- **Authentication:** Supabase Auth or Clerk
- **Storage:** Supabase Storage
- **Deployment:** Vercel

## 17. Development Phases

## Phase 1 - Core Platform

- login system
- dashboard
- chapter builder
- song library
- image gallery

## Phase 2 - Collaboration Tools

- comment system
- conversation vault
- theme and character linking
- version history

## Phase 3 - Public Website

- reader-facing pages
- artwork gallery
- music integration
- sample chapters and book release pages

## Phase 4 - Embedded AI Creation Suite

- writing assistant inside chapter editor
- AI novelist / novel generator
- story generator
- plot generator
- outline generator
- story prompt generator
- AI book generation workflow
- admin controls for optional adult module

## 18. MVP Definition

The minimum viable product should include:

- authentication
- project dashboard
- chapter CRUD and editing
- linking chapters to songs, images, conversations, and themes
- songs library
- image gallery
- conversations vault
- comments
- chapter revision history
- embedded writing assistant
- at least one structured generation flow (outline or plot generation)

## 19. UX Expectations

- The workspace should feel like a creative operating system, not a generic CMS.
- Authors should be able to move naturally between inspiration assets and active writing.
- AI tools should feel assistive, not intrusive.
- Generated content should be easy to review, accept, reject, or repurpose.
- The product should emphasize emotional, symbolic, and narrative connections across the workspace.

## 20. Risks and Considerations

- AI-generated content may create noise if outputs are not organized and reviewable.
- Optional mature-content features require explicit admin gating and careful configuration.
- The relationship-heavy data model can become difficult to navigate without strong UI patterns.
- Public publishing must cleanly separate private draft material from curated public content.

## 21. Open Implementation Recommendations

- Add structured search and tagging across all entity types.
- Add saved filters and views for large creative projects.
- Add AI generation history and prompt reuse.
- Add editor-side insertion modes such as replace, expand, summarize, and continue.
- Add relationship visualization for chapters, songs, images, and themes.
- Add analytics for content progress and activity.

## 22. Source Basis for This Consolidated PRD

This document was created by combining:

1. the core Arcana Co-Author Studio PRD
2. the EchoWeave Studio supplemental AI feature specification

Where the original documents were concise, this PRD expands them into a more implementation-ready format while preserving the original product intent.
