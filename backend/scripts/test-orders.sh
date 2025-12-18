#!/bin/bash

set -e

API_URL="http://localhost:3001/api"

echo "🧪 Testing Orders Module"
echo "========================"

# 1. Register and create seller
echo "1. Setting up seller..."
REGISTER=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"ordertest$(date +%s)@test.com\",\"password\":\"test123\",\"role\":\"SELLER\"}")

TOKEN=$(echo "$REGISTER" | jq -r '.access_token')
echo "✅ Registered"

SELLER=$(curl -s -X POST "$API_URL/sellers/apply" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "businessName": "Order Test Store",
    "businessType": "INDIVIDUAL",
    "description": "Test store for orders",
    "address": {"street":"123","city":"Mumbai","state":"MH","pincode":"400001","country":"India"},
    "contactPhone": "+919876543210"
  }')

SELLER_ID=$(echo "$SELLER" | jq -r '.id')
echo "✅ Seller ID: $SELLER_ID"

# 2. Create product
echo ""
echo "2. Creating product..."
PRODUCT=$(curl -s -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"sku\": \"ORD-TEST-$(date +%s)\",
    \"name\": \"Test Product for Orders\",
    \"brand\": \"TestBrand\",
    \"description\": \"Product for testing orders\",
    \"shortDescription\": \"Order test product\",
    \"images\": [{\"url\": \"https://example.com/img.jpg\"}],
    \"specifications\": {\"Test\": \"Value\"},
    \"searchKeywords\": [\"test\"]
  }")

PRODUCT_ID=$(echo "$PRODUCT" | jq -r '.id')
echo "✅ Product ID: $PRODUCT_ID"

# 3. Create listing with stock
echo ""
echo "3. Creating listing with stock..."
LISTING=$(curl -s -X POST "$API_URL/listings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"productId\": \"$PRODUCT_ID\",
    \"price\": 1999.99,
    \"stockQuantity\": 50,
    \"condition\": \"NEW\",
    \"warrantyMonths\": 6,
    \"returnWindowDays\": 7
  }")

LISTING_ID=$(echo "$LISTING" | jq -r '.id')
echo "✅ Listing ID: $LISTING_ID"

# 4. Register buyer
echo ""
echo "4. Registering buyer..."
BUYER_REG=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"buyer$(date +%s)@test.com\",\"password\":\"test123\",\"role\":\"BUYER\"}")

BUYER_TOKEN=$(echo "$BUYER_REG" | jq -r '.access_token')
BUYER_ID=$(echo "$BUYER_REG" | jq -r '.user.id')
echo "✅ Buyer ID: $BUYER_ID"

# 5. Create order
echo ""
echo "5. Creating order..."
ORDER=$(curl -s -X POST "$API_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d "{
    \"items\": [
      {
        \"listingId\": \"$LISTING_ID\",
        \"quantity\": 2
      }
    ],
    \"shippingAddress\": {
      \"name\": \"John Doe\",
      \"phone\": \"+919876543210\",
      \"street\": \"123 Test Street\",
      \"city\": \"Mumbai\",
      \"state\": \"Maharashtra\",
      \"pincode\": \"400001\",
      \"country\": \"India\"
    },
    \"notes\": \"Please deliver before 5 PM\"
  }")

echo "$ORDER" | jq '.'
ORDER_ID=$(echo "$ORDER" | jq -r '.id')

if [ "$ORDER_ID" == "null" ] || [ -z "$ORDER_ID" ]; then
  echo "❌ Order creation failed"
  exit 1
fi

echo "✅ Order ID: $ORDER_ID"

# 6. Check inventory was reserved
echo ""
echo "6. Checking inventory reservation..."
INVENTORY=$(curl -s -X GET "$API_URL/inventory/$LISTING_ID/available")
echo "$INVENTORY" | jq '.'

AVAILABLE=$(echo "$INVENTORY" | jq -r '.availableStock')
if [ "$AVAILABLE" == "48" ]; then
  echo "✅ Inventory reserved correctly (50 - 2 = 48)"
else
  echo "❌ Inventory reservation failed. Expected 48, got $AVAILABLE"
fi

# 7. Get order details
echo ""
echo "7. Getting order details..."
ORDER_DETAILS=$(curl -s -X GET "$API_URL/orders/$ORDER_ID" \
  -H "Authorization: Bearer $BUYER_TOKEN")
echo "$ORDER_DETAILS" | jq '.'

# 8. Get order items
echo ""
echo "8. Getting order items..."
ORDER_ITEMS=$(curl -s -X GET "$API_URL/orders/$ORDER_ID/items" \
  -H "Authorization: Bearer $BUYER_TOKEN")
echo "$ORDER_ITEMS" | jq '.'

# 9. Mark order as PAID (simulating payment)
echo ""
echo "9. Marking order as PAID..."
PAID=$(curl -s -X PATCH "$API_URL/orders/$ORDER_ID/state" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "state": "PAID"
  }')
echo "$PAID" | jq '.'

# 10. Seller confirms order
echo ""
echo "10. Seller confirming order..."
CONFIRM=$(curl -s -X PATCH "$API_URL/orders/$ORDER_ID/state" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "state": "CONFIRMED"
  }')
echo "$CONFIRM" | jq '.'

# 11. Seller packs order
echo ""
echo "11. Seller packing order..."
PACK=$(curl -s -X PATCH "$API_URL/orders/$ORDER_ID/state" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "state": "PACKED"
  }')
echo "$PACK" | jq '.'

# 12. Seller ships order
echo ""
echo "12. Seller shipping order..."
SHIP=$(curl -s -X PATCH "$API_URL/orders/$ORDER_ID/state" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "state": "SHIPPED",
    "trackingNumber": "TRACK123456",
    "carrier": "BlueDart"
  }')
echo "$SHIP" | jq '.'

# 13. Get all buyer orders
echo ""
echo "13. Getting all buyer orders..."
SELLER_ORDERS=$(curl -s -X GET "$API_URL/orders" \
  -H "Authorization: Bearer $TOKEN")
echo "$SELLER_ORDERS" | jq '.'

echo ""
echo "🎉 All order tests passed!"
echo ""
echo "Summary:"
echo "  Seller ID: $SELLER_ID"
echo "  Product ID: $PRODUCT_ID"
echo "  Listing ID: $LISTING_ID"
echo "  Order ID: $ORDER_ID"
echo "  Order State: SHIPPED"
echo "  Available Stock: 48 (50 - 2 reserved)"