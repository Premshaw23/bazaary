#!/bin/bash

set -e

API_URL="http://localhost:3001/api"
TIMESTAMP=$(date +%s)

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Registering buyer...${NC}"
BUYER_JSON=$(printf '{"email":"buyer_%s@test.com","password":"password123","role":"BUYER"}' "$TIMESTAMP")
BUYER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "$BUYER_JSON")

BUYER_TOKEN=$(echo "$BUYER_RESPONSE" | jq -r '.access_token')
BUYER_ID=$(echo "$BUYER_RESPONSE" | jq -r '.user.id')

if [[ "$BUYER_ID" == "null" || -z "$BUYER_ID" ]]; then
  echo -e "${RED}✗ Buyer registration failed${NC}"
  echo "$BUYER_RESPONSE" | jq '.'
  exit 1
fi
echo -e "${GREEN}✓ Buyer registered${NC}"
echo "Buyer ID: $BUYER_ID"

echo -e "\n${BLUE}2. Registering seller...${NC}"
SELLER_JSON=$(printf '{"email":"seller_%s@test.com","password":"password123","role":"SELLER"}' "$TIMESTAMP")
SELLER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "$SELLER_JSON")

SELLER_TOKEN=$(echo "$SELLER_RESPONSE" | jq -r '.access_token')
SELLER_USER_ID=$(echo "$SELLER_RESPONSE" | jq -r '.user.id')

if [[ "$SELLER_USER_ID" == "null" || -z "$SELLER_USER_ID" ]]; then
  echo -e "${RED}✗ Seller registration failed${NC}"
  echo "$SELLER_RESPONSE" | jq '.'
  exit 1
fi
echo -e "${GREEN}✓ Seller registered${NC}"

echo -e "\n${BLUE}3. Applying as seller...${NC}"
SELLER_APPLY=$(curl -s -X POST "$API_URL/sellers/apply" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{
    "businessName": "Test Electronics Store",
    "businessType": "INDIVIDUAL",
    "description": "Premium electronics retailer",
    "address": {
      "street": "456 Market Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "country": "India"
    },
    "contactPhone": "+91-9876543210",
    "contactEmail": "seller_'${TIMESTAMP}'@test.com"
  }')

SELLER_ID=$(echo "$SELLER_APPLY" | jq -r '.id')

if [[ "$SELLER_ID" == "null" || -z "$SELLER_ID" ]]; then
  echo -e "${RED}✗ Seller application failed${NC}"
  echo "$SELLER_APPLY" | jq '.'
  exit 1
fi
echo -e "${GREEN}✓ Seller application created${NC}"
echo "Seller ID: $SELLER_ID"

echo -e "${YELLOW}Registration & Seller Application Complete${NC}"
# Save tokens and IDs for next scripts
cat <<EOF > /tmp/test-week2-env.sh
export BUYER_TOKEN="$BUYER_TOKEN"
export BUYER_ID="$BUYER_ID"
export SELLER_TOKEN="$SELLER_TOKEN"
export SELLER_USER_ID="$SELLER_USER_ID"
export SELLER_ID="$SELLER_ID"
export TIMESTAMP="$TIMESTAMP"
EOF
