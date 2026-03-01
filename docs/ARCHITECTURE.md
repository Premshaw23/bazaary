# 🏗️ Bazaary - System Architecture

## Overview
Bazaary is an enterprise-grade e-commerce platform built with a modern tech stack, featuring real-time capabilities, advanced search, and a robust wallet/escrow system.

---

## 🎯 Core Architecture Principles

### 1. **Event-Driven Architecture**
- **Event Sourcing**: All critical business operations (orders, payments, wallet transactions) are recorded as immutable events in MongoDB.
- **Event Processor**: Background service processes events asynchronously, ensuring eventual consistency.
- **Benefits**: Audit trail, temporal queries, easy debugging, and the ability to replay events.

### 2. **Microservice-Ready Design**
- **Modular Structure**: Each domain (Auth, Orders, Wallets, Products) is isolated in its own module.
- **Clear Boundaries**: Services communicate through well-defined interfaces.
- **Scalability**: Individual modules can be extracted into separate services as needed.

### 3. **Real-Time First**
- **WebSocket Gateway**: Socket.io for instant notifications.
- **Live Updates**: Order status changes, wallet updates, and system notifications are pushed to clients immediately.

---

## 📊 Technology Stack

### Backend (NestJS)
```
├── Core Framework: NestJS (Node.js + TypeScript)
├── Databases:
│   ├── PostgreSQL (TypeORM) - Relational data (Users, Products, Orders)
│   └── MongoDB (Mongoose) - Event Store
├── Cache & Queue:
│   ├── Redis - Session storage, caching
│   └── BullMQ - Background job processing
├── Search: Meilisearch - Fast, typo-tolerant search
├── Storage: MinIO - S3-compatible object storage
└── Real-time: Socket.io - WebSocket connections
```

### Frontend (Next.js)
```
├── Framework: Next.js 14 (App Router)
├── Language: TypeScript
├── Styling: Tailwind CSS + Custom Design System
├── State Management:
│   ├── React Context (Auth, Cart)
│   └── React Hook Form + Zod (Forms)
├── UI Components: Headless UI + Framer Motion
└── Notifications: Sonner (Toast)
```

---

## 🔐 Authentication & Authorization

### Flow
1. **Registration/Login** → Backend validates credentials
2. **JWT Generation** → Signed with secret, 7-day expiry
3. **Cookie Storage** → HttpOnly cookie (`access_token`)
4. **Request Authentication** → JWT Strategy extracts token from cookie or Bearer header
5. **Role-Based Access** → Guards check user role (BUYER, SELLER, ADMIN)

### Security Features
- **Rate Limiting**: 5 login attempts per minute per IP (Throttler)
- **Password Hashing**: bcrypt with salt rounds
- **HttpOnly Cookies**: Prevents XSS attacks
- **CORS Protection**: Configured for specific origins
- **Input Validation**: Class-validator DTOs + Zod schemas

---

## 💰 Wallet & Escrow System

