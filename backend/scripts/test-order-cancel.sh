#!/bin/bash

set -e

API_URL="http://localhost:3001/api"

echo "🧪 Testing Order Cancellation"
echo "=============================="

# Setup (same as before, abbreviated)
REGISTER=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"cancel$(date +%s)@test.com\",\"password\":\"test123\",\"role\":\"SELLER\"}")

TOKEN=$(echo "$REGISTER" | jq -r '.access_token')

SELLER=$(curl -s -X POST "$API_URL/sellers/apply" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"businessName":"Cancel Test","businessType":"INDIVIDUAL","description":"Test","address":{"street":"123","city":"Mumbai","state":"MH","pincode":"400001","country":"India"},"contactPhone":"+919876543210"}')

SELLER_ID=$(echo "$SELLER" | jq -r '.id')

PRODUCT=$(curl -s -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"sku\":\"CANCEL-$(date +%s)\",\"name\":\"Cancel Test Product\",\"brand\":\"Test\",\"description\":\"Test\",\"images\":[{\"url\":\"https://example.com/img.jpg\"}],\"searchKeywords\":[\"test\"]}")

PRODUCT_ID=$(echo "$PRODUCT" | jq -r '.id')

LISTING=$(curl -s -X POST "$API_URL/listings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"productId\":\"$PRODUCT_ID\",\"price\":999.99,\"stockQuantity\":100,\"condition\":\"NEW\"}")

LISTING_ID=$(echo "$LISTING" | jq -r '.id')

BUYER_REG=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"cancelbuyer$(date +%s)@test.com\",\"password\":\"test123\",\"role\":\"BUYER\"}")

BUYER_TOKEN=$(echo "$BUYER_REG" | jq -r '.access_token')

echo "✅ Setup complete"

# Create order
echo ""
echo "Creating order..."
ORDER=$(curl -s -X POST "$API_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d "{\"items\":[{\"listingId\":\"$LISTING_ID\",\"quantity\":5}],\"shippingAddress\":{\"name\":\"Test\",\"phone\":\"+919876543210\",\"street\":\"123\",\"city\":\"Mumbai\",\"state\":\"MH\",\"pincode\":\"400001\",\"country\":\"India\"}}")

ORDER_ID=$(echo "$ORDER" | jq -r '.id')
echo "✅ Order created: $ORDER_ID"

# Check stock was reserved
echo ""
echo "Checking reserved stock..."
STOCK1=$(curl -s -X GET "$API_URL/inventory/$LISTING_ID/available" | jq -r '.availableStock')
echo "Available stock after order: $STOCK1 (should be 95)"

# Cancel order
echo ""
echo "Cancelling order..."
CANCEL=$(curl -s -X POST "$API_URL/orders/$ORDER_ID/cancel" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d '{"reason":"Changed my mind"}')

echo "$CANCEL" | jq '.'

# Check stock was released
echo ""
echo "Checking stock after cancellation..."
STOCK2=$(curl -s -X GET "$API_URL/inventory/$LISTING_ID/available" | jq -r '.availableStock')
echo "Available stock after cancel: $STOCK2 (should be 100)"

if [ "$STOCK2" == "100" ]; then
  echo ""
  echo "🎉 Cancellation test passed! Stock released correctly."
else
  echo ""
  echo "❌ Cancellation test failed. Expected 100, got $STOCK2"
fi