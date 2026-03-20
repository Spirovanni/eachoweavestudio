# API Route Conventions

**Updated**: 2026-03-19

EchoWeave Studio uses Next.js App Router Route Handlers (`src/app/api/...`) for its backend API. All API routes must adhere to the following conventions to ensure security, consistency, and readability.

## 1. Authentication & Authorization

All protected routes MUST authenticate the user using the shared `getAuthenticatedClient` helper from `@/lib/api/helpers`.

```typescript
import { getAuthenticatedClient } from "@/lib/api/helpers";

export async function GET(request: NextRequest) {
  const { supabase, user, error } = await getAuthenticatedClient();
  if (error) return error; // Returns a NextResponse with appropriate status
  
  // ... proceed with logic
}
```

### Project-Level Access Control

Since entities are segregated by `project_id`, you must verify that the authenticated user is a member of the project before performing ANY read, write, or delete operations. Use the `verifyProjectAccess` helper:

```typescript
import { verifyProjectAccess } from "@/lib/api/helpers";

const hasAccess = await verifyProjectAccess(supabase, user.id, projectId);
if (!hasAccess) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

## 2. Standardized Responses

- **Success**: Always return standard JSON objects. For arrays of data, use `{ data: [...] }`. For single entities, use `{ data: { ... } }`.
- **Pagination**: Include metadata like `count`, `limit`, and `offset` alongside paginated `data`.
- **Errors**: Return a recognizable `{ error: "Error message" }` payload with proper HTTP status codes:
  - `400 Bad Request` for missing/invalid parameters.
  - `401 Unauthorized` for missing authentication.
  - `403 Forbidden` for permission failures (e.g., trying to access another user's project).
  - `404 Not Found` if a resource does not exist.
  - `500 Internal Server Error` for database (`dbError.message`) or unexpected failures.

## 3. Query Parameters vs Body Payloads

- **GET / DELETE requests** should accept parameters via the URL `searchParams`.
- **POST / PUT / PATCH requests** should accept data via the request JSON body (`await request.json()`). 
