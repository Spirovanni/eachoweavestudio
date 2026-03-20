# ADR-001: Rich Text Editor Selection

**Status**: Accepted
**Date**: 2026-03-19

## Context

EchoWeave Studio requires a powerful, highly customizable text editor to support writing chapters, taking notes, and seamlessly integrating with AI-generation tools. The editor needs to:
- Be compatible with React and Next.js.
- Support advanced text formatting (bold, italic, links, embedded content).
- Provide a headless architecture so we can fully control the UI (via Tailwind CSS and Shadcn UI).
- Be extensible to allow custom AI-focused features, bubble menus, and inline annotations.

## Decision

We have selected **TipTap** as the rich text editor for EchoWeave Studio.

## Rationale

- **Headless Architecture**: TipTap does not force any specific UI or styling. It gives us the state and logic, allowing us to build the UI components using our existing design system (`@base-ui/react`, Shadcn UI, and Tailwind CSS).
- **ProseMirror Foundation**: Under the hood, TipTap is built on ProseMirror, which is the industry standard for robust, real-time collaborative editing and complex document structures.
- **React Integration**: `@tiptap/react` provides excellent hooks and component bindings that make it natural to integrate into our Next.js App Router application.
- **Extensibility**: TipTap's extension system (`@tiptap/extension-*`) allows us to easily add features like floating bubble menus, slash commands (useful for AI prompts), and custom node types (songs, characters, entity mentions).

## Consequences

- **Positive**: We have total control over the look and feel of the editor. We can build complex context-aware features like the AI Creation Suite directly into the editor.
- **Negative**: Because it is headless, we must build and maintain all UI components (toolbars, menus, popovers) ourselves, rather than relying on a drop-in editor component.
