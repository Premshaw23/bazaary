#!/bin/bash

set -e

# Load environment variables from part 1
if [ -f /tmp/test-week2-env.sh ]; then
  source /tmp/test-week2-env.sh
else
  echo "Missing /tmp/test-week2-env.sh. Run part 1 first."
  exit 1
fi


API_URL="http://localhost:3001/api"
TIMESTAMP=$(date +%s%N)$RANDOM

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}4. Creating product...${NC}"
echo "SELLER_TOKEN: $SELLER_TOKEN"
echo "Checking seller application response..."
SELLER_APPLY_RESPONSE=$(curl -s -X GET "$API_URL/sellers/me" \
  -H "Authorization: Bearer $SELLER_TOKEN")
echo "Seller application response: $SELLER_APPLY_RESPONSE"
echo "---"
PRODUCT_JSON=$(printf '{"sku":"ORDER-TEST-%s","name":"Premium Wireless Earbuds","brand":"AudioTech","description":"High-quality wireless earbuds with noise cancellation","shortDescription":"Premium earbuds with ANC","images":[{"url":"https://example.com/earbuds.jpg","alt":"Wireless Earbuds"}],"specifications":{"Battery Life":"24 hours","Connectivity":"Bluetooth 5.2","Noise Cancellation":"Active"},"searchKeywords":["wireless","earbuds","bluetooth","noise cancellation"]}' "$TIMESTAMP")
echo "Product JSON: $PRODUCT_JSON"
PRODUCT_RESPONSE=$(curl -s -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d "$PRODUCT_JSON")
echo "Product creation response: $PRODUCT_RESPONSE"

PRODUCT_ID=$(echo "$PRODUCT_RESPONSE" | jq -r '.id')

if [[ "$PRODUCT_ID" == "null" || -z "$PRODUCT_ID" ]]; then
  echo -e "${RED}✗ Product creation failed${NC}"
  echo "$PRODUCT_RESPONSE" | jq '.'
  exit 1
fi
echo -e "${GREEN}✓ Product created${NC}"
echo "Product ID: $PRODUCT_ID"

echo -e "\n${BLUE}5. Creating seller listing...${NC}"
LISTING_JSON=$(printf '{"productId":"%s","price":4999.99,"compareAtPrice":6999.99,"stockQuantity":50,"condition":"NEW","warrantyMonths":12,"returnWindowDays":7}' "$PRODUCT_ID")
LISTING_RESPONSE=$(curl -s -X POST "$API_URL/listings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d "$LISTING_JSON")

LISTING_ID=$(echo "$LISTING_RESPONSE" | jq -r '.id')

if [[ "$LISTING_ID" == "null" || -z "$LISTING_ID" ]]; then
  echo -e "${RED}✗ Listing creation failed${NC}"
  echo "$LISTING_RESPONSE" | jq '.'
  exit 1
fi
echo -e "${GREEN}✓ Listing created${NC}"
echo "Listing ID: $LISTING_ID"

echo -e "${YELLOW}Product & Listing Creation Complete${NC}"
# Save for next scripts
cat <<EOF >> /tmp/test-week2-env.sh
export PRODUCT_ID="$PRODUCT_ID"
export LISTING_ID="$LISTING_ID"
EOF
