# SalesHub CRM System State Capture
**Capture Date:** August 19, 2025 at 02:48:55 AM HKT  
**Git Commit:** a7eb5d3 (HEAD -> main)  
**Status:** Working tree clean, 4 commits ahead of origin/main

## System Overview
- **Frontend:** Next.js 15.4.6 with React 19.1.0
- **Backend:** Go 1.23 with Gin framework and GORM
- **Database:** PostgreSQL 15-alpine
- **Architecture:** Full-stack TypeScript/Go CRM system

## Git Repository Status
- **Current Branch:** main
- **Latest Commit:** a7eb5d3 - "Fix backend startup and add debugging tools"
- **Commits Ahead:** 4 commits ahead of origin/main
- **Working Tree:** Clean (no uncommitted changes)

## Frontend Configuration

### Package Dependencies (frontend/package.json)
```json
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@headlessui/react": "^2.2.7",
    "@heroicons/react": "^2.2.0",
    "@tanstack/react-query": "^5.85.3",
    "@tanstack/react-query-devtools": "^5.85.3",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.539.0",
    "next": "15.4.6",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "tailwind-merge": "^3.3.1",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.4.21",
    "eslint": "^9",
    "eslint-config-next": "15.4.6",
    "postcss-load-config": "^6.0.1",
    "tailwindcss": "^3.4.17",
    "typescript": "^5"
  }
}
```

### Frontend Features
- **Framework:** Next.js 15.4.6 with App Router
- **React:** 19.1.0 with modern features
- **Styling:** Tailwind CSS ^3.4.17
- **UI Components:** Headless UI ^2.2.7, Heroicons ^2.2.0, Lucide React ^0.539.0
- **State Management:** TanStack React Query ^5.85.3
- **Development:** Turbopack enabled

## Backend Configuration

### Go Dependencies (backend/go.mod)
```go
module saleshub-backend

go 1.23

toolchain go1.24.6

require (
	github.com/gin-gonic/gin v1.8.2
	github.com/go-playground/validator/v10 v10.14.0
	github.com/golang-jwt/jwt/v5 v5.3.0
	github.com/google/uuid v1.6.0
	github.com/joho/godotenv v1.5.1
	golang.org/x/crypto v0.31.0
	gorm.io/driver/postgres v1.6.0
	gorm.io/gorm v1.30.1
)
```

### Backend Features
- **Framework:** Gin v1.8.2
- **Database ORM:** GORM v1.30.1 with PostgreSQL driver
- **Authentication:** JWT v5.3.0
- **Validation:** validator/v10 v10.14.0
- **UUID Generation:** google/uuid v1.6.0
- **Environment:** godotenv v1.5.1

## Database Schema

### Core CRM Models

#### Company Model
```go
type Company struct {
	ID      string  `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name    string  `json:"name" gorm:"not null"`
	Website *string `json:"website"`
	Domain  *string `json:"domain"`

	// Industry relationship
	IndustryID string    `json:"industryId" gorm:"type:uuid"`
	Industry   *Industry `json:"industry" gorm:"foreignKey:IndustryID;references:ID"`

	// Company size relationship
	SizeID string       `json:"sizeId" gorm:"type:uuid"`
	Size   *CompanySize `json:"size" gorm:"foreignKey:SizeID;references:ID"`

	Revenue *float64 `json:"revenue" gorm:"type:decimal(15,2)"`

	// External IDs
	ExternalID *string `json:"externalId"`

	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`

	// Audit fields
	CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
	CreatedBy *string        `json:"createdBy"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`

	// Relationships
	Contacts          []Contact          `json:"contacts" gorm:"foreignKey:CompanyID"`
	Deals             []Deal             `json:"deals" gorm:"foreignKey:CompanyID"`
	Leads             []Lead             `json:"leads" gorm:"foreignKey:CompanyID"`
	CustomFieldValues []CustomFieldValue `json:"customFieldValues" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`
	ActivityLogs      []ActivityLog      `json:"activityLogs" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`

	// Contact information (Polymorphic)
	PhoneNumbers        []PhoneNumber        `json:"phoneNumbers" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`
	EmailAddresses      []EmailAddress       `json:"emailAddresses" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`
	Addresses           []Address            `json:"addresses" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`
	SocialMediaAccounts []SocialMediaAccount `json:"socialMediaAccounts" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`
}
```

