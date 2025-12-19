#!/bin/bash
set -e

API_URL="http://localhost:3001/api"
TIMESTAMP=$(date +%s)

echo "🧪 Testing Week 3: ORDER_PAID → Inventory Deduct"
echo "=============================================="

# --- Register buyer ---
BUYER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"buyer_paid_${TIMESTAMP}@test.com\",\"password\": \"password123\",\"role\": \"BUYER\"}")
BUYER_TOKEN=$(echo "$BUYER_RESPONSE" | jq -r '.access_token // .accessToken')
if [[ -z "$BUYER_TOKEN" || "$BUYER_TOKEN" == "null" ]]; then
  echo "[ERROR] Buyer token missing. Registration response was: $BUYER_RESPONSE"
  exit 1
fi

# --- Register seller ---
SELLER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"seller_paid_${TIMESTAMP}@test.com\",\"password\": \"password123\",\"role\": \"SELLER\"}")
SELLER_TOKEN=$(echo "$SELLER_RESPONSE" | jq -r '.access_token // .accessToken')
if [[ -z "$SELLER_TOKEN" || "$SELLER_TOKEN" == "null" ]]; then
  echo "[ERROR] Seller token missing. Registration response was: $SELLER_RESPONSE"
  exit 1
fi

# --- Apply as seller ---
SELLER_APPLY_RESPONSE=$(curl -s -X POST "$API_URL/sellers/apply" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"businessName\": \"Paid Seller $TIMESTAMP\",\"businessType\": \"INDIVIDUAL\",\"address\":{\"street\":\"123 Test St\",\"city\":\"Delhi\",\"state\":\"Delhi\",\"pincode\":\"110001\",\"country\":\"India\"},\"contactPhone\":\"+91-9999999999\"}")
SELLER_ID=$(echo "$SELLER_APPLY_RESPONSE" | jq -r '.id')
if [[ -z "$SELLER_ID" || "$SELLER_ID" == "null" ]]; then
  echo "[ERROR] Seller apply failed. Response: $SELLER_APPLY_RESPONSE"
  exit 1
fi

# --- Create product ---
PRODUCT_ID=$(curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"sku\":\"PAID-${TIMESTAMP}\",\"name\":\"Paid Test Product\",\"description\":\"Paid flow\"}" | jq -r '.id')
if [[ -z "$PRODUCT_ID" || "$PRODUCT_ID" == "null" ]]; then
  echo "[ERROR] Product creation failed."
  exit 1
fi

# --- Create listing ---
LISTING_RESPONSE=$(curl -s -X POST "$API_URL/listings" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"productId\":\"$PRODUCT_ID\",\"price\":500,\"stockQuantity\":10}")
LISTING_ID=$(echo "$LISTING_RESPONSE" | jq -r '.id')
if [[ -z "$LISTING_ID" || "$LISTING_ID" == "null" ]]; then
  echo "[ERROR] Listing creation failed. Response: $LISTING_RESPONSE"
  exit 1
fi

 # --- Check initial stock ---
INITIAL_RESPONSE=$(curl -s "$API_URL/listings/$LISTING_ID")
INITIAL=$(echo "$INITIAL_RESPONSE" | jq -r '.stockQuantity')
if [[ -z "$INITIAL" || "$INITIAL" == "null" ]]; then
  echo "[ERROR] Could not fetch initial stock. Response: $INITIAL_RESPONSE"
  exit 1
fi
echo "Initial stock: $INITIAL"

# --- Place order ---
ORDER_RESPONSE=$(curl -s -X POST "$API_URL/orders" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"items\":[{\"listingId\":\"$LISTING_ID\",\"quantity\":2}],\"shippingAddress\":{\"name\":\"Paid Buyer\",\"phone\":\"+91-9999999999\",\"street\":\"Test\",\"city\":\"Delhi\",\"state\":\"Delhi\",\"pincode\":\"110001\",\"country\":\"India\"}}")
ORDER_ID=$(echo "$ORDER_RESPONSE" | jq -r '.id')
if [[ -z "$ORDER_ID" || "$ORDER_ID" == "null" ]]; then
  echo "[ERROR] Order creation failed. Response: $ORDER_RESPONSE"
  exit 1
fi
sleep 3

 # --- Check reserved stock ---
RESERVED_RESPONSE=$(curl -s "$API_URL/listings/$LISTING_ID")
RESERVED=$(echo "$RESERVED_RESPONSE" | jq -r '.stockQuantity')
if [[ -z "$RESERVED" || "$RESERVED" == "null" ]]; then
  echo "[ERROR] Could not fetch reserved stock. Response: $RESERVED_RESPONSE"
  exit 1
fi
echo "After ORDER_CREATED (reserved): $RESERVED"

# --- Pay ---
PAYMENT_RESPONSE=$(curl -s -X POST "$API_URL/payments/initiate" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: paid-${TIMESTAMP}" \
  -d "{\"orderId\":\"$ORDER_ID\",\"method\":\"CARD\"}")
PAYMENT_ID=$(echo "$PAYMENT_RESPONSE" | jq -r '.id')
TXN=$(echo "$PAYMENT_RESPONSE" | jq -r '.gatewayTransactionId')
if [[ -z "$PAYMENT_ID" || "$PAYMENT_ID" == "null" ]]; then
  echo "[ERROR] Payment initiation failed. Response: $PAYMENT_RESPONSE"
  exit 1
fi

sleep 2

curl -s -X POST "$API_URL/payments/verify" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"paymentId\":\"$PAYMENT_ID\",\"transactionId\":\"$TXN\"}" > /dev/null

sleep 4

 # --- Check final stock ---
FINAL_RESPONSE=$(curl -s "$API_URL/listings/$LISTING_ID")
FINAL=$(echo "$FINAL_RESPONSE" | jq -r '.stockQuantity')
if [[ -z "$FINAL" || "$FINAL" == "null" ]]; then
  echo "[ERROR] Could not fetch final stock. Response: $FINAL_RESPONSE"
  exit 1
fi
echo "After ORDER_PAID (deducted): $FINAL"

if [[ "$FINAL" -eq "$RESERVED" ]]; then
  echo "❌ Inventory not deducted"
  exit 1
fi

echo "✅ Inventory deducted correctly"
