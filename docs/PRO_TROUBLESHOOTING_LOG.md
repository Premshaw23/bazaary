# 🩺 Bazaary: Advanced Troubleshooting & Networking Log

This document tracks real-world production issues encountered during the Bazaary deployment, their surgical resolutions, and the core engineering concepts behind them.

---

## 🛠️ Case Study 1: The "SSL Dead-Loop" Crash
**Symptoms**: The site was completely unreachable (`ERR_CONNECTION_REFUSED`). Nginx container status was "Restarting (restarting)".

### 🔍 The Root Cause
When we updated the server via `git pull`, the `nginx/default.conf` file was reset to the version on GitHub. In that version, the SSL certificate paths were commented out (`#`).
- **Nginx Logic**: The configuration told Nginx to "Listen on Port 443 for SSL," but provided NO certificates. Nginx sees this as a fatal error and stops immediately. Because Docker is set to `restart: always`, it kept crashing and restarting forever.

### 💡 The Resolution
We modified the "Source of Truth" (the local code) to permanently uncomment the SSL lines. 
- **Command**: `docker compose logs nginx` revealed the error: `no "ssl_certificate" is defined`.
- **Fix**: Pushed the active SSL config to GitHub and synced the server.

---

## 🛠️ Case Study 2: WebSocket / Real-Time Failure
**Symptoms**: Console error: `WebSocket connection to 'wss://bazaary.shop/socket.io/...' failed`. Real-time notifications were not working.

### 🔍 The Root Cause
By default, Nginx only knows how to handle standard web requests (GET/POST). WebSockets are different—they start as HTTP but "Upgrade" to a persistent connection.
- **The Gap**: Nginx was trying to handle the `/socket.io` path as a normal web page. It didn't know it needed to "pass" the connection to the backend and keep the pipe open.

### 💡 The Resolution
We added a specialized "Location Block" in Nginx for `/socket.io`.
- **Core Code**:
  ```nginx
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  ```
- **Result**: Nginx now correctly converts the incoming HTTPS request into a persistent WebSocket tunnel to the NestJS backend.

---

## 📖 DevOps Vocabulary & Concepts

### 1. Reverse Proxy (Nginx)
Think of Nginx as a **Front-Desk Receptionist**.
- **Internal Reality**: You have a backend at port 3001 and a frontend at port 3000.
- **Public Reality**: The world only sees `https://bazaary.shop` (Port 443).
- **Work**: Nginx receives the mail (request) and "proxies" (delivers) it to the correct department (container) based on the URL.

### 2. SSL Termination
This is the process where Nginx handles the "Security Handshake" with the user's browser. Once the data is inside your server network, Nginx sends it to the app containers over internal HTTP. This makes your app faster because it doesn't have to calculate encryption for every single request.

### 3. WebSocket "Upgrade"
HTTP is like a **Letter** (Send, Receive, Done). WebSocket is like a **Phone Call** (Pick up, Stay connected).
- **The Problem**: Nginx usually hangs up the phone after receiving a letter.
- **The Fix**: The `Upgrade` header tells Nginx: "Don't hang up! Keep the line open for a phone call."

---

## ⌨️ Command Meaning Reference

| Command Component | Pro Definition |
| :--- | :--- |
| `proxy_pass http://backend:3001` | "Take this request and send it to the container named 'backend' on port 3001." |
| `proxy_set_header Host $host` | "Tell the backend what original domain name the user typed (bazaary.shop)." |
| `location /api { ... }` | "Apply these specific rules ONLY to URLs that start with /api." |
| `git reset --hard` | "I don't care about my local mistakes. Make my folder look exactly like the last version on GitHub." |
| `docker compose exec <name> ...` | "Skip into the container and run this command as if I am sitting inside it." |

---

**This log is your "Experience Memory." Reading this will help you diagnose 90% of future web server issues.**
