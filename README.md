# 🛍️ Bazaary - Premium E-commerce Platform

Bazaary is an **enterprise-grade, full-stack e-commerce platform** designed for buyers, sellers, and admins. Built with **production-ready architecture**, **premium UI/UX design**, and **comprehensive security features**, it showcases modern web development best practices.

## 🚀 **Production Status: READY**
- ✅ **Backend**: Robust API with health monitoring, security hardening, and event processing
- ✅ **Frontend**: Premium UI/UX with modern design system and responsive layouts  
- ✅ **Testing**: Comprehensive coverage including build validation and API testing
- ✅ **Security**: Production-grade security headers, JWT authentication, and rate limiting

## 🌟 Core Features
- 🔐 **Advanced Authentication & Authorization** (JWT with refresh tokens)
- 🔍 **Intelligent Product Search** (Meilisearch with instant results)
- 👥 **Multi-Role Dashboard System** (Buyer, Seller, Admin interfaces)
- 🛒 **Complete E-commerce Flow** (Cart, checkout, order management)
- 💳 **Integrated Payment Processing** (Stripe with webhook handling)
- 💰 **Real-time Wallet System** (Locked/available funds mechanism)
- 📊 **Admin Analytics Dashboard** (Platform management and monitoring)
- 🔔 **Real-time Notifications** (WebSocket-powered updates)
- 🏥 **Health Monitoring System** (Production-ready monitoring endpoints)

## 🛠️ Tech Stack

### **Frontend Architecture**
- **Framework**: Next.js 16+ (React 19, TypeScript)
- **Styling**: Tailwind CSS v4, Custom Design System
- **Animation**: Framer Motion, CSS Transitions
- **UI Components**: Custom Component Library (TypeScript-safe)
- **State Management**: React Context, Custom Hooks
- **Design System**: Glass morphism, Premium animations, Mesh gradients

### **Backend Architecture**  
- **Framework**: NestJS 11+ (Event-Driven Architecture)
- **Security**: Helmet, JWT, Rate Limiting, CORS Protection
- **Monitoring**: Custom Health Check System (@nestjs/terminus)
- **Documentation**: Auto-generated API specs
- **Error Handling**: Global exception filters with logging
- **Processing**: Event bus with error recovery mechanisms

### **Database & Storage**
- **Primary Database**: PostgreSQL (TypeORM with migrations)
- **Document Store**: MongoDB (Mongoose for catalog data)
- **Cache/Queue**: Redis (ioredis), BullMQ for job processing
- **Search Engine**: Meilisearch (instant search-as-you-type)
- **File Storage**: MinIO (S3-compatible) / Cloudinary

### **DevOps & Infrastructure**
- **Containerization**: Docker Compose for local development
- **Environment**: Production-grade environment validation
- **Testing**: Comprehensive build and API testing
- **Monitoring**: Health endpoints for Kubernetes readiness/liveness probes
- **Real-time**: Socket.io (WebSockets for live updates)

## 💎 Why Bazaary? (Production Highlights)

### **🏗️ Enterprise Architecture**
1. **Event-Driven Architecture**: Decoupled microservice-style modules with internal event bus
2. **Production Security**: Helmet security headers, JWT authentication, rate limiting, CORS protection
3. **Health Monitoring**: Comprehensive health check system with PostgreSQL, MongoDB, Redis monitoring
4. **Graceful Error Handling**: Global exception filters, logging interceptors, and recovery mechanisms

### **🎨 Premium User Experience** 
5. **Modern Design System**: Glass morphism effects, premium animations, and mesh gradient backgrounds
6. **Component Library**: TypeScript-safe, reusable UI components with consistent design patterns
7. **Responsive Dashboards**: Professional buyer, seller, and admin interfaces with real-time updates
8. **Loading States**: Skeleton screens, shimmer effects, and comprehensive empty state management

### **🔧 Developer Experience**
9. **Type Safety**: Full TypeScript coverage with proper interfaces and error handling
10. **Build Validation**: Comprehensive testing including frontend/backend builds and API validation
11. **Environment Validation**: Production-grade environment variable validation with detailed error messages
12. **Health Endpoints**: Kubernetes-ready `/health`, `/health/ready`, and `/health/live` endpoints

### **⚡ Performance & Scalability**
13. **Real-Time Ledger System**: Locked/available fund mechanism similar to major platforms (Upwork/Amazon)
14. **Instant Search**: Meilisearch-powered search-as-you-type with millisecond response times
15. **Event Processing**: Background job processing with error recovery and consecutive error limits
16. **WebSocket Sync**: Real-time order status and wallet balance updates

## Project Structure

