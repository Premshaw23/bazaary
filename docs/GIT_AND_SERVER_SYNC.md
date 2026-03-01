# Git & Server Synchronization Guide

This document explains the common issues faced when syncing code between **Local VS Code**, **GitHub**, and the **Azure VM Server**, and how to solve them like a pro.

---

## 🔄 1. The Standard Workflow
To keep your system stable, always follow this order:
1.  **Local Development**: Edit code on your computer.
2.  **GitHub Push**: `git commit` and `git push` from your local VS Code.
3.  **Server Pull**: Run `./scripts/deploy.sh` on the VM server.

---

## 🛠️ 2. Common Issues & Pro-Fixes

### 🔴 Problem: "Your local changes would be overwritten by merge"
**Why it happens**: You edited a file directly on the server (via SSH), and now it conflicts with the new code coming from GitHub.
**The Solution (The "Force Sync")**:
On the server, run:
```bash
git fetch --all
git reset --hard origin/master
```
*This tells the server: "Ignore my local changes and make the code look EXACTLY like GitHub."*

### 🔴 Problem: "Permission denied" when running scripts
**Why it happens**: Linux treats scripts as text files by default. You must give them "Execute" permission.
**The Solution**:
```bash
chmod +x scripts/deploy.sh
```

### 🔴 Problem: "Untracked working tree files would be overwritten"
**Why it happens**: You created a new file on the server manually, but now GitHub also has a file with the same name.
**The Solution**:
```bash
git clean -fd
```
*Warning: This deletes any file on the server that is NOT on GitHub.*

---

## 🖥️ 3. VS Code SSH "Source Control" Tab
When connected to the VM via SSH, you might see "Changes" in the sidebar. 
- **What are they?** Usually auto-generated files (like SSL configs or logs).
- **Should I commit them?** **NO.** Never commit server-specific files to GitHub.
- **How to ignore them?** Update your `.gitignore` with the folder name (e.g., `certbot/`).

---

## ⌨️ 4. Essential Command Cheat-Sheet

| Command | What it does | Where to run |
| :--- | :--- | :--- |
| `git push origin master` | Sends your local work to GitHub | **Local** |
| `git pull` | Downloads new code from GitHub | **Server** |
| `git status` | Shows what has changed | **Both** |
| `git reset --hard` | Deletes all local changes (Danger!) | **Server** |
| `./scripts/deploy.sh` | Updates and restarts the app | **Server** |

---

## 💡 5. Professional Mindset
*   **The Golden Rule**: Treat your VM Server as a "Runner," not an editor. Always edit code **Locally**, test it, and then deploy it to the server.
*   **Keep it Clean**: If the server has a conflict, don't try to merge it. Just `reset --hard` and restart. It's safer.
