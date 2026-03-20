# Database Schema

**Updated**: 2026-03-19

EchoWeave Studio uses **PostgreSQL** via Supabase. The schema is defined through Supabase migrations and heavily leverages **Row Level Security (RLS)** to enforce isolation between different users' projects.

## Core Hierarchy

The primary organizing unit is a **Project**. All creative content belongs to a specific project.

### 1. Users and Profiles
- `auth.users`: Managed securely by Supabase.
- `ews_profiles`: App-specific user data. References `auth.users(id)`. Stores `display_name`, `email`, `role`, and `avatar_url`.

### 2. Projects and Access
- `ews_projects`: The core container for a book or story.
- `ews_project_members`: Junction table mapping `ews_profiles` to `ews_projects` with a specific `role` (e.g., `author`, `admin`). This supports the co-author model.

### 3. Content Entities
All entities have a `project_id` and respect RLS policies based on `ews_project_members`.
- `ews_chapters`: The actual written content. Contains `title`, `summary`, `content` (JSONB for TipTap), `status`, and `order_index`.
- `ews_characters`: Character biographies, descriptions, and symbolism.
- `ews_themes`: Thematic elements and ideas.
- `ews_conversations`: Notes or dialogue snippets.
- `ews_songs`: Lyrics, audio URLs, and moods for musical elements.
- `ews_images`: Artwork, covers, or reference images connected to the project.

## Entity Relationships

To support a deeply interconnected story bible, chapters can be linked to other entities through junction tables:
- `ews_chapter_characters`
- `ews_chapter_themes`
- `ews_chapter_conversations`
- `ews_chapter_songs`
- `ews_chapter_images`

## Security Model

All tables have **Row Level Security (RLS) enabled**. Access is strictly validated by checking if the authenticated user exists in `ews_project_members` for the corresponding `project_id`. This applies to both direct entities and their junction tables.
