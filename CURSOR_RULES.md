# Cursor AI Rules - Sales CRM Project (Modular Architecture)

## Project Overview
You are working on a Sales CRM application with a modern full-stack architecture using Go (backend) and Next.js (frontend). Always prioritize **modular, maintainable, and scalable** code architecture following the principles outlined below.

## Core Modular Principles

### 1. Single Responsibility Principle
- Each function, class, or module should have ONE clear purpose
- Split complex functions into smaller, focused units
- Name functions/classes to clearly indicate their single responsibility
- **Example**: `validateEmail()` instead of `validateUserData()`

### 2. Separation of Concerns
- **Data Layer**: Database operations, API calls, data validation
- **Business Logic**: Core application logic, calculations, transformations
- **Presentation Layer**: UI components, formatting, user interactions
- **Configuration**: Environment variables, constants, settings

### 3. Dependency Injection
- Pass dependencies as parameters rather than hardcoding them
- Use interfaces/abstractions instead of concrete implementations
- Make modules testable by avoiding global state dependencies

## Backend Stack (Go/Gin)

### Technology Stack
- **Framework**: Gin v1.8.2
- **Database**: PostgreSQL with GORM v1.25.5
- **Authentication**: JWT v5.2.0
- **Validation**: Custom validation with Go structs
- **Configuration**: godotenv v1.5.1
- **Development Port**: 8089

### Backend Modular Structure
```
backend/
├── cmd/                    # Application entry points
│   ├── server/            # Main server binary
│   ├── migrate/           # Database migration tool
│   └── seed/              # Data seeding tool
├── internal/              # Private application code
│   ├── container/         # Dependency injection container
│   ├── handlers/          # HTTP request handlers
│   ├── repositories/      # Data access layer
│   └── services/          # Business logic layer
├── pkg/                   # Public packages
│   ├── auth/              # Authentication utilities
│   └── validation/        # Validation utilities
├── models/                # Data models and structs
├── middleware/            # HTTP middleware
├── config/                # Configuration management
└── lib/                   # Shared utilities
```

### Backend Modular Rules

#### 1. Handler Layer (HTTP Interface)
```go
// Good: Single responsibility, dependency injection
type ContactHandler struct {
    contactService ContactService
    validator      Validator
}

func (h *ContactHandler) CreateContact(c *gin.Context) {
    // Only handle HTTP concerns: parsing, validation, response
}
```

#### 2. Service Layer (Business Logic)
```go
// Good: Pure business logic, no HTTP concerns
type ContactService interface {
    CreateContact(ctx context.Context, contact *Contact) error
    GetContactByID(ctx context.Context, id string) (*Contact, error)
}

type contactService struct {
    repo ContactRepository
    validator Validator
}
```

#### 3. Repository Layer (Data Access)
```go
// Good: Only database operations
type ContactRepository interface {
    Create(ctx context.Context, contact *Contact) error
    FindByID(ctx context.Context, id string) (*Contact, error)
}
```

#### 4. Model Layer (Data Structures)
```go
// Good: Pure data structures with validation tags
type Contact struct {
    ID        string    `json:"id" gorm:"primaryKey"`
    FirstName string    `json:"first_name" binding:"required"`
    LastName  string    `json:"last_name" binding:"required"`
    Email     string    `json:"email" binding:"required,email"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}
```

### Backend Anti-Patterns to Avoid
- **God Handlers**: Handlers that contain business logic
- **Direct Database Access**: Accessing GORM directly in handlers
- **Global Variables**: Using package-level variables for state
- **Mixed Concerns**: HTTP logic mixed with business logic

## Frontend Stack (Next.js/React)

### Technology Stack
- **Framework**: Next.js 15.4.6 with App Router
- **React**: 19.1.0
- **TypeScript**: ^5 (strict mode enabled)
- **Styling**: Tailwind CSS ^4
- **UI Components**: 
  - Headless UI ^2.2.7 for accessible components
  - Heroicons ^2.2.0 for icons
  - Lucide React ^0.536.0 for additional icons
- **State Management**: TanStack React Query ^5.84.1
- **Development Port**: 3000 (always use port 3000, never allow fallback to other ports)

### Frontend Modular Structure
```
frontend/src/
├── app/                   # Next.js App Router pages
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (buttons, inputs, etc.)
│   ├── layout/           # Layout components
│   └── [feature]/        # Feature-specific components
├── hooks/                # Custom React hooks
├── services/             # API calls and business logic
├── types/                # TypeScript type definitions
├── utils/                # Pure utility functions
├── constants/            # Application constants
├── lib/                  # Third-party library configurations
└── providers/            # React context providers
```

### Frontend Modular Rules

#### 1. Component Structure
```typescript
// Good: Single responsibility, clear interface
interface ContactCardProps {
  contact: Contact;
  onEdit?: (contact: Contact) => void;
  onDelete?: (id: string) => void;
}

export function ContactCard({ contact, onEdit, onDelete }: ContactCardProps) {
  // Only UI rendering logic
}
```

#### 2. Service Layer (API Calls)
```typescript
// Good: Centralized API logic
export class ContactService {
  private static baseURL = '/api/contacts';
  
