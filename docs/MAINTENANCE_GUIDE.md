# 🧹 Bazaary: Professional Maintenance & Server Care

To keep your production environment at **https://bazaary.shop** running fast, secure, and healthy, follow this 3-step periodic maintenance guide.

---

## 🛠️ 1. Monthly Docker Cleanup
Every time you run a deployment, Docker creates "dangling" images (old versions of your code). Over time, these can fill up your 30GB Azure disk.

**The Solution**: Run this once a month to reclaim disk space:
```bash
# Deletes unused images, networks, and build cache
docker system prune -af
```
*Note: This is safe; it only deletes things that are NOT currently being used by your running containers.*

---

## 🛡️ 2. Linux System Security Updates
Your Azure VM (Ubuntu 24.04) receives regular security patches from the Linux community. Keeping these updated prevents hacking attempts.

**The Solution**: Run this once a month (usually takes 2-5 minutes):
```bash
sudo apt update && sudo apt upgrade -y
```
*Note: If the terminal says "*** System restart required ***", just run `sudo reboot` to safely restart the server.*

---

## 🚀 3. The "Standard Update" Loop
When you want to push a new feature or fix a bug, this is the "Pro" way to do it without downtime:

1.  **Local (VS Code)**: `git add . && git commit -m "update" && git push origin master`
2.  **Login (Terminal)**: `ssh bazaary-server`
3.  **Deploy (Server)**: 
    ```bash
    cd ~/bazaary
    ./scripts/deploy.sh
    ```

---

## 📋 Maintenance Command Summary

| Task | Command | How often? |
| :--- | :--- | :--- |
| **Check Disk Space** | `df -h` | Every 2 weeks |
| **Check RAM Usage** | `free -h` | If the site feels slow |
| **Clean Docker** | `docker system prune -af` | Monthly |
| **OS Security Patch** | `sudo apt update && sudo apt upgrade -y` | Monthly |
| **Fix Broken App** | `docker compose restart nginx` | Only if site is down |

---

**By following these small steps, you ensure Bazaary stays professional, fast, and secure for your users.** 🌟
