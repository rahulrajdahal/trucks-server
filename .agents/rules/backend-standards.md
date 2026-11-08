# Rule: Backend Engineering & API Standards

This document establishes the architecture and engineering standards for the Food Truck puzzle backend.

## Architectural Boundaries

1. **Route Handlers (`src/routes/`):**
   - Parse and validate HTTP inputs using Zod.
   - Dispatch work to domain services or repositories.
   - Return clean, consistent HTTP responses.
   - Never write directly to disk or perform file I/O inside route controllers.

2. **Repositories & Storage (`src/services/`):**
   - Decouple data access through the `LevelRepository` interface.
   - Handle serialization, deserialization, file operations, and future database connectors (PostgreSQL/Supabase).

3. **Validation & Schemas (`src/schemas/`):**
   - Single source of truth for runtime validation and static TypeScript types (`z.infer<typeof ...>`).
   - Throw structured validation errors with `400 Bad Request` status and list specific invalid paths.

## TypeScript Guidelines

- `strict: true` must always remain active.
- Explicit return types for repository and service methods.
- No `any` types; use `unknown`, type guards, or discriminated unions.
- Handle `null` and `undefined` safely.

## HTTP Response Conventions

- `200 OK` / `201 Created`: Standard success.
  ```json
  { "success": true, "data": { ... } }
  ```
- `400 Bad Request`: Input validation failed.
  ```json
  { "success": false, "error": "Validation failed", "issues": [ ... ] }
  ```
- `404 Not Found`:
  ```json
  { "success": false, "error": "Level with ID <id> not found" }
  ```
- `500 Internal Server Error`:
  ```json
  { "success": false, "error": "Internal server error message" }
  ```

## Testing Protocol

- Test all Zod schemas with valid and edge-case invalid data.
- Test repository CRUD operations.
- Test level simulation engine against known winnable and deadlocked levels.

