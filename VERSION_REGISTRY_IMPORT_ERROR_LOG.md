# Version Registry Import Error Log

## Error Details
**Date**: 2025-01-27
**Error Type**: Next.js Build Error
**Error Message**: "Export VersionRegistry doesn't exist in target module"
**File**: `frontend/src/hooks/use-version-registry.ts` (line 2)
**Build Tool**: Next.js 15.4.6 Turbopack

## Error Description
The build process failed because the `use-version-registry.ts` hook is trying to import `VersionRegistry` as a named export from `@/lib/version-registry`, but this export doesn't exist.

## Root Cause Analysis
1. **Import Statement**: `import { VersionRegistry } from '@/lib/version-registry'`
2. **Actual Export**: The `version-registry.ts` file exports:
   - `versionRegistry` (default export - instance of VersionRegistry class)
   - Various interfaces and types
   - But NOT the `VersionRegistry` class itself as a named export

## Suggested Fix
The error message suggests: "Did you mean to import `versionRegistry`?" (lowercase 'v')

## Applied Fix
Added the missing named export for the `VersionRegistry` class in `frontend/src/lib/version-registry.ts`:

```typescript
// Export the class for direct instantiation if needed
export { VersionRegistry }
```

This allows the hook to import the class directly while maintaining the singleton pattern.

## Files Affected
- `frontend/src/hooks/use-version-registry.ts` - Line 2 import statement
- `frontend/src/lib/version-registry.ts` - Missing named export for VersionRegistry class

## Import Traces
The error affects the following component chain:
1. `./src/hooks/use-version-registry.ts` [Client Component Browser]
2. `./src/app/companies/page.tsx` [Client Component Browser]
3. `./src/app/companies/page.tsx` [Server Component]

## Status
- [x] Error identified
- [x] Root cause determined
- [x] Fix implemented
- [ ] Build verified

## Notes
This is a TypeScript import/export mismatch error that prevents the Next.js application from building successfully.
