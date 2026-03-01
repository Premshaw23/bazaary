# 🤖 Bazaary: Professional CI/CD Pipeline Guide

Bazaary uses **GitHub Actions** to automate the build, test, and deployment process. This means every time you push code to `master`, the system will automatically rebuild and update your live shop.

---

## 🛠️ 1. The CI/CD Workflow
The pipeline consists of two main stages:

### Stage 1: Continuous Integration (CI)
- **Code Checkout**: Grabs the latest version from GitHub.
- **Node.js Setup**: Prepares the build environment.
- **Microservice Builds**: Compiles both `backend` and `frontend` to ensure there are no syntax or dependency errors.
- **Safety Check**: If this stage fails, the deployment is cancelled automatically.

### Stage 2: Continuous Deployment (CD)
- **SSH Handshake**: Connects to your Azure VM using your secure private key.
- **Automation**: Runs the **`./scripts/deploy.sh`** tool on the server.
- **Zero-Manual Work**: Your production site updates itself in about 3-5 minutes.

---

## 🔑 2. Required GitHub Secrets
To make this work, you MUST add these 3 variables to your GitHub repository:

1.  Go to your GitHub repo -> **Settings** -> **Secrets and variables** -> **Actions**.
2.  Click **"New repository secret"** and add these:

| Secret Name | Value Example |
| :--- | :--- |
| **`SSH_PRIVATE_KEY`** | Paste the ENTIRE content of your `bazaary_key.pem` file. |
| **`SERVER_IP`** | `13.70.34.195` |
| **`SERVER_USER`** | `azureuser_prem` |

---

## 🚀 3. How to Trigger Deployment
Now, your workflow is 100% automated:

1.  **Work Locally**: Make your code changes in VS Code.
2.  **Push to GitHub**:
    ```bash
    git add .
    git commit -m "feat: your new feature"
    git push origin master
    ```
3.  **Watch the Magic**: Go to the **"Actions"** tab on GitHub. You will see your deployment running in real-time.
4.  **Confirm**: Refresh [https://bazaary.shop](https://bazaary.shop).

---

## 💡 4. Why this is "Good CI/CD"?
- **Consistency**: The server is always updated the exact same way.
- **Error Protection**: If your code has a bug that prevents building, the production site stays safe and online.
- **Time Saving**: You no longer need to `ssh` into the server and run scripts yourself.

**Prem, you have just automated your entire business operations!** 🛠️🎊
