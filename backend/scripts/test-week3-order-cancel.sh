#!/bin/bash
set -e

API_URL="http://localhost:3001/api"



# --- Register seller and get SELLER_TOKEN ---
TIMESTAMP=$(date +%s)
SELLER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"seller_cancel_${TIMESTAMP}@test.com\",\"password\": \"password123\",\"role\": \"SELLER\"}")
SELLER_TOKEN=$(echo "$SELLER_RESPONSE" | jq -r '.accessToken // .access_token')
if [[ -z "$SELLER_TOKEN" || "$SELLER_TOKEN" == "null" ]]; then
  echo "[ERROR] Seller token missing. Registration response was: $SELLER_RESPONSE"
  exit 1
fi

# --- Apply as seller (if required by API) ---
SELLER_APPLY_RESPONSE=$(curl -s -X POST "$API_URL/sellers/apply" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"businessName\": \"Test Seller $TIMESTAMP\",\"businessType\": \"INDIVIDUAL\",\"address\":{\"street\":\"123 Test St\",\"city\":\"Delhi\",\"state\":\"Delhi\",\"pincode\":\"110001\",\"country\":\"India\"},\"contactPhone\":\"+91-9999999999\"}")

# --- Create product ---
PRODUCT_ID=$(curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"sku\":\"CANCEL-${TIMESTAMP}\",\"name\":\"Cancel Test Product\",\"description\":\"Testing order cancel\"}" | jq -r '.id')

# --- Create listing ---
LISTING_RESPONSE=$(curl -s -X POST "$API_URL/listings" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"productId\":\"$PRODUCT_ID\",\"price\":100,\"stockQuantity\":5}")
LISTING_ID=$(echo "$LISTING_RESPONSE" | jq -r '.id')
if [[ -z "$LISTING_ID" || "$LISTING_ID" == "null" ]]; then
  echo "[ERROR] Listing creation failed. Response: $LISTING_RESPONSE"
  exit 1
fi

# --- Register buyer and get BUYER_TOKEN ---
BUYER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"buyer_cancel_${TIMESTAMP}@test.com\",\"password\":\"password123\",\"role\":\"BUYER\"}")
BUYER_TOKEN=$(echo "$BUYER_RESPONSE" | jq -r '.access_token // .accessToken')
if [[ -z "$BUYER_TOKEN" || "$BUYER_TOKEN" == "null" ]]; then
  echo "[ERROR] Buyer token missing. Registration response was: $BUYER_RESPONSE"
  exit 1
fi

# --- Place order as buyer ---
ORDER_RESPONSE=$(curl -s -X POST "$API_URL/orders" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"items\":[{\"listingId\":\"$LISTING_ID\",\"quantity\":1}],\"shippingAddress\":{\"name\":\"Cancel Tester\",\"phone\":\"+91-9999999999\",\"street\":\"Test Street\",\"city\":\"Delhi\",\"state\":\"Delhi\",\"pincode\":\"110001\",\"country\":\"India\"}}")
ORDER_ID=$(echo "$ORDER_RESPONSE" | jq -r '.id')
if [[ -z "$ORDER_ID" || "$ORDER_ID" == "null" ]]; then
  echo "[ERROR] Order creation failed. Response: $ORDER_RESPONSE"
  exit 1
fi

echo "Order: $ORDER_ID"
echo "Listing: $LISTING_ID"

echo "🧪 Testing Week 3: ORDER_CANCELLED → Inventory Release"
echo "====================================================="




# --- Check initial stock ---
BEFORE_RESPONSE=$(curl -s "$API_URL/listings/$LISTING_ID")
BEFORE=$(echo "$BEFORE_RESPONSE" | jq -r '.stockQuantity')
if [[ -z "$BEFORE" || "$BEFORE" == "null" ]]; then
  echo "[ERROR] Could not fetch initial stock. Response: $BEFORE_RESPONSE"
  exit 1
fi
echo "Stock before cancel: $BEFORE"


# Cancel order (seller/admin token required)
echo "Cancelling order $ORDER_ID..."
CANCEL_RESPONSE=$(curl -s -X PATCH "$API_URL/orders/$ORDER_ID/state" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{"state":"CANCELLED","reason":"Test cancel"}')
echo "[DEBUG] Cancel response: $CANCEL_RESPONSE"

sleep 4


# --- Check stock after cancel ---
AFTER_RESPONSE=$(curl -s "$API_URL/listings/$LISTING_ID")
AFTER=$(echo "$AFTER_RESPONSE" | jq -r '.stockQuantity')
if [[ -z "$AFTER" || "$AFTER" == "null" ]]; then
  echo "[ERROR] Could not fetch stock after cancel. Response: $AFTER_RESPONSE"
  exit 1
fi
echo "Stock after cancel: $AFTER"

if [[ "$AFTER" -gt "$BEFORE" ]]; then
  echo "✅ Inventory released successfully"
else
  echo "❌ Inventory release FAILED"
  exit 1
fi
