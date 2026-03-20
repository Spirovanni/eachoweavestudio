# ADR-003: File Storage Approach

**Status**: Accepted
**Date**: 2026-03-19

## Context

EchoWeave Studio needs to handle file uploads such as user avatars, project cover images, and potentially embedded assets within chapters or notes. The file storage solution needs to be:
- Secure, ensuring only authorized users can upload files.
- Capable of providing public URLs for things like avatars and project covers.
- Easy to integrate with our Next.js frontend and PostgreSQL database.

## Decision

We have chosen **Supabase Storage** to handle file storage and asset delivery.

## Rationale

- **Ecosystem Synergy**: Our database and auth already rely on Supabase. Using Supabase Storage means we can manage our entire backend stack in one place.
- **Security**: Supabase Storage integrates directly with Supabase Auth and PostgreSQL Row Level Security (RLS). We can write familiar RLS policies to control who is allowed to upload, read, update, or delete files in specific buckets.
- **Developer Experience**: The `@supabase/supabase-js` client provides built-in methods for uploading files and retrieving standard or signed URLs, meaning we don't need to learn a separate AWS S3 SDK or manage separate AWS credentials.
- **CDN**: Supabase Storage provides built-in Global CDN delivery for public buckets and optimized image resizing options, which are crucial for performance in a media-rich application.

## Consequences

- **Positive**: We reduce infrastructure complexity. The security model (RLS) used for the database applies consistently to our storage layer.
- **Negative**: Similar to Auth, this increases our ecosystem lock-in with Supabase. Storage features and limitations are dependent on Supabase rather than having root access to a generic S3 bucket.
