#!/bin/bash
set -e

API_URL="http://localhost:3001/api"
TIMESTAMP=$(date +%s)

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Register seller
echo -e "${GREEN}Registering seller...${NC}"
SELLER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"seller_pf_${TIMESTAMP}@test.com\",\"password\": \"password123\",\"role\": \"SELLER\"}")
SELLER_TOKEN=$(echo "$SELLER_RESPONSE" | jq -r '.access_token // .accessToken')
SELLER_ID=$(curl -s -X POST "$API_URL/sellers/apply" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"businessName\": \"PF Seller $TIMESTAMP\",\"businessType\": \"INDIVIDUAL\",\"address\":{\"street\":\"123 Test St\",\"city\":\"Delhi\",\"state\":\"Delhi\",\"pincode\":\"110001\",\"country\":\"India\"},\"contactPhone\":\"+91-9999999999\"}" | jq -r '.id')

# Register buyer
echo -e "${GREEN}Registering buyer...${NC}"
BUYER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"buyer_pf_${TIMESTAMP}@test.com\",\"password\": \"password123\",\"role\": \"BUYER\"}")
BUYER_TOKEN=$(echo "$BUYER_RESPONSE" | jq -r '.access_token // .accessToken')

# Create product and listing
PRODUCT_ID=$(curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"sku\":\"PF-${TIMESTAMP}\",\"name\":\"Platform Fee Test\",\"description\":\"PF flow\"}" | jq -r '.id')
LISTING_ID=$(curl -s -X POST "$API_URL/listings" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"productId\":\"$PRODUCT_ID\",\"price\":1000,\"stockQuantity\":1}" | jq -r '.id')

# Place order
ORDER_ID=$(curl -s -X POST "$API_URL/orders" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"items\":[{\"listingId\":\"$LISTING_ID\",\"quantity\":1}],\"shippingAddress\":{\"name\":\"PF Buyer\",\"phone\":\"+91-9999999999\",\"street\":\"Test\",\"city\":\"Delhi\",\"state\":\"Delhi\",\"pincode\":\"110001\",\"country\":\"India\"}}" | jq -r '.id')
sleep 2

# Pay for order
PAYMENT_RESPONSE=$(curl -s -X POST "$API_URL/payments/initiate" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: pf-${TIMESTAMP}" \
  -d "{\"orderId\":\"$ORDER_ID\",\"method\":\"CARD\"}")
PAYMENT_ID=$(echo "$PAYMENT_RESPONSE" | jq -r '.id')
TXN=$(echo "$PAYMENT_RESPONSE" | jq -r '.gatewayTransactionId')
sleep 2
curl -s -X POST "$API_URL/payments/verify" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"paymentId\":\"$PAYMENT_ID\",\"transactionId\":\"$TXN\"}" > /dev/null
sleep 3

# Check seller wallet summary
echo -e "${GREEN}Checking seller wallet summary...${NC}"
LEDGER_SUMMARY=$(curl -s -X GET "$API_URL/wallets/summary/$SELLER_ID" -H "Authorization: Bearer $SELLER_TOKEN")
echo "Seller wallet summary: $LEDGER_SUMMARY"

# Check platform ledger (admin required)
echo -e "${GREEN}Checking platform ledger...${NC}"
ADMIN_EMAIL="admin_pf_${TIMESTAMP}@test.com"
ADMIN_PASSWORD="password123"

# Register admin (ignore errors if already exists)
curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$ADMIN_EMAIL\",\"password\": \"$ADMIN_PASSWORD\",\"role\": \"ADMIN\"}" > /dev/null

# Login as admin
ADMIN_LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$ADMIN_EMAIL\",\"password\": \"$ADMIN_PASSWORD\"}")
ADMIN_TOKEN=$(echo "$ADMIN_LOGIN_RESPONSE" | jq -r '.access_token // .accessToken')
PLATFORM_LEDGER=$(curl -s -X GET "$API_URL/wallets/platform-ledger" -H "Authorization: Bearer $ADMIN_TOKEN")
echo "Platform ledger: $PLATFORM_LEDGER"

echo -e "${GREEN}Platform fee test complete!${NC}"