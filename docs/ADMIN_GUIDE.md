# Bazaary Server & Development Guide

This document serves as the "Master Manual" for managing the Bazaary platform on your Azure VM.

---

## 🔍 1. Monitoring & Logs (The "Pro" Way)

To see what is happening inside your containers, navigate to the project folder on the server:
`cd ~/bazaary`

### Docker Logs
| Goal | Command |
| :--- | :--- |
| **All Services (Live)** | `docker compose logs -f` |
| **Backend Only** | `docker compose logs -f backend` |
| **Frontend Only** | `docker compose logs -f frontend` |
| **Nginx (Traffic)** | `docker compose logs -f nginx` |
| **Database Errors** | `docker compose logs -f postgres` |

### System & VM Logs
| Goal | Command |
| :--- | :--- |
| **VM Resources** | `htop` (Install with `sudo apt install htop`) |
| **Disk Space** | `df -h` |
| **RAM Usage** | `free -h` |
| **SSH Login History** | `last` |

---

## 🚀 2. The Deployment Workflow (How to Update)

When you make changes to your code locally, follow this 3-step process:

1.  **Local**: `git add .`, `git commit -m "update message"`, `git push origin master`
2.  **SSH into VM**: Connect via VS Code or terminal.
3.  **Deploy on VM**:
    ```bash
    cd ~/bazaary
    git pull
    docker compose up -d --build
    ```
    *Note: The `--build` flag ensures that your code changes are actually applied to the Docker image.*

---

## 📖 3. Command Glossary & Terminology

### Server Commands
- **`ssh`**: Secure Shell. Used to log into your VM from your computer.
- **`scp`**: Secure Copy. Used to move files (like `.env`) from your computer to the server.
- **`sudo`**: "SuperUser Do". Runs a command with admin privileges.

### Docker Commands
- **`docker compose up -d`**: Starts all services in "Detached" (background) mode.
- **`docker compose build`**: Re-compiles your code into a Docker image.
- **`docker compose ps`**: Lists all running containers and their health status.
- **`docker compose down`**: Stops and removes all containers (Data stays safe in Volumes).
- **`docker exec -it <name> sh`**: "Enters" a container so you can run commands inside it (like a computer inside a computer).

### Networking & SSL
- **`Nginx`**: The "Traffic Cop". It receives requests from the internet (80/443) and sends them to the right Docker container.
- **`Certbot`**: The "Security Guard". It talks to Let's Encrypt to get and renew your SSL certificates.
- **`Reverse Proxy`**: The technique Nginx uses to hide your backend port (3001) and show everything on the standard web port (443).

---

## 🛠️ 4. Maintenance Tasks

### Renewing SSL
Certbot is set up, but once every 3 months, it's good to run:
```bash
docker compose run --rm certbot renew
```

### Cleaning Up Disk Space
Docker builds can take up space over time. Run this once a month to delete old, unused images:
```bash
docker system prune -af
```

---

## 🏗️ 5. Project Structure Overview

```text
bazaary/
├── backend/          # NestJS Code (API)
├── frontend/         # Next.js Code (UI)
├── nginx/            # Reverse Proxy configuration
├── certbot/          # SSL Certificates (Auto-generated)
├── docs/             # Documentation & Manuals
├── scripts/          # Automation scripts
└── docker-compose.yml # The "Master Orchestrator"
```
