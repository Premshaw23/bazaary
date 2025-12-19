#!/bin/bash
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
  -d "{\"email\": \"seller_wallet_${TIMESTAMP}@test.com\",\"password\": \"password123\",\"role\": \"SELLER\"}")
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
  -d "{\"email\": \"buyer_wallet_${TIMESTAMP}@test.com\",\"password\": \"password123\",\"role\": \"BUYER\"}")
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
  -d "{\"sku\":\"WALLET-${TIMESTAMP}\",\"name\":\"Wallet Test Product\",\"description\":\"Wallet flow\"}" | jq -r '.id')
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
sleep 3

# --- Pay ---
echo -e "${GREEN}Paying for order...${NC}"
PAYMENT_RESPONSE=$(curl -s -X POST "$API_URL/payments/initiate" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: wallet-${TIMESTAMP}" \
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

echo -e "${GREEN}Checking wallet ledger (should be LOCKED)...${NC}"
LEDGER_LOCKED=$(curl -s -X GET "$API_URL/wallets/summary/$SELLER_ID" -H "Authorization: Bearer $SELLER_TOKEN")
echo "Ledger summary after payment: $LEDGER_LOCKED"




# --- Admin login or register ---
echo -e "${GREEN}Logging in as admin...${NC}"
ADMIN_EMAIL="admin_wallet_${TIMESTAMP}@test.com"
ADMIN_PASSWORD="password123"

# Try to register admin (ignore errors if already exists)
ADMIN_REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "'$ADMIN_EMAIL'","password": "'$ADMIN_PASSWORD'","role": "ADMIN"}')

# Login as admin
ADMIN_LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "'$ADMIN_EMAIL'","password": "'$ADMIN_PASSWORD'"}')
ADMIN_TOKEN=$(echo "$ADMIN_LOGIN_RESPONSE" | jq -r '.access_token // .accessToken')
if [[ -z "$ADMIN_TOKEN" || "$ADMIN_TOKEN" == "null" ]]; then
  echo -e "${RED}[ERROR] Admin login failed. Response: $ADMIN_LOGIN_RESPONSE${NC}"
  exit 1
fi

# --- Simulate T+7 unlock using backend API ---
echo -e "${GREEN}Unlocking wallet ledger for payout...${NC}"
UNLOCK_RESPONSE=$(curl -s -X POST "$API_URL/wallets/unlock-for-test" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sellerId": "'$SELLER_ID'"}')
echo "Unlock response: $UNLOCK_RESPONSE"


sleep 2 # Ensure DB update is committed
echo -e "${GREEN}Checking wallet ledger (should be AVAILABLE)...${NC}"
LEDGER_AVAILABLE=$(curl -s -X GET "$API_URL/wallets/summary/$SELLER_ID" -H "Authorization: Bearer $SELLER_TOKEN")
echo "Ledger summary after unlock: $LEDGER_AVAILABLE"

# --- Request payout ---
echo -e "${GREEN}Requesting payout...${NC}"
PAYOUT_RESPONSE=$(curl -s -X POST "$API_URL/wallets/payout" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000}')
echo "Payout request response: $PAYOUT_RESPONSE"

echo -e "${GREEN}Wallet lifecycle test complete!${NC}"
