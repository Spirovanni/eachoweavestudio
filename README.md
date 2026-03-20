# EchoWeave Studio

EchoWeave Studio is a next-generation creative writing platform designed to integrate seamlessly with AI tools. It provides an advanced text editor, project organization, and AI-assisted generation tools for chapters, characters, songs, and lore.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security)
- **Styling**: Tailwind CSS v4, base-ui, Shadcn UI
- **Rich Text Editor**: TipTap (ProseMirror-based)
- **Testing**: Vitest, React Testing Library
- **AI Integration**: OpenAI / Anthropic SDKs (for generation pipelines)

## Architecture Overview

Please see the `docs/` directory for detailed architecture decisions and schemas:
- [Database Schema](./docs/DATABASE_SCHEMA.md)
- [API Route Conventions](./docs/API_CONVENTIONS.md)
- [ADR 001: Rich Text Editor](./docs/ADR-001-RichTextEditor.md)
- [ADR 002: Authentication](./docs/ADR-002-Authentication.md)
- [ADR 003: File Storage](./docs/ADR-003-FileStorage.md)

## Local Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env.local` file in the root of the project. You will need:
   ```env
   # Next.js / Vercel
   NEXT_PUBLIC_SITE_URL=http://localhost:3000

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # AI Providers
   OPENAI_API_KEY=your_openai_api_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```
   *See `.env.local.example` for a full list of required variables.*

3. **Start the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

## Deployment

This application is optimized for deployment on **Vercel**.
Ensure that all environment variables listed in `.env.local` are mirrored in your Vercel project settings.

```bash
# To build locally
npm run build

# To test the production build locally
npm run start
```
