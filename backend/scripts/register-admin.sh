#!/bin/bash
# Script to register an admin user for development/MVP

API_URL="http://localhost:3001/api"
ADMIN_EMAIL="admin@test.com"
ADMIN_PASSWORD="admin123"

RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "'$ADMIN_EMAIL'", "password": "'$ADMIN_PASSWORD'", "role": "ADMIN"}')

echo "Registration response: $RESPONSE"

TOKEN=$(echo "$RESPONSE" | jq -r '.access_token // .accessToken')
USER_ROLE=$(echo "$RESPONSE" | jq -r '.user.role')

if [[ "$USER_ROLE" == "ADMIN" && "$TOKEN" != "null" ]]; then
  echo "✅ Admin registered successfully."
  echo "Access token: $TOKEN"
else
  echo "❌ Admin registration failed or user is not ADMIN."
fi
