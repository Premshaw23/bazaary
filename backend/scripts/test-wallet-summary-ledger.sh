#!/bin/bash
# test-wallet-summary-ledger.sh - Test Wallet Summary and Ledger APIs (Part 2)

set -e

API_URL="http://localhost:3001/api"
TIMESTAMP=$(date +%s)

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# --- Register seller ---
echo -e "${GREEN}Registering seller...${NC}"
SELLER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"seller_wallet2_${TIMESTAMP}@test.com\",\"password\": \"password123\",\"role\": \"SELLER\"}")
SELLER_TOKEN=$(echo "$SELLER_RESPONSE" | jq -r '.access_token // .accessToken')
if [[ -z "$SELLER_TOKEN" || "$SELLER_TOKEN" == "null" ]]; then
  echo -e "${RED}[ERROR] Seller token missing. Registration response was: $SELLER_RESPONSE${NC}"
  exit 1
fi

# --- Apply as seller ---
echo -e "${GREEN}Applying as seller...${NC}"
SELLER_APPLY_RESPONSE=$(curl -s -X POST "$API_URL/sellers/apply" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"businessName\": \"Wallet Seller $TIMESTAMP\",\"businessType\": \"INDIVIDUAL\",\"address\":{\"street\":\"123 Test St\",\"city\":\"Delhi\",\"state\":\"Delhi\",\"pincode\":\"110001\",\"country\":\"India\"},\"contactPhone\":\"+91-9999999999\"}")
SELLER_ID=$(echo "$SELLER_APPLY_RESPONSE" | jq -r '.id')
if [[ -z "$SELLER_ID" || "$SELLER_ID" == "null" ]]; then
  echo -e "${RED}[ERROR] Seller apply failed. Response: $SELLER_APPLY_RESPONSE${NC}"
  exit 1
fi

# --- Register buyer ---
echo -e "${GREEN}Registering buyer...${NC}"
BUYER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"buyer_wallet2_${TIMESTAMP}@test.com\",\"password\": \"password123\",\"role\": \"BUYER\"}")
BUYER_TOKEN=$(echo "$BUYER_RESPONSE" | jq -r '.access_token // .accessToken')
if [[ -z "$BUYER_TOKEN" || "$BUYER_TOKEN" == "null" ]]; then
  echo -e "${RED}[ERROR] Buyer token missing. Registration response was: $BUYER_RESPONSE${NC}"
  exit 1
fi

# --- Create product ---
echo -e "${GREEN}Creating product...${NC}"
PRODUCT_ID=$(curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"sku\":\"WALLET2-${TIMESTAMP}\",\"name\":\"Wallet Test Product 2\",\"description\":\"Wallet flow 2\"}" | jq -r '.id')
if [[ -z "$PRODUCT_ID" || "$PRODUCT_ID" == "null" ]]; then
  echo -e "${RED}[ERROR] Product creation failed.${NC}"
  exit 1
fi

# --- Create listing ---
echo -e "${GREEN}Creating listing...${NC}"
LISTING_RESPONSE=$(curl -s -X POST "$API_URL/listings" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"productId\":\"$PRODUCT_ID\",\"price\":500,\"stockQuantity\":10}")
LISTING_ID=$(echo "$LISTING_RESPONSE" | jq -r '.id')
if [[ -z "$LISTING_ID" || "$LISTING_ID" == "null" ]]; then
  echo -e "${RED}[ERROR] Listing creation failed. Response: $LISTING_RESPONSE${NC}"
  exit 1
fi

# --- Place order ---
echo -e "${GREEN}Placing order...${NC}"
ORDER_RESPONSE=$(curl -s -X POST "$API_URL/orders" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"items\":[{\"listingId\":\"$LISTING_ID\",\"quantity\":2}],\"shippingAddress\":{\"name\":\"Wallet Buyer\",\"phone\":\"+91-9999999999\",\"street\":\"Test\",\"city\":\"Delhi\",\"state\":\"Delhi\",\"pincode\":\"110001\",\"country\":\"India\"}}")
ORDER_ID=$(echo "$ORDER_RESPONSE" | jq -r '.id')
if [[ -z "$ORDER_ID" || "$ORDER_ID" == "null" ]]; then
  echo -e "${RED}[ERROR] Order creation failed. Response: $ORDER_RESPONSE${NC}"
  exit 1
fi
# Debug: print order details
ORDER_DETAILS=$(curl -s -X GET "$API_URL/orders/$ORDER_ID" -H "Authorization: Bearer $SELLER_TOKEN")
echo -e "${GREEN}Order details after creation:${NC} $ORDER_DETAILS"
sleep 3

# --- Pay ---
echo -e "${GREEN}Paying for order...${NC}"
PAYMENT_RESPONSE=$(curl -s -X POST "$API_URL/payments/initiate" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: wallet2-${TIMESTAMP}" \
  -d "{\"orderId\":\"$ORDER_ID\",\"method\":\"CARD\"}")
PAYMENT_ID=$(echo "$PAYMENT_RESPONSE" | jq -r '.id')
TXN=$(echo "$PAYMENT_RESPONSE" | jq -r '.gatewayTransactionId')
if [[ -z "$PAYMENT_ID" || "$PAYMENT_ID" == "null" ]]; then
  echo -e "${RED}[ERROR] Payment initiation failed. Response: $PAYMENT_RESPONSE${NC}"
  exit 1
fi
sleep 2
curl -s -X POST "$API_URL/payments/verify" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"paymentId\":\"$PAYMENT_ID\",\"transactionId\":\"$TXN\"}" > /dev/null
sleep 4
# Debug: print order details after payment
ORDER_DETAILS_AFTER_PAYMENT=$(curl -s -X GET "$API_URL/orders/$ORDER_ID" -H "Authorization: Bearer $SELLER_TOKEN")
echo -e "${GREEN}Order details after payment:${NC} $ORDER_DETAILS_AFTER_PAYMENT"

echo -e "${GREEN}Checking wallet summary (should be LOCKED/AVAILABLE)...${NC}"
SUMMARY=$(curl -s -X GET "$API_URL/wallets/summary" -H "Authorization: Bearer $SELLER_TOKEN")
echo "Wallet summary: $SUMMARY"

echo -e "${GREEN}Checking wallet ledger (should show recent transactions)...${NC}"
LEDGER=$(curl -s -X GET "$API_URL/wallets/ledger?limit=5" -H "Authorization: Bearer $SELLER_TOKEN")
echo "Wallet ledger: $LEDGER"

echo -e "${GREEN}Wallet summary/ledger API test complete!${NC}"
