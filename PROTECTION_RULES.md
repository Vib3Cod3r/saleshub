# Layout Component Protection Rules

## Protected Components
The following layout components are protected from changes unless explicitly unlocked:

### Header Component
- **File**: `frontend/src/components/layout/header.tsx`
- **Status**: UNLOCKED
- **Last Modified**: [Current Date]
- **Reason**: User requested color change to #372D50

### Sidebar Component  
- **File**: `frontend/src/components/layout/sidebar.tsx`
- **Status**: UNLOCKED
- **Last Modified**: [Current Date]
- **Reason**: User requested color change to #372D50

### Main Content Layout
- **File**: `frontend/src/components/layout/main-content.tsx`
- **Status**: PROTECTED
- **Reason**: Core layout structure that coordinates header and sidebar

## Unlock Instructions
To make changes to protected components:
1. User must explicitly state "UNLOCK [component-name]" 
2. Example: "UNLOCK header" or "UNLOCK sidebar"
3. After changes are complete, components will be re-protected

## Current Layout Structure
```
MainContent (main-content.tsx)
├── Sidebar (sidebar.tsx) - UNLOCKED
├── Header (header.tsx) - UNLOCKED  
└── Main Content Area (children)
```

## Notes
- These components are critical for the overall layout and user experience
- Changes should only be made when user explicitly requests them
- Always remind user to re-lock components after changes if they forget
