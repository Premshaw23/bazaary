# 🔌 VS Code Remote-SSH: Professional Workflow Guide

This guide explains how to connect your local VS Code to your Azure VM ("Remote-SSH") using an **Alias** and the "Strict" workflow for updating your server safely.

---

## 🛠️ 1. Professional Quick-Connect (Host Alias)

Instead of typing the IP address every time, we use a **Host Alias**. This makes connecting instant and professional.

### Step 1: Configure the Alias
1.  In VS Code, press `Ctrl+Shift+P` and type `SSH: Open SSH Configuration File...`.
2.  Choose the file at `C:\Users\shaw8\.ssh\config`.
3.  Paste this **Master Block**:
    ```text
    Host bazaary-server
        HostName 13.70.34.195
        User azureuser_prem
        IdentityFile "C:/Users/shaw8/.ssh/bazaary_key.pem"
    ```

### Step 2: Connect via Alias
1.  Click the **Blue Icon** (bottom-left) in VS Code.
2.  Select **"Connect to Host..."**.
3.  Choose **`bazaary-server`**. 
    - *Note: If you see the old IP address in the list, you can ignore it or delete it from the config file. Always use the name alias.*

---

## 🛡️ 2. Secure Key Storage (Windows Fix)

If you get a **"Permission Denied (publickey)"** error, it usually means your key permissions are "Too Open."

### The "Surgical" Permission Fix:
1.  Go to `C:\Users\shaw8\.ssh\bazaary_key.pem`.
2.  Right-click > **Properties** > **Security** > **Advanced**.
3.  **Disable Inheritance** > **Remove all inherited permissions**.
4.  **Add** your user (`PREMSHAW\shaw8`) with **Full Control**.
5.  **The Result**: The ONLY name in that list must be your own user. If `SYSTEM` or `Administrators` are there, SSH will fail.

---

## 🚀 3. The "Strict" Development Workflow

To keep the server stable, follow this **Automatic Sync** rule:

### Stage 1: Local (Edit & Push)
```bash
git add .
git commit -m "update: your message"
git push origin master
```

### Stage 2: Server (Pull & Deploy)
In your **`bazaary-server`** VS Code window:
```bash
cd ~/bazaary
./scripts/deploy.sh
```

---

## ⌨️ 4. Quick-Fix Command Cheat-Sheet

| Goal | Command |
| :--- | :--- |
| **Verify Key Path** | `ssh -G bazaary-server \| grep identityfile` |
| **Fix Broken Merge** | `git fetch --all && git reset --hard origin/master` |
| **Update App** | `./scripts/deploy.sh` |
| **Live Logs** | `docker compose logs -f` |

---

**You are now connected via a professional Alias. No more IPs, just one-click access!**
