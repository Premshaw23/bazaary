# ♾️ Bazaary: Master DevOps & Infrastructure Manual

This document provides a comprehensive deep-dive into the DevOps architecture, infrastructure-as-code (Docker), and operational strategy used for Bazaary.

---

## 🏗️ 1. High-Level Architecture
Bazaary uses a **Containerized Micro-Services Architecture**. Every component lives in its own isolated environment (Container) but they communicate over a private internal virtual network.

- **Entry Point**: Nginx (Port 80/443)
- **Frontend**: Next.js (Node.js Standalone Mode)
- **Backend**: NestJS (API)
- **Search**: Meilisearch (Specialized Search Engine)
- **Databases**: PostgreSQL (Relational) & MongoDB (Document/NoSQL)
- **Cache/Queue**: Redis
- **Storage**: MinIO (S3 Compatible Object Storage)

---

## 🐳 2. Docker Infrastructure Deep-Dive

### The Orchestrator: `docker-compose.yml`
This file is the "blueprint" of your entire server. It defines:
- **Services**: The 9 containers running your app.
- **Networks**: `bazaary-network` - An internal private network where containers talk using their names (e.g., the backend connects to `postgres` instead of an IP).
- **Volumes**: Persistent storage. When a container restarts, your data stays safe in folders like `postgres_data` or `mongodb_data`.

### Container Health Checks
We use `healthcheck` in the docker-compose file. This ensures that the **Backend** doesn't start until **Postgres** and **Redis** are fully "Ready," preventing startup crashes.

---

## 🔒 3. Reverse Proxy & SSL (Security)

### Nginx (The Front Door)
Nginx sits at the edge of your server. It does three things:
1.  **SSL Termination**: It handles the HTTPS encryption so the app doesn't have to.
2.  **Routing**: 
    - Requests to `bazaary.shop/api` -> Forwarded to Backend.
    - Requests to `bazaary.shop/` -> Forwarded to Frontend.
3.  **Static Serving**: It serves the Certbot challenge files for SSL renewal.

### Certbot & Let's Encrypt
We use a "Standalone" and "Webroot" strategy. Every 90 days, Certbot communicates with Let's Encrypt to verify you own the domain and issues a new certificate.

---

## 💾 4. Database Persistence Strategy

### Internal vs External
We migrated from **Neon (Postgres)** and **Atlas (Mongo)** to **Internal Docker**.
- **Pros**: $0 cost, lower latency (1ms vs 100ms), and full data privacy.
- **Maintenance**: You are now responsible for the data. Use `docker exec` to take backups (Dumps).

### PostgreSQL Maintenance
To run a manual SQL command:
`docker compose exec postgres psql -U bazaary -d bazaary_db`

---

## 📈 5. Resource Optimization (Azure VM)

Because we are running on a **Standard_B2als_v2** (Azure Student tier), we optimized the VM:
1.  **Swap Space**: We added **4GB of Swap Memory**. This prevents the server from crashing when building the memory-heavy Next.js frontend.
2.  **Next.js Standalone**: The frontend is built in "Standalone" mode, reduced from ~1GB to ~100MB for faster performance.
3.  **Alpine Images**: We use `node:22-alpine` to keep the base OS size as small as possible.

---

## 🚀 6. The CI/CD Pipeline (Manual)

### The `deploy.sh` Logic:
1.  **Pull**: Syncs the code.
2.  **Build**: Creates new images with your latest code changes.
3.  **Force Recreate**: Restarts containers to apply new Environment Variables.
4.  **Prune**: Deletes "Dangling" images (remnants of old builds) to save disk space.

---

## 🆘 7. Disaster Recovery: "The Reset Button"

If the server becomes completely corrupted and you need to start fresh:
1.  **Clean Docker**: `docker compose down -v` (Warning: This deletes ALL your database data).
2.  **Rebuild All**: `docker compose up -d --build`.
3.  **Re-Migrate**: The backend will automatically re-create the tables on startup if `NODE_ENV=development` is set temporarily.

---

## 🛠️ 8. Pro DevOps Troubleshooting flow
If a user says "The site is down":
1.  **Check Port 443**: `curl -I https://bazaary.shop` (Is it Nginx or the App?)
2.  **Check Docker Status**: `docker compose ps` (Is any service "Exit 1"?)
3.  **Check Logs**: `docker compose logs --tail 100 -f`
4.  **Check Memory**: `free -h` (Did we run out of RAM?)

---

**This is the complete DevOps DNA of Bazaary.** You now own 100% of your stack.