  static async getContacts(): Promise<Contact[]> {
    const response = await fetch(this.baseURL);
    return response.json();
  }
  
  static async createContact(contact: CreateContactRequest): Promise<Contact> {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact)
    });
    return response.json();
  }
}
```

#### 3. Custom Hooks (State Management)
```typescript
// Good: Encapsulated state logic
export function useContacts() {
  return useQuery({
    queryKey: ['contacts'],
    queryFn: ContactService.getContacts
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ContactService.createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    }
  });
}
```

#### 4. Utility Functions (Pure Functions)
```typescript
// Good: Pure, testable functions
export function formatContactName(contact: Contact): string {
  return `${contact.firstName} ${contact.lastName}`.trim();
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

### Frontend Anti-Patterns to Avoid
- **God Components**: Components that do too many things
- **API Calls in Components**: Making API calls directly in components
- **Global State Abuse**: Overusing React Context for everything
- **Mixed Concerns**: UI logic mixed with business logic

## Database Configuration
- **Database**: PostgreSQL 15-alpine
- **Port**: 5432
- **Database Name**: sales_crm
- **Username**: postgres
- **Password**: Miyako2020
- **Connection String**: postgresql://postgres:Miyako2020@localhost:5432/sales_crm

### Database Modular Rules
1. Use GORM models for all database operations
2. Implement repository pattern for data access
3. Use proper indexing for frequently queried fields
4. Follow PostgreSQL naming conventions (snake_case)
5. Implement proper foreign key relationships

## Module Interface Design

### Clear Inputs/Outputs
```typescript
// Good: Clear interface definition
interface CreateContactRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyId?: string;
}

interface ContactResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: Company;
  createdAt: string;
  updatedAt: string;
}
```

### Error Handling
```typescript
// Good: Consistent error handling
interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}
```

## Testing Considerations

### Backend Testing
```go
// Good: Testable service with dependency injection
func TestContactService_CreateContact(t *testing.T) {
    mockRepo := &MockContactRepository{}
    service := NewContactService(mockRepo)
    
    // Test business logic in isolation
}
```

### Frontend Testing
```typescript
// Good: Testable components with mocked dependencies
describe('ContactCard', () => {
  it('should render contact information', () => {
    const contact = mockContact();
    render(<ContactCard contact={contact} />);
    
    expect(screen.getByText(contact.firstName)).toBeInTheDocument();
  });
});
```

## Performance & Scalability Guidelines

### Backend Performance
1. Use database connection pooling
2. Implement proper caching strategies
3. Use pagination for large datasets
4. Optimize database queries with proper indexing

### Frontend Performance
1. Use React Query for efficient data fetching
2. Implement code splitting with Next.js
3. Use proper memoization (useMemo, useCallback)
4. Optimize bundle size with tree shaking

## Security Rules
1. Never commit sensitive data
2. Use environment variables for configuration
3. Implement proper CORS policies
4. Use rate limiting on all endpoints
5. Sanitize all user inputs
6. Use HTTPS in production
7. Implement proper JWT token management

## Code Style and Standards

### Go Style
1. Use `gofmt` for code formatting
2. Follow Go naming conventions
3. Use proper error handling
4. Write meaningful comments for exported functions

### TypeScript Style
1. Use strict TypeScript configuration
2. Define interfaces for all data structures
3. Use proper generic types where applicable
4. Avoid `any` type - use `unknown` if needed
5. Export types alongside components/functions

## Development Workflow

### Port Configuration
- **Frontend Development**: Always use port 3000 for Next.js development server
- **Backend Development**: Always use port 8089 for Go/Gin server
- **Database**: Always use port 5432 for PostgreSQL
- **Never allow automatic port fallback** - if a port is in use, stop the conflicting process and use the designated port

### Module Development Checklist
Before implementing any module, verify:
- [ ] Can this function be easily tested in isolation?
- [ ] Does this module have minimal external dependencies?
- [ ] Can this code be reused in different contexts?
- [ ] Are the inputs and outputs clearly defined?
- [ ] Is the module's purpose obvious from its name and structure?

### Refactoring Guidelines
1. Identify the current responsibilities of the code
2. Map out dependencies between different concerns
3. Extract pure functions first (easiest to test)
4. Separate data access from business logic
5. Create clear interfaces between modules
6. Refactor incrementally, maintaining functionality

## Docker Configuration
- **PostgreSQL**: postgres:15-alpine container
- **Network**: app-network (bridge)
- **Volumes**: postgres_data for persistence

### Docker Rules
1. Use multi-stage builds for production
2. Run containers as non-root users
3. Use specific version tags, not `latest`
4. Implement proper health checks

## Authentication Flow
1. Use JWT tokens with proper expiration
2. Store tokens securely (httpOnly cookies recommended)
3. Implement refresh token mechanism
4. Hash passwords with bcrypt
5. Validate user sessions on protected routes

## Error Handling
1. Use try-catch blocks for async operations
2. Implement global error handlers
3. Return consistent error response format
4. Log errors with appropriate detail level
5. Use React Error Boundaries for UI errors

Remember: **Modular code is about creating building blocks that work well together while remaining independent enough to be understood, tested, and modified in isolation.** Always prioritize type safety, security, and maintainability in your implementations.
