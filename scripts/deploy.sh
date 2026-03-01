#!/bin/bash

# Bazaary Production Deployment Script
# This script automates the update process on your Azure VM.

echo "🚀 Starting Bazaary Update..."

# 1. Pull latest changes
echo "📥 Pulling latest code from GitHub..."
git pull

# 2. Check for critical configuration
if [ ! -f "backend/.env" ]; then
    echo "⚠️ Error: backend/.env not found! Cannot start production backend."
    exit 1
fi

# 3. Build and Start Containers
# --force-recreate ensures that environment variable changes are applied
echo "🏗️ Rebuilding and restarting containers..."
docker compose up -d --build --force-recreate

# 4. Clean up
# Deletes old images that are no longer being used to keep the VM fast
echo "🧹 Cleaning up unused Docker data..."
docker image prune -f

echo "------------------------------------------------"
echo "✅ UPDATE COMPLETE!"
echo "🌐 Your app is live at: https://bazaary.shop"
echo "------------------------------------------------"