### The Problem
In e-commerce, buyers need protection (what if the seller doesn't ship?), and sellers need assurance (what if the buyer disputes after receiving?).

### Our Solution: Event-Driven Escrow

#### 1. **Order Placement**
```
User places order → OrderCreatedEvent
  ↓
Event Processor reads event
  ↓
Deducts from Buyer's wallet (DEBIT)
  ↓
Creates Ledger entry (LOCKED)
```

#### 2. **Funds Locking**
- Buyer's money is **locked** in the system (not with the seller yet).
- Seller sees "Pending Funds" but cannot withdraw.

#### 3. **Order Fulfillment**
```
Seller marks as SHIPPED → OrderShippedEvent
  ↓
Buyer confirms delivery → OrderDeliveredEvent
  ↓
Event Processor releases funds
  ↓
Credits Seller's wallet (CREDIT)
  ↓
Updates Ledger (RELEASED)
```

#### 4. **Automatic Release (Cron Job)**
- **Scenario**: Buyer doesn't confirm delivery.
- **Solution**: Cron job runs daily, auto-releases funds after 7 days.
- **Implementation**: `WalletCronService` checks `locked_until` timestamps.

#### 5. **Real-Time Notifications**
- When funds are released, seller receives instant WebSocket notification.
- Toast appears: "💰 Funds Released: $50.00 from Order #1234"

### Database Schema
```sql
-- Wallets (PostgreSQL)
CREATE TABLE wallets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  balance DECIMAL(10,2) DEFAULT 0,
  locked_balance DECIMAL(10,2) DEFAULT 0
);

-- Ledger Entries (PostgreSQL)
CREATE TABLE ledger_entries (
  id UUID PRIMARY KEY,
  wallet_id UUID REFERENCES wallets(id),
  amount DECIMAL(10,2),
  type ENUM('CREDIT', 'DEBIT'),
  status ENUM('PENDING', 'LOCKED', 'RELEASED', 'COMPLETED'),
  locked_until TIMESTAMP,
  order_id UUID REFERENCES orders(id)
);

-- Events (MongoDB)
{
  _id: ObjectId,
  type: "ORDER_CREATED",
  aggregateId: "order-uuid",
  payload: { orderId, buyerId, sellerId, amount },
  timestamp: ISODate,
  processed: false
}
```

---

## 🔍 Search Architecture (Meilisearch)

### Why Meilisearch?
- **Typo Tolerance**: "iPhne" finds "iPhone"
- **Fast**: Sub-50ms response times
- **Ranking**: Relevance-based sorting
- **Filters**: Price range, category, seller

### Implementation
1. **Indexing**: Products are indexed on creation/update via `MeiliHelper`.
2. **Search Endpoint**: `/api/search?q=laptop&minPrice=500`
3. **Frontend**: Debounced input (300ms) → API call → Display results
4. **Keyboard Shortcut**: `Cmd/Ctrl + K` opens search overlay

---

## 🚀 Background Jobs (BullMQ)

### Queues
1. **Mail Queue**
   - Welcome emails on registration
   - Order confirmation emails
   - Shipping notifications

2. **Analytics Queue**
   - Daily seller stats aggregation
   - Metrics: Total orders, fulfillment rate, return rate, avg. fulfillment time

### Cron Jobs
```typescript
@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
async dispatchAnalyticsJobs() {
  const sellers = await this.sellersService.findAll({ lifecycleState: ACTIVE });
  for (const seller of sellers) {
    await this.analyticsQueue.add('aggregate-seller-stats', { sellerId: seller.id });
  }
}
```

---

## 📡 Real-Time Notifications

### Architecture
```
Backend Event → NotificationsService.sendToUser(userId, event, data)
  ↓
NotificationsGateway emits to Socket.io room `user_${userId}`
  ↓
Frontend SocketProvider listens for 'notification' event
  ↓
Sonner displays toast
```

### Authentication
- WebSocket handshake includes `access_token` cookie
- Gateway verifies JWT and joins user to their room
- Unauthorized connections are immediately disconnected

---

## 🎨 Frontend Design System

### Design Tokens
```css
:root {
  /* Colors (OKLCH) */
  --color-primary: oklch(0.6 0.2 250);
  --color-accent: oklch(0.7 0.25 150);
  
  /* Glassmorphism */
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(255, 255, 255, 0.18);
  --glass-blur: blur(10px);
  
  /* Shadows */
  --shadow-premium: 0 8px 32px rgba(0, 0, 0, 0.08);
}
```

### Components
- **card-premium**: Glassmorphic cards with backdrop blur
- **btn-premium**: Gradient buttons with hover animations
- **Framer Motion**: Page transitions, stagger animations

---

## 🛡️ Security Best Practices

1. **Input Validation**: All DTOs use `class-validator`, frontend uses Zod
2. **SQL Injection**: TypeORM parameterized queries
3. **XSS Protection**: HttpOnly cookies, CSP headers
4. **Rate Limiting**: Global throttler + endpoint-specific limits
5. **CORS**: Whitelist specific origins
6. **Secrets Management**: Environment variables, never hardcoded

---

## 📈 Performance Optimizations

### Backend
- **Compression**: Gzip middleware for API responses
- **Database Indexing**: Email, role, order status
- **Caching**: Redis for frequently accessed data
- **Connection Pooling**: TypeORM connection pool

### Frontend
- **Code Splitting**: Next.js automatic route-based splitting
- **Image Optimization**: Next/Image with lazy loading
- **Debouncing**: Search input, API calls
- **Memoization**: React.useMemo for expensive computations

---

## 🧪 Testing Strategy (Planned)

### Unit Tests
- **Services**: Wallet calculations, order logic
- **Utilities**: Date formatters, validators

### Integration Tests
- **API Endpoints**: Auth, Orders, Payments
- **Database**: Repository methods

### E2E Tests (Playwright)
- **Golden Path**: Login → Browse → Add to Cart → Checkout → Payment
- **Seller Flow**: Create Product → Receive Order → Mark Shipped

---

## 🚢 Deployment Architecture

### Production Setup
```
┌─────────────────┐
│   Vercel        │  Frontend (Next.js)
│   (CDN + SSR)   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Railway       │  Backend (NestJS)
│   (Container)   │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────┐
    ↓         ↓          ↓          ↓
┌────────┐ ┌──────┐ ┌────────┐ ┌──────────┐
│Supabase│ │Upstash│ │MongoDB │ │Meilisearch│
│(Postgres)│(Redis)│ │Atlas   │ │Cloud     │
└────────┘ └──────┘ └────────┘ └──────────┘
```

### CI/CD Pipeline
- **GitHub Actions**: Automated builds on push
- **Tests**: Run unit + integration tests
- **Deploy**: Auto-deploy to staging on `main` branch

---

## 📚 Key Learnings & Interview Talking Points

### 1. **Event Sourcing**
> "Instead of just storing the current state, we store every state change as an event. This gives us a complete audit trail and makes debugging much easier."

### 2. **Escrow System**
> "We implemented a three-state ledger (PENDING → LOCKED → RELEASED) to ensure both buyers and sellers are protected. Funds are held in escrow until delivery is confirmed or auto-released after 7 days."

### 3. **Real-Time Architecture**
> "We use WebSocket for instant notifications. When a seller's funds are released, they see a toast notification immediately without refreshing the page."

### 4. **Scalability**
> "The modular architecture allows us to extract any module into a microservice. For example, the Wallet module could become a separate 'Payment Service' with minimal refactoring."

### 5. **Type Safety**
> "We use TypeScript end-to-end with Zod for runtime validation. This catches bugs at compile-time and ensures data integrity."

---

## 🔮 Future Enhancements

1. **GraphQL API**: For more flexible frontend queries
2. **Kafka**: Replace in-memory event processing with distributed streaming
3. **Elasticsearch**: Advanced analytics and reporting
4. **Multi-Currency**: Support for USD, EUR, INR
5. **AI Recommendations**: Product suggestions based on browsing history
6. **Mobile App**: React Native with shared business logic

---

**Built with ❤️ by the Bazaary Team**
