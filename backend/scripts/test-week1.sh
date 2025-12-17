#!/bin/bash

set -e

API_URL="http://localhost:3001/api"

echo "🧪 Testing Week 1: Core Entities"
echo "================================="

# Register seller
echo "1. Register seller..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"week1test_$(date +%s)@test.com\",
    \"password\": \"password123\",
    \"role\": \"SELLER\"
  }")

TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.access_token')
USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.user.id')

echo "Token: $TOKEN"

# Apply as seller
echo ""
echo "2. Apply as seller..."
SELLER_RESPONSE=$(curl -s -X POST "$API_URL/sellers/apply" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "businessName": "Test Store",
    "businessType": "INDIVIDUAL",
    "description": "Electronics store",
    "address": {
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "country": "India"
    },
    "contactPhone": "+91-9876543210"
  }')

SELLER_ID=$(echo "$SELLER_RESPONSE" | jq -r '.id')
echo "Seller ID: $SELLER_ID"

# Create product
echo ""
echo "3. Create product..."
PRODUCT_RESPONSE=$(curl -s -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sku": "TEST-SKU-'$(date +%s)'",
    "name": "Test Wireless Headphones",
    "brand": "TestBrand",
    "description": "High-quality wireless headphones",
    "shortDescription": "Premium headphones",
    "images": [{"url": "https://example.com/image.jpg", "alt": "Product"}],
    "specifications": {"Battery": "30 hours"},
    "searchKeywords": ["wireless", "headphones"]
  }')

PRODUCT_ID=$(echo "$PRODUCT_RESPONSE" | jq -r '.id')
echo "Product ID: $PRODUCT_ID"

# Create listing
echo ""
echo "4. Create listing..."
LISTING_RESPONSE=$(curl -s -X POST "$API_URL/listings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"productId\": \"$PRODUCT_ID\",
    \"price\": 2999.99,
    \"compareAtPrice\": 3999.99,
    \"stockQuantity\": 100,
    \"condition\": \"NEW\",
    \"warrantyMonths\": 12,
    \"returnWindowDays\": 7
  }")

LISTING_ID=$(echo "$LISTING_RESPONSE" | jq -r '.id')
echo "Listing ID: $LISTING_ID"

# Adjust inventory
echo ""
echo "5. Adjust inventory (add 50 units)..."
curl -s -X POST "$API_URL/inventory/$LISTING_ID/adjust" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "quantity": 50,
    "type": "STOCK_IN",
    "reason": "Initial stock"
  }' | jq '.'

# Get available stock
echo ""
echo "6. Check available stock..."
curl -s -X GET "$API_URL/inventory/$LISTING_ID/available" | jq '.'

echo ""
echo "✅ Week 1 tests complete!"