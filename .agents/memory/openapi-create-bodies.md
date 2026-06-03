---
name: OpenAPI-driven Create bodies
description: Only schema types explicitly in OpenAPI spec get generated; missing types cause build errors.
---

If a route file imports a generated type (e.g. `CreateOperatingRoomBody`, `CreateSurgeonBody`) that no longer has a corresponding POST endpoint in the OpenAPI spec, esbuild will fail with "No matching export" at build time.

**Why:** Orval only generates types for operations defined in the spec. Removed or unspecced endpoints leave no generated type.

**How to apply:** For routes whose POST body types are missing from @workspace/api-zod, define an inline `z.object(...)` schema directly in the route file. Do not import non-existent types from @workspace/api-zod.
