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

echo -e "${BLUE}1. Registering seller...${NC}"
SELLER_RESPONSE=$(echo "{
  \"email\": \"seller_${TIMESTAMP}@test.com\",
  \"password\": \"password123\",
  \"role\": \"SELLER\"
}" | curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d @-)
SELLER_TOKEN=$(echo "$SELLER_RESPONSE" | jq -r '.access_token')
if [[ -z "$SELLER_TOKEN" || "$SELLER_TOKEN" == "null" ]]; then
  echo -e "${RED}✗ Seller registration failed${NC}"
  echo "$SELLER_RESPONSE" | jq '.'
  exit 1
fi
echo -e "${GREEN}✓ Seller registered${NC}"

echo -e "\n${BLUE}2. Applying as seller...${NC}"
SELLER_APPLY=$(echo "{
  \"businessName\": \"My Test Store\",
  \"businessType\": \"INDIVIDUAL\",
  \"description\": \"Testing /products/my endpoint\",
  \"address\": {
    \"street\": \"123 Test St\",
    \"city\": \"Mumbai\",
    \"state\": \"Maharashtra\",
    \"pincode\": \"400001\",
    \"country\": \"India\"
  },
  \"contactPhone\": \"+91-9876543210\",
  \"contactEmail\": \"seller_${TIMESTAMP}@test.com\"
}" | curl -s -X POST "$API_URL/sellers/apply" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d @-)
SELLER_ID=$(echo "$SELLER_APPLY" | jq -r '.id')
echo -e "${GREEN}✓ Seller applied${NC}"

echo -e "\n${BLUE}3. Creating product...${NC}"
PRODUCT_RESPONSE=$(echo "{
  \"sku\": \"MY-TEST-${TIMESTAMP}\",
  \"name\": \"My Test Product\",
  \"brand\": \"TestBrand\",
  \"description\": \"Product for /products/my test\",
  \"shortDescription\": \"Test product\",
  \"images\": [{\"url\": \"https://example.com/test.jpg\", \"alt\": \"Test\"}],
  \"specifications\": {\"Type\": \"Test\"},
  \"searchKeywords\": [\"test\", \"my\"]
}" | curl -s -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d @-)
PRODUCT_ID=$(echo "$PRODUCT_RESPONSE" | jq -r '.id')
if [[ -z "$PRODUCT_ID" || "$PRODUCT_ID" == "null" ]]; then
  echo -e "${RED}✗ Product creation failed${NC}"
  echo "$PRODUCT_RESPONSE" | jq '.'
  exit 1
fi
echo -e "${GREEN}✓ Product created${NC}"

echo -e "\n${BLUE}4. Fetching seller's products via /products/my...${NC}"
MY_PRODUCTS=$(curl -s -X GET "$API_URL/products/my" \
  -H "Authorization: Bearer $SELLER_TOKEN")
echo "$MY_PRODUCTS" | jq '.'

echo -e "${YELLOW}Test complete. If you see your product above, /products/my is working.${NC}"