#### Contact Model
```go
type Contact struct {
	ID         string  `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	FirstName  string  `json:"firstName" gorm:"not null"`
	LastName   string  `json:"lastName" gorm:"not null"`
	Title      *string `json:"title"`
	Department *string `json:"department"`

	// Company relationship
	CompanyID *string  `json:"companyId" gorm:"type:uuid;default:null"`
	Company   *Company `json:"company" gorm:"foreignKey:CompanyID;references:ID"`

	// Contact owner relationship
	OwnerID *string `json:"ownerId" gorm:"type:uuid;default:null"`
	Owner   *User   `json:"owner" gorm:"foreignKey:OwnerID;references:ID"`

	// Lead source tracking
	OriginalSource *string `json:"originalSource"`

	// Communication preferences
	EmailOptIn bool `json:"emailOptIn" gorm:"default:true"`
	SMSOptIn   bool `json:"smsOptIn" gorm:"default:false"`
	CallOptIn  bool `json:"callOptIn" gorm:"default:true"`

	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`

	// Audit fields
	CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
	CreatedBy *string        `json:"createdBy"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`

	// Relationships
	Leads             []Lead             `json:"leads" gorm:"foreignKey:ContactID"`
	Deals             []Deal             `json:"deals" gorm:"foreignKey:ContactID"`
	Communications    []Communication    `json:"communications" gorm:"foreignKey:ContactID"`
	CustomFieldValues []CustomFieldValue `json:"customFieldValues" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`
	ActivityLogs      []ActivityLog      `json:"activityLogs" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`

	// Contact information (Polymorphic)
	PhoneNumbers        []PhoneNumber        `json:"phoneNumbers" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`
	EmailAddresses      []EmailAddress       `json:"emailAddresses" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`
	Addresses           []Address            `json:"addresses" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`
	SocialMediaAccounts []SocialMediaAccount `json:"socialMediaAccounts" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`
}
```

### Polymorphic Contact Information Models

#### PhoneNumber Model
```go
type PhoneNumber struct {
	ID        string  `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Number    string  `json:"number" gorm:"not null"`
	Extension *string `json:"extension"`
	IsPrimary bool    `json:"isPrimary" gorm:"default:false"`

	// Type relationship
	TypeID *string          `json:"typeId"`
	Type   *PhoneNumberType `json:"type" gorm:"foreignKey:TypeID"`

	// Polymorphic relationships
	EntityID   string `json:"entityId" gorm:"not null"`
	EntityType string `json:"entityType" gorm:"not null"` // 'Company', 'Contact', 'Lead', 'User'

	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`

	// Timestamps
	CreatedAt time.Time  `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time  `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt *time.Time `json:"deletedAt" gorm:"index"`
}
```

#### EmailAddress Model
```go
type EmailAddress struct {
	ID         string `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Email      string `json:"email" gorm:"not null"`
	IsPrimary  bool   `json:"isPrimary" gorm:"default:false"`
	IsVerified bool   `json:"isVerified" gorm:"default:false"`

	// Type relationship
	TypeID *string           `json:"typeId"`
	Type   *EmailAddressType `json:"type" gorm:"foreignKey:TypeID"`

	// Polymorphic relationships
	EntityID   string `json:"entityId" gorm:"not null"`
	EntityType string `json:"entityType" gorm:"not null"` // 'Company', 'Contact', 'Lead', 'User'

	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`

	// Timestamps
	CreatedAt time.Time  `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time  `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt *time.Time `json:"deletedAt" gorm:"index"`
}
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Current user info
- `POST /api/auth/refresh` - Token refresh

### CRM Core
- `GET /api/crm/companies` - List companies
- `POST /api/crm/companies` - Create company
- `GET /api/crm/companies/:id` - Get company
- `PUT /api/crm/companies/:id` - Update company
- `DELETE /api/crm/companies/:id` - Delete company

- `GET /api/crm/contacts` - List contacts
- `POST /api/crm/contacts` - Create contact
- `GET /api/crm/contacts/:id` - Get contact
- `PUT /api/crm/contacts/:id` - Update contact
- `DELETE /api/crm/contacts/:id` - Delete contact

- `GET /api/crm/leads` - List leads
- `POST /api/crm/leads` - Create lead
- `GET /api/crm/leads/:id` - Get lead
- `PUT /api/crm/leads/:id` - Update lead
- `DELETE /api/crm/leads/:id` - Delete lead

- `GET /api/crm/deals` - List deals
- `POST /api/crm/deals` - Create deal
- `GET /api/crm/deals/:id` - Get deal
- `PUT /api/crm/deals/:id` - Update deal
- `DELETE /api/crm/deals/:id` - Delete deal

### Lookup Data
- `GET /api/crm/lookups/industries` - List industries
- `GET /api/crm/lookups/company-sizes` - List company sizes
- `GET /api/crm/lookups/lead-statuses` - List lead statuses
- `GET /api/crm/lookups/lead-temperatures` - List lead temperatures
- `GET /api/crm/lookups/phone-number-types` - List phone number types
- `GET /api/crm/lookups/email-address-types` - List email address types

### System
- `GET /api/health` - Health check

## Docker Configuration

### Services
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: saleshub-postgres
    environment:
      POSTGRES_DB: sales_crm
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: Miyako2020
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d sales_crm"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: saleshub-backend
    environment:
      DATABASE_URL: postgresql://postgres:Miyako2020@postgres:5432/sales_crm?sslmode=disable
      JWT_SECRET: your-super-secret-jwt-key-here
      PORT: 8089
    ports:
      - "8089:8089"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - app-network
    profiles:
      - production

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: saleshub-frontend
    environment:
      NEXT_PUBLIC_API_URL: http://backend:8089
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - app-network
    profiles:
      - production
```