```
├── backend/                  # NestJS API server (business logic, REST APIs)
│   ├── src/
│   │   ├── app.module.ts     # Main NestJS module
│   │   ├── main.ts           # Entry point
│   │   ├── modules/          # Feature modules (auth, products, orders, etc.)
│   │   ├── config/           # Configuration files (DB, Redis, etc.)
│   │   ├── database/         # Entities, migrations, seeds
│   │   ├── common/           # Shared decorators, guards, filters, etc.
│   │   └── lib/              # Library code (e.g., Meilisearch client)
│   ├── scripts/              # Shell/TS scripts for seeding, testing, admin
│   ├── .env                  # Backend environment variables
│   ├── package.json          # Backend dependencies and scripts
│   └── ...                   # Other config files (tsconfig, eslint, etc.)
│
├── frontend/                 # Next.js web app (UI, SSR, API routes)
│   ├── app/                  # App directory (routing, pages, layouts)
│   ├── components/           # Reusable React components
│   ├── lib/                  # API clients, auth, cart logic, etc.
│   ├── public/               # Static assets (images, manifest)
│   ├── .env.local            # Frontend environment variables
│   ├── package.json          # Frontend dependencies and scripts
│   └── ...                   # Other config files (tsconfig, postcss, etc.)
│
├── docker-compose.yml        # Orchestrates all services (DBs, Redis, MinIO, Meilisearch)
├── docs/                     # API contracts, project overview, documentation
├── README.md                 # Project documentation (this file)
└── ...                       # Other root-level files (project details, scripts)
```

