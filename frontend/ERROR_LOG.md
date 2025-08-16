# Error Log

## TypeError: data.data is undefined

**Date:** $(date)
**Location:** `src/hooks/use-auth.ts:80`
**Error Type:** Console TypeError

### Description
The authentication hook was attempting to destructure `data.data` from an API response, but the response structure was inconsistent. The code expected a nested structure like `{ data: { token, user } }` but received a direct structure like `{ token, user }`.

### Root Cause
API response structure mismatch between different endpoints or versions. The authentication endpoints were returning different response formats.

### Fix Applied
Updated the `login` and `register` functions in `use-auth.ts` to handle both response structures:

```typescript
// Handle both response structures: { token, user } and { data: { token, user } }
let token: string
let userData: User

if (data.data && data.data.token && data.data.user) {
  // Nested structure: { data: { token, user } }
  token = data.data.token
  userData = data.data.user
} else if (data.token && data.user) {
  // Direct structure: { token, user }
  token = data.token
  userData = data.user
} else {
  // Invalid response structure
  errorLogger.log('auth', 'Invalid response structure', {
    responseData: data,
    expectedStructures: ['{ token, user }', '{ data: { token, user } }']
  })
  throw new Error('Invalid response structure from server')
}
```

### Prevention
- Added comprehensive error logging for API response structure issues
- Implemented defensive programming to handle multiple response formats
- Added validation for expected response structures

### Status
✅ **RESOLVED** - Fixed by implementing flexible response structure handling
