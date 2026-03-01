# 🔄 Bazaary: The Professional Git & Server Sync Loop

This document outlines the **unbreakable workflow** for syncing code from your local computer to your production server using the **Host Alias**.

---

## 🚀 1. The Pro Development Cycle
Follow these 4 steps every time you have a new update:

### Step 1: Local Development (VS Code)
Work on your computer, test your code, and save everything.

### Step 2: Push to GitHub (VS Code Terminal)
Tell the cloud about your changes:
```bash
git add .
git commit -m "feat: your new feature description"
git push origin master
```

### Step 3: Quick Connect (Terminal or VS Code)
Choose your preferred way to "enter" the server:
- **Option A (Terminal)**: Just type `ssh bazaary-server`.
- **Option B (VS Code)**: Click the **Blue Icon** (bottom-left) > **Connect to Host...** > **bazaary-server**.

### Step 4: Final Deployment (Server Terminal)
While "inside" the server, run the automated script:
```bash
./scripts/deploy.sh
```

---

## 🛠️ 2. Solutions for Common Sync Blockers

### 🔴 Problem: "Your local changes would be overwritten by merge"
**The Solution (The "Force Sync")**:
On the server, run:
```bash
git fetch --all
git reset --hard origin/master
```
*Note: This deletes any accidental edits made on the server and forces it to match GitHub exactly.*

### 🔴 Problem: "Untracked working tree files would be overwritten"
**The Solution**:
```bash
git clean -fd
```
*Note: This removes any new files on the server that are not tracked by Git (like logs or test files).*

---

## ⌨️ 3. "Master Sync" Command Table

| Command | Action | Where? |
| :--- | :--- | :--- |
| `git push origin master` | Sends changes to GitHub | **Local** |
| **`ssh bazaary-server`** | **Instant server login using Alias** | **Local Terminal** |
| `git status` | Shows sync differences | **Both** |
| `./scripts/deploy.sh` | **The final "Go Live" button** | **Server** |

---

## 💡 4. Professional Mindset
- **"The Cloud is One"**: Imagine GitHub as the bridge. Always push to the bridge and pull from the bridge.
- **"Alias is Key"**: Never type the IP address again. Use `bazaary-server` for everything.
- **"Fresh and Clean"**: If the server has a conflict, don't waste time merging. Just `reset --hard` and re-deploy.

---

**You now follow the exact same sync workflow used by the world's top engineering teams.**
