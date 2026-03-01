# 🔌 VS Code Remote-SSH: Professional Workflow Guide

This guide explains how to connect your local VS Code to your Azure VM ("Remote-SSH") and the "Strict" workflow for updating your server safely.

---

## 🛠️ 1. How to Connect (The Professional Way)

### Step 1: Securely Store Your Key
Never keep your SSH keys in the `Downloads` folder. The professional standard is the hidden `.ssh` folder.
1.  Move your `bazaary_key.pem` to `C:\Users\shaw8\.ssh\bazaary_key.pem`.
2.  **Strict Permissions (Windows Fix)**: 
    - Right-click the `.pem` file > **Properties** > **Security** > **Advanced**.
    - Click **Disable inheritance** > **Remove all inherited permissions**.
    - Click **Add** > **Select a principal** > Type your username (`shaw8`) > **OK**.
    - Give yourself **Full control** and click **OK** until all windows are closed.
    - *The only name in the list should be your own user.*

### Step 2: Configure the SSH Shortcut
1.  In VS Code, press `Ctrl+Shift+P` and type `SSH: Open SSH Configuration File...`.
2.  Select your user config file (usually `C:\Users\shaw8\.ssh\config`).
3.  Add this block:
    ```text
    Host bazaary-server
        HostName 13.70.34.195
        User azureuser_prem
        IdentityFile "C:\Users\shaw8\.ssh\bazaary_key.pem"
    ```
4.  **To Connect**: Click the **Blue Icon** (bottom-left) > `Connect to Host...` > `bazaary-server`.

---

## 🛡️ 2. The "Strict" Development Workflow

To avoid errors like "Merge Conflicts" or "Server Down," follow this **unbreakable rule**:
> **"Edit Locally, Push on Server, Never Edit on Server."**

### Stage 1: Local Development (Regular VS Code)
1.  Make your changes in your local `bazaary` folder.
2.  Test them if possible.
3.  **Commit & Push**:
    ```bash
    git add .
    git commit -m "feat: your feature name"
    git push origin master
    ```

### Stage 2: Server Deployment (Remote-SSH VS Code)
1.  Open your **Remote-SSH** window (connected to the VM).
2.  Open the terminal inside that window.
3.  **Run the Update Script**:
    ```bash
    cd ~/bazaary
    ./scripts/deploy.sh
    ```

---

## 🚀 3. Master Command Reference for Server

| Goal | Command | Why this command? |
| :--- | :--- | :--- |
| **Complete Reset** | `git fetch --all && git reset --hard origin/master` | Fixes any "Conflict" errors by forcing server to match GitHub. |
| **Rebuild Everything** | `docker compose up -d --build --force-recreate` | Completely refreshes the apps with new code/env variables. |
| **Check Logs** | `docker compose logs -f --tail 100` | Shows the last 100 lines of activity (Live). |
| **Enter Database** | `docker compose exec postgres psql -U bazaary -d bazaary_db` | Let's you run SQL commands inside the container. |
| **Clean Disk** | `docker system prune -f` | Deletes old build files to prevent the VM from filling up. |

---

## 💡 4. Pro-Tips for Stability
- **Environment Variables**: If you change `.env` locally, remember to also update the `.env` on the server manually (using `nano .env`) because `.env` files are NOT pushed to GitHub (for security).
- **Permissions**: If `deploy.sh` refuses to run, always remember: `chmod +x scripts/deploy.sh`.
- **Database Safety**: Before doing a major server reset, consider backing up your Postgres:
  `docker exec bazaary-postgres pg_dump -U bazaary bazaary_db > backup.sql`

---

**You now have a "Seamless" bridge between your computer and your cloud server.**
