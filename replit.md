# API Management System

## Overview

This is a full-stack API Management System built with a modern tech stack that allows users to manage, test, and monitor APIs through a comprehensive dashboard. The application provides real-time monitoring, testing capabilities, and detailed analytics for API endpoints.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript and Vite for fast development
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Tailwind CSS with shadcn/ui component library (New York style)
- **State Management**: React Query (TanStack Query) for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Styling**: CSS variables for theming support with dark/light mode

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful API with proper HTTP status codes
- **Middleware**: Custom logging, error handling, and authentication middleware
- **Real-time Communication**: WebSocket support for live updates

### Database Architecture
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (configured for Neon Database)
- **Connection**: Connection pooling with @neondatabase/serverless
- **Migrations**: Drizzle Kit for schema management

## Key Components

### Authentication System
- **Provider**: Replit Authentication with OpenID Connect
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **Security**: JWT tokens, secure cookies, and role-based access control
- **User Management**: User profiles with metadata storage

### API Management Core
- **CRUD Operations**: Full API endpoint management (Create, Read, Update, Delete)
- **API Testing**: Built-in API testing with response time tracking
- **Status Management**: API status tracking (active, inactive, maintenance)
- **Categorization**: API grouping and organization
- **Version Control**: API versioning support

### Monitoring & Analytics
- **Real-time Monitoring**: WebSocket-based live updates
- **Performance Metrics**: Response time tracking, uptime monitoring
- **Health Checks**: Automated API health verification
- **Historical Data**: API statistics and trends storage
- **Dashboard Analytics**: Comprehensive dashboard with charts and metrics

### Testing Framework
- **API Testing**: Built-in API client for testing endpoints
- **Test Results**: Historical test result storage and analysis
- **Automated Testing**: Scheduled API health checks
- **Response Validation**: HTTP status code and response time validation

## Data Flow

1. **User Authentication**: Users authenticate via Replit OAuth, creating persistent sessions
2. **API Management**: Users create and manage API endpoints through the dashboard
3. **Real-time Updates**: WebSocket connections provide live status updates
4. **Testing Pipeline**: APIs are tested either manually or automatically, with results stored
5. **Analytics Processing**: Performance data is aggregated for dashboard display
6. **Data Persistence**: All data flows through Drizzle ORM to PostgreSQL

## External Dependencies

### Frontend Dependencies
- **UI Components**: Extensive Radix UI primitives for accessible components
- **Charts**: Recharts for data visualization
- **Utilities**: Date-fns for date handling, clsx for conditional styling
- **Development**: Vite plugins for development experience

### Backend Dependencies
- **Database**: Neon PostgreSQL with WebSocket support
- **Authentication**: OpenID Client for Replit authentication
- **Session Storage**: PostgreSQL session store
- **Utilities**: Memoization, validation with Zod

### Development Tools
- **Build Tools**: Vite for frontend, esbuild for backend bundling
- **Type Safety**: TypeScript throughout the stack
- **Code Quality**: Consistent import paths and modular architecture

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite HMR for frontend, tsx for backend development
- **Environment Variables**: DATABASE_URL, session secrets, REPL_ID configuration
- **Development Server**: Integrated Vite middleware with Express

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations ensure schema consistency
- **Process Management**: Single Node.js process serving both API and static files

### Database Management
- **Schema Evolution**: Drizzle migrations in `./migrations` directory
- **Connection Management**: Connection pooling for production scalability
- **Data Validation**: Zod schemas ensure data integrity at the application level

The application is designed to be deployed on Replit with automatic environment provisioning, but can be adapted for other platforms with PostgreSQL support.