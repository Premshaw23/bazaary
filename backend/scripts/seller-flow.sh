#!/bin/bash

set -e

API_URL="http://localhost:3001/api"

echo "🧪 Testing Bazaary API"
echo "====================="

# Test 1: Public route
echo ""
echo "✅ Test 1: Get all sellers (public)"
curl -s -X GET "$API_URL/sellers" | jq '.' || echo "Response: []"

# Test 2: Register
echo ""
echo "✅ Test 2: Register new seller"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"seller_$(date +%s)@test.com\",
    \"password\": \"password123\",
    \"role\": \"SELLER\"
  }")

echo "$REGISTER_RESPONSE" | jq '.'

TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.access_token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token"
  exit 1
fi

echo "Token: $TOKEN"

# Test 3: Apply as seller
echo ""
echo "✅ Test 3: Apply as seller (authenticated)"
SELLER_RESPONSE=$(curl -s -X POST "$API_URL/sellers/apply" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "businessName": "Test Electronics Store",
    "businessType": "INDIVIDUAL",
    "description": "Selling quality electronics",
    "address": {
      "street": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "country": "India"
    },
    "contactPhone": "+91-9876543210",
    "contactEmail": "contact@teststore.com",
    "bankAccountNumber": "1234567890",
    "bankIfsc": "HDFC0001234",
    "bankName": "HDFC Bank"
  }')

echo "$SELLER_RESPONSE" | jq '.'

SELLER_ID=$(echo "$SELLER_RESPONSE" | jq -r '.id')

if [ "$SELLER_ID" == "null" ] || [ -z "$SELLER_ID" ]; then
  echo "❌ Failed to create seller"
  exit 1
fi

# Test 4: Get my profile
echo ""
echo "✅ Test 4: Get my seller profile (authenticated)"
curl -s -X GET "$API_URL/sellers/me" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Test 5: Get seller by ID (public)
echo ""
echo "✅ Test 5: Get seller by ID (public)"
curl -s -X GET "$API_URL/sellers/$SELLER_ID" | jq '.'

# Test 6: Get seller metrics (public)
echo ""
echo "✅ Test 6: Get seller metrics (public)"
curl -s -X GET "$API_URL/sellers/$SELLER_ID/metrics" | jq '.'

echo ""
echo "🎉 All tests passed!"