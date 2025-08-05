# Sales CRM Application

A comprehensive sales-driven CRM platform built with Node.js, Express, PostgreSQL, Prisma, and vanilla JavaScript. This application is designed to optimize sales team performance, enhance pipeline visibility, and drive predictable revenue growth.

## 🚀 Features

### Core Capabilities
- **End-to-End Lead & Contact Management**: Capture, create, and enrich leads from various sources with complete relationship history
- **Communication Tracking**: Seamless tracking of emails, calls, and meetings throughout the customer lifecycle
- **Visual Sales Pipeline**: Drag-and-drop, stage-based pipeline mapping opportunities across all sales stages
- **Sales Forecasting & Dashboards**: Real-time dashboards for revenue forecasting and team performance visualization

### Sales Pipeline Stages
1. New Lead → Qualified → Contacted → Meeting/Demo Set → Proposal/Negotiation → Decision Maker Bought In → Contract Sent → Closed Deal

### User Roles
- **Administrator**: Full system access and user management
- **Sales Manager**: Team oversight, reporting, and all sales operations
- **Sales Representative**: Personal pipeline and customer management

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js framework
- **PostgreSQL** database
- **Prisma** ORM for database management
- **JWT** for authentication
- **bcryptjs** for password hashing

### Frontend
- **HTML5** with semantic markup
- **CSS3** with modern styling and responsive design
- **Vanilla JavaScript** (ES6+)
- **Chart.js** for data visualization
- **SortableJS** for drag-and-drop functionality

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone <repository-url>
cd sales-crm
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/sales_crm"

# JWT Secret (use a strong, random string)
JWT_SECRET="your-super-secret-jwt-key-here"

# Server Configuration
PORT=3000
NODE_ENV=development

# Optional: Email Configuration (for future email integration)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 4. Database Setup

#### Create PostgreSQL Database
```sql
CREATE DATABASE sales_crm;
```

#### Generate Prisma Client
```bash
npm run db:generate
```

#### Run Database Migrations
```bash
npm run db:push
```

#### Seed Initial Data
```bash
npm run db:seed
```

### 5. Start the Application

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The application will be available at `http://localhost:3000`

## 👥 Default User Accounts

After seeding the database, you can log in with these test accounts:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Admin | admin@salescrm.com | admin123 | Full system access |
| Sales Manager | manager@salescrm.com | manager123 | Team management and reporting |
| Sales Rep | rep@salescrm.com | rep123 | Individual sales operations |

## 📱 Application Structure

### Backend API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

#### Dashboard
- `GET /api/dashboard/overview` - Dashboard metrics
- `GET /api/dashboard/revenue-chart` - Revenue chart data
- `GET /api/dashboard/recent-sales` - Recent sales list
- `GET /api/dashboard/pipeline-metrics` - Pipeline statistics

#### Contacts
- `GET /api/contacts` - List contacts with pagination
- `POST /api/contacts` - Create new contact
- `GET /api/contacts/:id` - Get contact details
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

#### Deals
- `GET /api/deals` - List deals with pagination
- `POST /api/deals` - Create new deal
- `GET /api/deals/:id` - Get deal details
- `PUT /api/deals/:id` - Update deal
- `PATCH /api/deals/:id/stage` - Update deal stage
- `DELETE /api/deals/:id` - Delete deal
- `GET /api/deals/pipeline` - Get pipeline view

#### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/complete` - Mark task complete
- `DELETE /api/tasks/:id` - Delete task

#### Communications
- `GET /api/communications` - List communications
- `POST /api/communications` - Create new communication
- `GET /api/communications/:id` - Get communication details
- `PUT /api/communications/:id` - Update communication
- `DELETE /api/communications/:id` - Delete communication

### Frontend Pages

1. **Dashboard** - Overview metrics, revenue charts, recent sales
2. **Contacts** - Lead and contact management with filtering
3. **Deals** - Deal management with detailed views
4. **Pipeline** - Visual drag-and-drop sales pipeline
5. **Tasks** - Task management and organization
6. **Communications** - Communication logging and tracking
7. **Settings** - User preferences and system configuration

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with desktop optimization
- **Dark Theme Ready**: CSS variables for easy theme switching
- **Intuitive Navigation**: Sidebar navigation with active state indicators
- **Real-time Updates**: Automatic data refresh and live notifications
- **Drag & Drop**: Interactive pipeline management
- **Advanced Filtering**: Search and filter across all data types
- **Modal System**: Consistent modal dialogs for forms and details

## 📊 Database Schema

The application uses a comprehensive database schema with the following main entities:

- **Users**: Authentication and role management
- **Contacts**: Lead and customer information
- **Deals**: Sales opportunities and pipeline tracking
- **Tasks**: Activity and follow-up management
- **Communications**: Interaction history and logging

Key relationships:
- Users can be assigned multiple contacts and deals
- Contacts can have multiple deals and communications
- Deals track progression through pipeline stages
- All entities support comprehensive audit trails

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Granular permissions by user role
- **Password Hashing**: bcrypt with salt rounds for security
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: API protection against abuse
- **CORS Configuration**: Secure cross-origin resource sharing

## 🚀 Development

### Available Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Generate Prisma client
npm run db:generate

# Push database schema changes
npm run db:push

# Run database migrations
npm run db:migrate

# Seed database with initial data
npm run db:seed
```

### Adding New Features

1. **Backend**: Add new routes in `routes/` directory
2. **Frontend**: Create new modules in `public/js/` directory
3. **Database**: Update schema in `prisma/schema.prisma`
4. **Styles**: Add CSS to `public/css/styles.css`

## 📈 Performance Considerations

- **Database Indexing**: Optimized queries with proper indexing
- **Pagination**: Efficient data loading with pagination
- **Caching**: Strategic caching for frequently accessed data
- **Minification**: Production-ready asset optimization
- **Lazy Loading**: On-demand module loading

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints and database schema

## 🔄 Future Enhancements

- **Email Integration**: Direct email sending and receiving
- **Calendar Sync**: Integration with calendar applications
- **Advanced Reporting**: Detailed analytics and custom reports
- **Mobile App**: Native mobile applications
- **Third-party Integrations**: CRM, marketing tools, and more
- **Advanced Automation**: Workflow automation and triggers
- **Multi-language Support**: Internationalization features

---

Built with ❤️ for sales teams who want to close more deals and grow their business.