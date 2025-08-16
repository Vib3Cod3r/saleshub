# Protected Files Documentation

This document lists all files that are protected from AI modifications. These files should only be modified when explicitly requested by the user.

## Protection Methods Used

1. **File-level comments**: `@protected` comments at the top of files
2. **Section comments**: `@protected-section` and `@end-protected-section` around code blocks
3. **`.cursorignore` file**: Lists files to exclude from AI modifications
4. **This documentation**: Serves as a reference for protected files

## Protected Frontend Files

### Pages
- `frontend/src/app/deals/page.tsx` - Deals management page (CRM-style interface with filters, table, and pagination)
- `frontend/src/app/contacts/page.tsx` - Contacts management page (CRM-style interface with filters, table, and pagination)
- `frontend/src/app/companies/page.tsx` - Companies management page (CRM-style interface with filters, table, and pagination)

### Layout Components
- `frontend/src/components/layout/header.tsx` - Main header component (NEEDS TO BE CREATED)
- `frontend/src/components/layout/sidebar.tsx` - Navigation sidebar (NEEDS TO BE CREATED)
- `frontend/src/components/layout/main-content.tsx` - Core layout structure (PROTECTED)

### Hooks
- `frontend/src/hooks/use-auth.tsx` - Authentication hook

### Utilities
- `frontend/src/lib/api.ts` - API client utilities

## Protected Backend Files

### Handlers
- Add backend files here as needed

## How to Modify Protected Files

1. **Explicit request**: Only modify these files when the user specifically asks
2. **Remove protection**: Temporarily remove protection comments if changes are needed
3. **Document changes**: Update this file when protection status changes

## Adding New Protected Files

1. Add the file path to `.cursorignore`
2. Add `@protected` comment at the top of the file
3. Update this documentation
4. Use section protection for specific code blocks if needed

## Protection Tags

- `@protected` - File-level protection
- `@protected-section` - Start of protected code section
- `@end-protected-section` - End of protected code section
- `@modify-only-if-requested` - Alternative protection tag

## Example Protection Comment

```typescript
/**
 * @protected - This component is locked and should not be modified.
 * Only make changes to this file if explicitly requested by the user.
 * Current functionality: [Describe what the component does]
 */
```

## Example Section Protection

```typescript
{/* @protected-section - Table structure should not be modified */}
<table>
  {/* Protected table content */}
</table>
{/* @end-protected-section */}
```
