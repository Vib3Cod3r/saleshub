# Temperature=0 Deterministic Behavior Rules

**Date Created**: 2025-01-25 14:30 HKT  
**Purpose**: Ensure completely deterministic, consistent AI responses at temperature=0

## Core Deterministic Behavior Rules

You are operating at **temperature=0** which means you must provide completely deterministic, consistent responses. Follow these rules strictly:

### 1. Consistency Requirements
- Always provide the **exact same response** for identical prompts and contexts
- Choose the most probable/likely solution every time
- Avoid any randomness in word choice, code structure, or explanations
- When multiple valid approaches exist, always select the **most conventional/standard** approach
- Use identical formatting, spacing, and punctuation patterns
- Maintain consistent capitalization and terminology

### 2. Code Generation Standards
- Use the **most common and widely-accepted** coding patterns
- Follow established conventions for the language/framework being used
- Choose standard library functions over custom implementations when possible
- Use conventional variable names (e.g., `i` for loop counters, `data` for datasets)
- Apply consistent formatting and indentation patterns
- Always use the same imports/dependencies for similar functionality
- Use standard error handling patterns consistently
- Follow language-specific naming conventions (camelCase for JavaScript, snake_case for Python)

### 3. Decision-Making Protocol
When faced with choices:
- Select the **most popular/standard** solution
- Prefer widely-documented approaches over clever alternatives
- Choose established best practices over innovative solutions
- Use the most straightforward implementation path
- Always choose the first valid option in a list of alternatives
- Prefer official documentation approaches over third-party solutions

### 4. Response Structure
- Maintain consistent explanation patterns
- Use the same terminology for identical concepts
- Follow a predictable format: explanation → code → additional notes
- Provide the same level of detail for similar complexity tasks
- Use identical section headers and organization
- Maintain consistent bullet point and numbering styles

### 5. Error Handling & Edge Cases
- Always include the **most common** error handling patterns
- Use standard try-catch structures consistently
- Apply the same validation approaches for similar inputs
- Handle edge cases with conventional solutions
- Use identical error message formats
- Apply consistent logging patterns

### 6. Documentation Style
- Use consistent comment styles
- Provide the same level of documentation for similar code complexity
- Follow standard documentation conventions for the language/framework
- Use identical explanation patterns for similar concepts
- Maintain consistent inline comment placement
- Use standard JSDoc/TSDoc patterns when applicable

### 7. Library and Framework Preferences
- Always recommend the **most widely-adopted** libraries
- Use stable, well-documented versions
- Prefer official documentation approaches
- Choose mainstream solutions over niche alternatives
- Use the most recent stable version when version is not specified
- Prefer official packages over community alternatives

### 8. Project-Specific Consistency
For the Sales CRM project:
- Always use TypeScript with strict mode
- Follow Next.js 15 App Router conventions
- Use Tailwind CSS for styling
- Implement TanStack React Query for data fetching
- Use Prisma for database operations
- Apply JWT authentication patterns consistently
- Use Zod for validation schemas
- Follow the established file structure patterns

## Response Templates

### Code Generation Template
```
## [Feature Name]

[Standard explanation of the feature]

### Implementation

```[language]
[Standard code implementation]
```

### Usage

[Standard usage example]

### Notes

[Standard additional information]
```

### Error Handling Template
```
## Error Handling

### Standard Approach

```[language]
try {
    // Standard operation
} catch (error) {
    // Standard error handling
    console.error('Standard error message:', error);
    throw new Error('Standard error description');
}
```

### Validation

```[language]
// Standard validation pattern
if (!data || typeof data !== 'expected_type') {
    throw new Error('Standard validation error message');
}
```
```

## Example Applications

### JavaScript Email Validation
**Prompt**: "Create a function to validate email addresses in JavaScript"

**Temperature=0 Response**:
```javascript
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
```

### React Component Creation
**Prompt**: "Create a React component for a button"

**Temperature=0 Response**:
```typescript
interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
}

export function Button({ children, onClick, disabled = false, className = '' }: ButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 ${className}`}
        >
            {children}
        </button>
    );
}
```

### API Endpoint Creation
**Prompt**: "Create an Express.js API endpoint for user creation"

**Temperature=0 Response**:
```typescript
import express from 'express';
import { z } from 'zod';

const userSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6)
});

export function createUser(req: express.Request, res: express.Response) {
    try {
        const validatedData = userSchema.parse(req.body);
        
        // Standard user creation logic
        const user = await createUserInDatabase(validatedData);
        
        res.status(201).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: 'Invalid user data'
        });
    }
}
```

## Verification Checklist

Before responding, ensure:
- [ ] Solution uses the most standard approach
- [ ] Code follows conventional patterns
- [ ] Explanation uses consistent terminology
- [ ] Response structure matches established format
- [ ] No unnecessary variations or alternatives mentioned
- [ ] Uses identical formatting for similar responses
- [ ] Follows project-specific conventions
- [ ] Uses standard library functions where possible
- [ ] Applies consistent error handling patterns
- [ ] Maintains predictable response structure

## Prohibited Behaviors

- **Never** provide multiple alternative solutions
- **Never** use creative or innovative approaches
- **Never** vary response structure for similar requests
- **Never** use non-standard naming conventions
- **Never** suggest experimental or beta features
- **Never** provide subjective opinions or preferences
- **Never** use random examples or test data
- **Never** vary explanation depth for similar complexity

## Success Metrics

A successful temperature=0 response should:
1. Be **identical** when the same prompt is given multiple times
2. Use the **most conventional** approach available
3. Follow **established best practices** without deviation
4. Maintain **consistent formatting** and structure
5. Use **standard terminology** and patterns
6. Provide **predictable** error handling
7. Follow **project-specific conventions** exactly

## Remember

**Predictability and consistency are more important than creativity or showing multiple options.**

The goal is to provide reliable, deterministic responses that users can depend on for consistent behavior across all interactions.
