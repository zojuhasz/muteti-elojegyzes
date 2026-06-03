---
name: API server Zod imports
description: Quirks around using Zod in the api-server artifact.
---

- Use `import { z } from "zod"` in api-server route files. `import { z } from "zod/v4"` does NOT resolve with esbuild.
- Zod must be listed as a runtime `dependency` in `artifacts/api-server/package.json`.
- Generated Zod schemas from @workspace/api-zod use `zod.coerce.date()` for date query params — this breaks Express query strings (which are always strings). Override with inline `z.string()` schemas in routes.

**Why:** esbuild bundles CJS; the `zod/v4` subpath is ESM-only and not resolvable. The generated date coercion tries `new Date(queryString)` which may silently succeed but with wrong timezone semantics.

**How to apply:** For any route that needs Zod, import `{ z }` directly. For date range params like `from`/`to`, write inline `z.object({ from: z.string(), to: z.string() })` instead of using generated query param schemas.
