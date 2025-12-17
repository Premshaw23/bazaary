#!/bin/bash

set -e

API_URL="http://localhost:3001/api"

echo "🧪 Manual Step-by-Step Test"
echo "============================"

# 1. Register
echo "1. Registering..."
REGISTER=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test$(date +%s)@test.com\",\"password\":\"test123\",\"role\":\"SELLER\"}")

echo "$REGISTER" | jq '.'
TOKEN=$(echo "$REGISTER" | jq -r '.access_token')

if [ "$TOKEN" == "null" ]; then
  echo "❌ Registration failed"
  exit 1
fi

echo "✅ Token: $TOKEN"

# 2. Apply as seller
echo ""
echo "2. Applying as seller..."
SELLER=$(curl -s -X POST "$API_URL/sellers/apply" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "businessName": "Test Store",
    "businessType": "INDIVIDUAL",
    "description": "Test",
    "address": {"street":"123","city":"Mumbai","state":"MH","pincode":"400001","country":"India"},
    "contactPhone": "+919876543210"
  }')

echo "$SELLER" | jq '.'
SELLER_ID=$(echo "$SELLER" | jq -r '.id')

if [ "$SELLER_ID" == "null" ]; then
  echo "❌ Seller creation failed"
  exit 1
fi

echo "✅ Seller ID: $SELLER_ID"

# 3. Create product
echo ""
echo "3. Creating product..."
PRODUCT=$(curl -s -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"sku\": \"TEST-$(date +%s)\",
    \"name\": \"Test Headphones\",
    \"brand\": \"TestBrand\",
    \"description\": \"Great headphones\",
    \"shortDescription\": \"Headphones\",
    \"images\": [{\"url\": \"https://example.com/img.jpg\"}],
    \"specifications\": {\"Battery\": \"30h\"},
    \"searchKeywords\": [\"test\", \"headphones\"]
  }")

echo "$PRODUCT" | jq '.'
PRODUCT_ID=$(echo "$PRODUCT" | jq -r '.id')

if [ "$PRODUCT_ID" == "null" ]; then
  echo "❌ Product creation failed"
  echo "Check backend logs for errors"
  exit 1
fi

echo "✅ Product ID: $PRODUCT_ID"

# 4. Create listing
echo ""
echo "4. Creating listing..."
LISTING=$(curl -s -X POST "$API_URL/listings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"productId\": \"$PRODUCT_ID\",
    \"price\": 2999.99,
    \"compareAtPrice\": 3999.99,
    \"stockQuantity\": 100,
    \"condition\": \"NEW\",
    \"warrantyMonths\": 12
  }")

echo "$LISTING" | jq '.'
LISTING_ID=$(echo "$LISTING" | jq -r '.id')

if [ "$LISTING_ID" == "null" ]; then
  echo "❌ Listing creation failed"
  exit 1
fi

echo "✅ Listing ID: $LISTING_ID"

# 5. Check available stock
echo ""
echo "5. Checking available stock..."
STOCK=$(curl -s -X GET "$API_URL/inventory/$LISTING_ID/available")
echo "$STOCK" | jq '.'

echo ""
echo "🎉 All tests passed!"