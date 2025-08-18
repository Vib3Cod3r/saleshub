# SalesHub CRM

A modern, AI-enabled sales and inbound marketing CRM built to compete with Salesforce and HubSpot.

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 15.4.6 with App Router
- **React**: 19.1.0
- **TypeScript**: ^5 (strict mode)
- **Styling**: Tailwind CSS ^4 + shadcn/ui
- **State Management**: TanStack React Query ^5.84.1
- **UI Components**: Headless UI, Lucide React, Heroicons
- **Development Port**: 3000

### Backend
- **Language**: Go 1.21+
- **Framework**: Gin ^1.9.1
- **ORM**: GORM ^1.25.5
- **Database**: PostgreSQL 15
- **Authentication**: JWT with bcrypt
- **Development Port**: 8089

### Database
- **Provider**: PostgreSQL 15-alpine
- **Port**: 5432
- **Database Name**: sales_crm
- **Username**: postgres
- **Password**: Miyako2020

## 📁 Project Structure

```
saleshub/
├── frontend/          # Next.js frontend application
├── backend/           # Go backend API
├── docker-compose.yml # Development environment
└── README.md
```

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+
- Go 1.21+
- Docker & Docker Compose
- PostgreSQL 15

### 1. Clone and Setup
```bash
git clone <repository-url>
cd saleshub
```

### 2. Start Development Environment
```bash
# Start PostgreSQL database
docker-compose up -d postgres

# Wait for database to be ready, then run migrations
cd backend
go run cmd/migrate/main.go
```

### 3. Start Backend
```bash
cd backend
go mod download
go run cmd/server/main.go
```

### 4. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8089
- **Database**: localhost:5432

## 🔐 Authentication

The application uses JWT-based authentication with the following endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

## 📊 Database Schema

The CRM includes comprehensive data models for:

- **User Management**: Users, roles, permissions
- **Companies & Contacts**: Organizations and people
- **Leads**: Lead management with scoring and status tracking
- **Deals**: Sales pipeline and opportunity management
- **Marketing**: Sources, assets, and campaign tracking
- **Communications**: Email, phone, and activity tracking
- **Tasks**: Workflow and task management
- **Custom Fields**: Extensible data model

## 🎨 UI Design

The application features a modern, clean interface with:
- Dark purple header and sidebar
- White content area
- Search functionality
- Comprehensive navigation menu
- Responsive design

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### AWS Deployment
The application is designed for AWS deployment with:
- ECS/Fargate for containerized services
- RDS for PostgreSQL
- ALB for load balancing
- CloudFront for CDN

## 🔧 Development

### Backend Development
```bash
cd backend
go run cmd/server/main.go
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Database Migrations
```bash
cd backend
go run cmd/migrate/main.go
```

## 📝 API Documentation

The backend provides RESTful APIs for all CRM functionality:

- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Companies**: `/api/companies/*`
- **Contacts**: `/api/contacts/*`
- **Leads**: `/api/leads/*`
- **Deals**: `/api/deals/*`
- **Marketing**: `/api/marketing/*`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.
=======
