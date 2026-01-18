# Bazaary

Bazaary is a full-stack e-commerce platform for buyers, sellers, and admins. It features a modern frontend, robust backend, and a suite of supporting services, all orchestrated with Docker Compose for easy local development.

## Features
- User authentication and authorization (JWT)
- Product catalog with search (Meilisearch)
- Seller onboarding and product listing
- Shopping cart, checkout, and order management
- Payment processing and wallet system
- Admin dashboard for platform management
- Real-time notifications
- Analytics and reporting

## Tech Stack
- **Frontend:** Next.js 15+ (React 19, TypeScript), Framer Motion, Tailwind CSS 4
- **Backend:** NestJS (Event-Driven Architecture)
- **Database:** PostgreSQL (TypeORM), MongoDB (Mongoose)
- **Cache/Queue:** Redis (ioredis), BullMQ
- **Real-time:** Socket.io (WebSockets)
- **Object Storage:** MinIO/Cloudinary
- **Search:** Meilisearch

## 💎 Why Bazaary? (Interview Highlights)
1. **Event-Driven Architecture**: Uses an internal event bus to decouple Order, Inventory, and Wallet modules.
2. **Real-Time Ledger System**: Features a locked/available fund mechanism similar to major platforms (Upwork/Amazon), ensuring transaction safety.
3. **High-End UI/UX**: Custom design system with glassmorphism, fluid animations (Framer Motion), and mesh gradients.
4. **Scalable Search**: Instant search-as-you-type powered by Meilisearch.
5. **Real-time Synchronization**: WebSockets provide live status updates for orders and wallet balances.

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

## Local Development Setup

### Prerequisites
- Docker Desktop
- Node.js (v18+ recommended)
- npm

### 1. Clone the Repository
```
git clone <your-repo-url>
cd bazaary
```

### 2. Start Services with Docker Compose
```
docker-compose up --build
```
This will start PostgreSQL, MongoDB, Redis, MinIO, and Meilisearch.

### 3. Backend Setup
```
cd backend
npm install
npm run build
npm run start:prod
```
- Configure environment variables in `backend/.env` (already provided for local Docker setup).

### 4. Frontend Setup
```
cd frontend
npm install
npm run build
npm start
```
- Configure environment variables in `frontend/.env.local` (already provided for local Docker setup).

### 5. Access the Application
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:3001](http://localhost:3001)

## Environment Variables
- All required variables are listed in `backend/.env` and `frontend/.env.local`.
- Update values as needed for your environment.

## Deployment
- For local development, use Docker Compose as above.
- For cloud deployment, deploy frontend to Vercel and backend to Render/Railway, and use managed DBs (see project docs for details).

## Demo & Screenshots
_Add screenshots or a link to a demo video here._

## Contributing
1. Fork the repo
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License
MIT

---

> **Tip:** For interviews, be ready to run the project locally and explain the architecture, features, and code. A live deployment is a plus, but not required.
