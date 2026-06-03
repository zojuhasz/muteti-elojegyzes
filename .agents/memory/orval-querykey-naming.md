---
name: Orval queryKey naming
description: Generated queryKey helper functions have a double "get" prefix pattern.
---

Orval v8 generates queryKey helpers with **two** "get" prefixes:

- Hook: `useGetCalendarSurgeries` → queryKey fn: `getGetCalendarSurgeriesQueryKey`
- Hook: `useGetAdmissionCalendar` → queryKey fn: `getGetAdmissionCalendarQueryKey`
- Hook: `useListPatients` → queryKey fn: `getListPatientsQueryKey` (no double get — starts with List)

**Why:** Orval prefixes every non-mutation query function with "get", including the already-prefixed hook name. `useGet*` → strip `use` → `Get*` → prepend `get` → `getGet*`.

**How to apply:** When invalidating queries, always grep the generated api.ts for `QueryKey` to find the exact function name before coding. Never guess.