## Current Issues and Status

### Known Issues
1. **Company Phone Numbers/Email Addresses**: The companies API is not returning phone numbers and email addresses despite the data existing in the database
   - Status: Investigating polymorphic relationship loading
   - Impact: Frontend shows "--" for company contact information
   - Priority: High

### Recent Fixes
1. **Database Constraints**: Fixed foreign key constraints to allow companies to have phone numbers and email addresses
2. **Polymorphic Relationships**: Updated Company and Contact models with proper polymorphic relationship definitions
3. **Data Population**: Added phone numbers and email addresses to all existing companies

## Development Environment

### Ports
- **Frontend:** 3000 (Next.js development server)
- **Backend:** 8089 (Go API server)
- **Database:** 5432 (PostgreSQL)

### Environment Variables
- **Database URL:** postgresql://postgres:Miyako2020@localhost:5432/sales_crm
- **JWT Secret:** your-super-secret-jwt-key-here
- **API URL:** http://localhost:8089

## Security Features
1. **JWT Authentication**: All protected endpoints require valid JWT tokens
2. **Tenant Isolation**: Data is automatically filtered by tenant ID
3. **Input Validation**: All inputs are validated using struct tags and custom validation
4. **Rate Limiting**: API endpoints are protected with rate limiting
5. **CORS**: Cross-origin requests are properly configured

## Performance Considerations
1. **Pagination**: All list endpoints support pagination to handle large datasets
2. **Indexing**: Database indexes are created for frequently queried fields
3. **Preloading**: Relationships are preloaded to avoid N+1 query problems
4. **Multi-tenancy**: All queries are filtered by tenant ID for data isolation

## Startup Commands

### Development Mode
```bash
# Start database
docker-compose up postgres -d

# Start backend (from backend directory)
go run main.go

# Start frontend (from frontend directory)
npm run dev
```

### Production Mode
```bash
# Start all services
docker-compose --profile production up -d
```

## File Structure
```
saleshub/
├── backend/
│   ├── handlers/          # API handlers
│   ├── models/           # Database models
│   ├── middleware/       # Middleware functions
│   ├── config/          # Configuration files
│   └── main.go          # Entry point
├── frontend/
│   ├── src/
│   │   ├── app/         # Next.js app router pages
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utility functions
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Notes for Restart
1. **Database**: PostgreSQL data is persisted in Docker volume `postgres_data`
2. **Backend**: Go application with hot reload capability
3. **Frontend**: Next.js with Turbopack for fast development
4. **Environment**: All configuration is in environment files and docker-compose.yml
5. **Git State**: Clean working tree, 4 commits ahead of origin/main

This capture represents the exact state of the SalesHub CRM system as of August 19, 2025 at 02:48:55 AM HKT. All configurations, dependencies, and current issues are documented for accurate system restoration.
