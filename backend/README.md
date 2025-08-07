# SalesHub CRM Backend

A professional, scalable CRM backend API built with TypeScript, Node.js, Express, and Prisma.

## Features

- **🔐 Authentication & Authorization**: JWT-based authentication with role-based access control
- **📊 Comprehensive CRM Data Model**: Users, Companies, Contacts, Deals, Tasks, Calls, Notes, Messages
- **🔧 Extensible Schema**: JSON metadata fields for custom attributes
- **🛡️ Security**: Helmet, CORS, rate limiting, input validation
- **📝 TypeScript**: Full type safety and IntelliSense support
- **🗄️ PostgreSQL**: Robust database with Prisma ORM
- **✅ Validation**: Zod schema validation for all endpoints
- **📈 Pagination**: Built-in pagination for all list endpoints
- **🔍 Search & Filtering**: Advanced search and filtering capabilities

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 17
- **ORM**: Prisma
- **Authentication**: JWT
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Morgan

## Database Schema

### Core Entities

- **Users**: Authentication and user management
- **Companies**: Account/company management
- **Contacts**: Contact person management
- **Deals**: Sales opportunities and pipeline
- **Tasks**: Activity and task management
- **Calls**: Call tracking and outcomes
- **Notes**: Notes and comments
- **Messages**: Communication tracking

### Extensible Fields

All entities include `metadata` JSON fields for custom attributes:

```typescript
metadata?: Record<string, any>
```

This allows users to add custom fields without schema changes.

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 17
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/saleshub?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-here"
   PORT=3001
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed the database with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:8089`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Contacts
- `GET /api/contacts` - Get all contacts (with pagination/filtering)
- `GET /api/contacts/:id` - Get single contact
- `POST /api/contacts` - Create contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact
- `GET /api/contacts/:id/stats` - Get contact statistics

### Other Resources
- Companies: `/api/companies`
- Deals: `/api/deals`
- Tasks: `/api/tasks`
- Calls: `/api/calls`
- Notes: `/api/notes`
- Messages: `/api/messages`
- Dashboard: `/api/dashboard`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

### User Roles

- **ADMIN**: Full access to all features
- **SALES_MANAGER**: Access to team data and management features
- **SALES_REP**: Access to assigned contacts and deals

## Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with sample data

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run test         # Run tests
```

### Project Structure

```
src/
├── index.ts              # Main server file
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
│   ├── database.ts       # Database connection
│   └── auth.ts          # Authentication utilities
├── middleware/           # Express middleware
│   ├── auth.ts          # Authentication middleware
│   └── validation.ts    # Request validation
├── routes/              # API routes
│   ├── auth.ts          # Authentication routes
│   ├── contacts.ts      # Contact routes
│   └── ...              # Other resource routes
└── seed.ts              # Database seeding
```

## Database Seeding

The seed script creates sample data including:

- **Users**: Admin, Manager, and Sales Rep accounts
- **Companies**: Sample companies with different industries
- **Contacts**: Sample contacts with relationships
- **Deals**: Sample deals in different stages
- **Tasks**: Sample tasks with different priorities
- **Calls, Notes, Messages**: Sample communication data

### Default Credentials

After seeding, you can login with:

- **Admin**: `admin@saleshub.com` / `Admin123!`
- **Manager**: `manager@saleshub.com` / `Manager123!`
- **Rep**: `rep@saleshub.com` / `Rep123!`

## API Response Format

All API responses follow a consistent format:

```typescript
{
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}
```

### Pagination

List endpoints return paginated responses:

```typescript
{
  success: true;
  data: {
    data: T[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }
  }
}
```

## Error Handling

The API includes comprehensive error handling:

- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (resource not found)
- **500**: Internal Server Error

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Zod schema validation
- **Rate Limiting**: Configurable rate limiting
- **CORS**: Cross-origin resource sharing
- **Helmet**: Security headers
- **SQL Injection Protection**: Prisma ORM

## Extensibility

### Adding Custom Fields

Use the `metadata` JSON field to add custom attributes:

```typescript
// Example: Adding custom fields to a contact
const contact = await prisma.contact.create({
  data: {
    firstName: "John",
    lastName: "Doe",
    metadata: {
      customField1: "value1",
      customField2: "value2",
      preferences: {
        newsletter: true,
        notifications: false
      }
    }
  }
});
```

### Adding New Resources

1. Add the model to `prisma/schema.prisma`
2. Create types in `src/types/index.ts`
3. Create validation schemas in `src/middleware/validation.ts`
4. Create routes in `src/routes/`
5. Add route to `src/index.ts`

## Production Deployment

### Environment Variables

Required for production:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="very-long-secret-key"
NODE_ENV="production"
PORT=8089
CORS_ORIGIN="https://yourdomain.com"
```

### Build and Deploy

```bash
npm run build
npm start
```

## Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Include input validation
4. Write tests for new features
5. Update documentation

## License

MIT License 