### Key Folders Explained
- **backend/src/modules/**: Each subfolder is a feature module (e.g., auth, products, orders, users, sellers, payments, wallets, analytics, etc.).
- **backend/src/database/entities/**: TypeORM entities for all main data models.
- **backend/scripts/**: Scripts for seeding, admin registration, manual tests, etc.
- **frontend/app/**: Next.js app directory with routes for buyers, sellers, admin, and public pages.
- **frontend/components/**: UI components like Navbar, ProductCard, AddToCartButton, etc.
- **frontend/lib/api/**: API client code for interacting with backend endpoints.
- **docs/**: API contracts, project overview, and other documentation.

## 🚀 Local Development Setup

### Prerequisites
- **Docker Desktop** (for services orchestration)
- **Node.js v18+** (recommended: v20+)
- **npm** (comes with Node.js)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd bazaary
```

### 2. Start Supporting Services
```bash
docker-compose up -d postgres mongodb redis minio meilisearch
```
This starts all required services in detached mode.

### 3. Backend Setup & Testing
```bash
cd backend
npm install

# Test backend build
npm run build

# Start development server
npm run start:dev

# Verify health endpoints
curl http://localhost:3001/api/health
curl http://localhost:3001/api/health/ready  
curl http://localhost:3001/api/health/live
```

### 4. Frontend Setup & Testing  
```bash
cd frontend
npm install

# Test frontend build (production-ready)
npm run build

# Start development server
npm run dev
```

### 5. Access the Application ✨
- **Frontend UI**: [http://localhost:3000](http://localhost:3000) _(Premium design interface)_
- **Backend API**: [http://localhost:3001](http://localhost:3001) _(Robust API with monitoring)_
- **Health Monitoring**: [http://localhost:3001/api/health](http://localhost:3001/api/health)
- **API Documentation**: Available via `/api` endpoints

### 6. Test Different Dashboards
- **Buyer Dashboard**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- **Seller Dashboard**: [http://localhost:3000/seller](http://localhost:3000/seller)  
- **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)

## 🏥 Health Monitoring & Testing

### **Health Endpoints (Production-Ready)**
```bash
# Comprehensive health check with service status
GET /api/health
# Returns: PostgreSQL, MongoDB, Redis, MeiliSearch status with response times

# Kubernetes readiness probe  
GET /api/health/ready
# Returns: {"ready": true, "services": ["postgres", "mongodb", "redis"]}

# Kubernetes liveness probe
GET /api/health/live  
# Returns: {"alive": true, "uptime": 123.45}
```

### **Testing Capabilities**
- ✅ **Build Validation**: Both frontend and backend compile successfully
- ✅ **TypeScript Safety**: Full type checking with zero compilation errors
- ✅ **API Testing**: Authentication, product catalog, and health endpoint validation
- ✅ **UI Testing**: All dashboard interfaces render correctly  
- ✅ **Security Testing**: JWT protection and CORS validation
- ✅ **Database Connectivity**: PostgreSQL, MongoDB, and Redis connection verification

### **Development Validation Commands**
```bash
# Test backend compilation
cd backend && npm run build

# Test frontend compilation  
cd frontend && npm run build

# Test API endpoints
curl http://localhost:3001/api/health
curl http://localhost:3001/api/products
curl http://localhost:3001/api/auth/me  # Should return 401 without auth
```

## 🔧 Environment Configuration

### **Backend Environment Variables**
All required variables are configured in `backend/.env`:
- Database connections (PostgreSQL, MongoDB, Redis)
- Security settings (JWT secrets, CORS origins)
- External APIs (Stripe, MeiliSearch)
- File storage configuration (MinIO)
- Monitoring and logging settings

### **Frontend Environment Variables**  
Configured in `frontend/.env.local`:
- Backend API URL configuration
- Public API keys and endpoints
- Feature flags and development settings

> **Note**: All environment files are pre-configured for local development. Update values for production deployment.

## 🚀 Production Deployment

### **Backend Deployment (Render/Railway)**
- Build Command: `npm run build`
- Start Command: `npm run start:prod`  
- Health Check: `/api/health/ready`
- Environment: Configure all `.env` variables in platform dashboard

### **Frontend Deployment (Vercel)**
- Framework: Next.js (auto-detected)
- Build Command: `npm run build`
- Environment: Configure `.env.local` variables in Vercel dashboard
- Domain: Auto-SSL with custom domain support

### **Database Services**
- **PostgreSQL**: Use managed services (Railway, Supabase, etc.)
- **MongoDB**: MongoDB Atlas or managed MongoDB
- **Redis**: Redis Cloud or managed Redis services
- **Search**: MeiliSearch Cloud or self-hosted MeiliSearch

## 📸 Key Features Showcase

### **🎨 Modern UI/UX Design**
- Premium glass morphism effects with backdrop blur
- Responsive grid layouts with professional spacing
- Smooth animations and hover effects
- Consistent design system across all interfaces
- Loading states and empty state management

### **🔒 Enterprise Security**
- Production-grade security headers (Helmet)
- JWT authentication with refresh token support
- Rate limiting (120 requests/minute)
- CORS protection with environment-based origins
- Global exception handling with detailed logging

### **📊 Professional Dashboards**
- **Buyer Interface**: Clean product browsing with cart management
- **Seller Interface**: Business metrics with order management tools  
- **Admin Interface**: Platform oversight with system health monitoring
- Real-time updates via WebSocket connections

## 🛠️ Development Workflow

### **Code Quality Standards**
- Full TypeScript coverage with strict type checking
- ESLint configuration with auto-formatting
- Consistent code structure across frontend/backend
- Environment validation with detailed error messages
- Production-ready error handling and logging

### **Performance Optimizations**
- Next.js 16 with optimized bundling and caching
- Database query optimization with proper indexing  
- Redis caching for frequently accessed data
- Compression middleware for reduced payload sizes
- Background job processing with BullMQ

## 📋 API Documentation

### **Authentication Endpoints**
```
POST /api/auth/login     # User authentication
GET  /api/auth/me        # Get current user (protected)
POST /api/auth/logout    # User logout
POST /api/auth/refresh   # Refresh JWT token
```

### **Product & Catalog**
```
GET  /api/products       # Browse product catalog  
GET  /api/products/:id   # Get product details
GET  /api/search         # Search products (MeiliSearch)
```

### **Health & Monitoring**
```
GET  /api/health         # Comprehensive system health
GET  /api/health/ready   # Readiness probe (K8s)
GET  /api/health/live    # Liveness probe (K8s)
```

## 🎯 Demo & Testing

### **Live Testing Instructions**
1. **Clone & Start**: Follow setup instructions above
2. **Health Check**: Visit `http://localhost:3001/api/health`
3. **Browse Products**: Navigate to `http://localhost:3000`  
4. **Test Dashboards**: Access buyer/seller/admin interfaces
5. **API Testing**: Use provided curl commands

### **Production Readiness Checklist**
- ✅ **Security**: Helmet, JWT, Rate limiting, CORS
- ✅ **Monitoring**: Health checks, logging, error handling  
- ✅ **Performance**: Caching, compression, optimizations
- ✅ **Scalability**: Event-driven architecture, job queues
- ✅ **Testing**: Build validation, API testing, UI verification
- ✅ **Documentation**: Comprehensive README, API specs

## 🤝 Contributing

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/AmazingFeature`)
3. **Follow** TypeScript and ESLint standards
4. **Test** your changes with `npm run build`
5. **Commit** your changes (`git commit -m 'Add AmazingFeature'`)
6. **Push** to the branch (`git push origin feature/AmazingFeature`)
7. **Open** a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🎉 **Project Status: PRODUCTION-READY**

> **🚀 Interview Ready**: This project demonstrates enterprise-level architecture, security best practices, modern UI/UX design, and comprehensive testing. All features are fully functional with production-grade monitoring and error handling.

**Quick Start**: `docker-compose up -d` → `cd backend && npm run start:dev` → `cd frontend && npm run dev`

**Health Check**: [http://localhost:3001/api/health](http://localhost:3001/api/health) | **Live Demo**: [http://localhost:3000](http://localhost:3000)
