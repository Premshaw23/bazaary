# Deployment Guide for Bazaary

This guide outlines how to deploy the Bazaary full-stack application (Next.js Frontend + NestJS Backend) for free using popular hosting providers.

## Suggested Commit Name
Use the following commit message for your current changes:
```
feat: unify search bar UI, fix infinite loops, and optimize rate limiting
```

---

## 🚀 1. Database & Search (Prerequisites)

Before deploying the code, you need cloud-hosted databases.

### A. PostgreSQL (Primary Database)
1.  Sign up at [Neon.tech](https://neon.tech) (Free Tier).
2.  Create a new project.
3.  Copy the **Connection String** (e.g., `postgres://user:pass@host/neondb...`).
    *   *Usage*: This will be your `DATABASE_URL` or `POSTGRES_...` env vars.

### B. MongoDB (Secondary Database)
1.  Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas) (Free Tier).
2.  Create a cluster (M0 Sandbox).
3.  Create a database user (username/password) and whitelist access from `0.0.0.0/0`.
4.  Copy the connection string (e.g., `mongodb+srv://...`).
    *   *Usage*: This will be your `MONGO_URI`.

### C. Meilisearch (Search Engine)
1.  Sign up at [Meilisearch Cloud](https://www.meilisearch.com/).
2.  Create a project on the **Build** plan (Free, no credit card required).
3.  Get your **Host URL** and **Default Search API Key** (and Admin Key).
    *   *Usage*: `MEILISEARCH_HOST` and `MEILISEARCH_API_KEY`.

---

## 🌐 2. Backend Deployment (NestJS)

We will use **Render** or **Railway** (NestJS runs as a persistent web service). **Render** has a free tier for Web Services.

### Option: Render (Free Tier)
1.  Push your code to GitHub.
2.  Sign up at [Render.com](https://render.com).
3.  Click **New +** -> **Web Service**.
4.  Connect your GitHub repo.
5.  **Settings**:
    *   **Root Directory**: `backend` (Important! Your backend is in a subfolder).
    *   **Build Command**: `npm install && npm run build`
    *   **Start Command**: `npm run start:prod`
6.  **Environment Variables**: Add all variables from your `backend/.env` file.
    *   `PORT`: `10000` (Render listens on this by default).
    *   `POSTGRES_HOST`, `POSTGRES_USER`, etc. (from Neon).
    *   `MONGO_URI` (from Atlas).
    *   `MEILISEARCH_HOST`, `MEILISEARCH_API_KEY` (from Meilisearch Cloud).
7.  Click **Create Web Service**.
8.  Once deployed, copy the **Service URL** (e.g., `https://bazaary-backend.onrender.com`).

---

## 🎨 3. Frontend Deployment (Next.js)

We will use **Vercel**, the creators of Next.js.

1.  Sign up at [Vercel.com](https://vercel.com).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repo.
4.  **Framework Preset**: Next.js (should detect automatically).
5.  **Root Directory**: Click "Edit" and select `frontend`.
6.  **Environment Variables**:
    *   `NEXT_PUBLIC_API_URL`: **Important!** Set this to your Backend URL from Step 2 (e.g., `https://bazaary-backend.onrender.com/api`).
    *   *Note*: Ensure you add `/api` at the end if your backend main.ts sets a global prefix.
7.  Click **Deploy**.

---

## ✅ 4. Final Verification
1.  Go to your Vercel URL (e.g., `https://bazaary.vercel.app`).
2.  Try to Search. It should hit your Render backend -> Meilisearch Cloud.
3.  Try to Login/Browse. It should hit Render backend -> Neon/Mongo.

### Note on Free Tiers:
*   **Render Free Tier**: Spins down after 15 minutes of inactivity. The first request might take 50+ seconds.
*   **Meilisearch Build Plan**: Limited to 10k documents.
