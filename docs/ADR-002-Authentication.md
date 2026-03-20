# ADR-002: Authentication Approach

**Status**: Accepted
**Date**: 2026-03-19

## Context

EchoWeave Studio needs a secure, reliable authentication system that works seamlessly with Next.js App Router. The application is using Supabase as its primary database and backend-as-a-service. The auth system needs to:
- Support server-side rendering (SSR), Server Components, Route Handlers, and Server Actions.
- Ensure data security at the database row level based on the authenticated user.
- Handle session management and standard auth flows (Sign In, Sign Up, Password Reset, Magic Links).

## Decision

We have chosen **Supabase Auth** integrated via the `@supabase/ssr` package.

## Rationale

- **Native Supabase Integration**: Since we are using Supabase PostgreSQL, Supabase Auth ties directly into our database roles. This enables us to use PostgreSQL Row Level Security (RLS) policies to secure data directly at the database layer.
- **App Router Support**: The `@supabase/ssr` package is explicitly designed to work with Next.js App Router. It abstracts away the complexity of managing cookies across Server Components, Client Components, Server Actions, and Middleware.
- **Security & RLS**: By using Supabase Auth, the user's JWT is passed natively into the database queries made by the Supabase client, meaning standard `select`, `insert`, `update`, and `delete` operations are automatically scoped strictly to the authenticated user.
- **Ecosystem**: We avoid the overhead of syncing users across different services (like we would with Clerk or NextAuth) because the user's Auth identity lives in the exact same infrastructure (`auth.users`) as our application schema.

## Consequences

- **Positive**: Simplified permission models (using RLS), seamless integration with our database, and unified infrastructure. Middleware handles session refreshing securely on the server.
- **Negative**: Vendor lock-in to the Supabase ecosystem for auth and database policies.
