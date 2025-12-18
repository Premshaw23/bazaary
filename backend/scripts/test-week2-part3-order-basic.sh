#!/bin/bash

set -e

# Load environment variables from previous parts
if [ -f /tmp/test-week2-env.sh ]; then
  source /tmp/test-week2-env.sh
else
  echo "Missing /tmp/test-week2-env.sh. Run previous parts first."
  exit 1
fi

API_URL="http://localhost:3001/api"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}6. Checking available stock...${NC}"
STOCK_CHECK=$(curl -s -X GET "$API_URL/inventory/$LISTING_ID/available")
echo "$STOCK_CHECK" | jq '.'

echo -e "\n${BLUE}7. Creating order...${NC}"
echo "BUYER_TOKEN: $BUYER_TOKEN"
echo "LISTING_ID: $LISTING_ID"
echo "SELLER_TOKEN: $SELLER_TOKEN"
if [ -z "$BUYER_TOKEN" ] || [ -z "$LISTING_ID" ] || [ -z "$SELLER_TOKEN" ]; then
  echo -e "${RED}✗ One or more required variables are missing. Aborting.${NC}"
  exit 1
fi
ORDER_JSON=$(printf '{"items":[{"listingId":"%s","quantity":2}],"shippingAddress":{"name":"John Doe","phone":"+91-9876543211","street":"123 Buyer Street","city":"Delhi","state":"Delhi","pincode":"110001","country":"India"},"billingAddress":{"name":"John Doe","phone":"+91-9876543211","street":"123 Buyer Street","city":"Delhi","state":"Delhi","pincode":"110001","country":"India"},"notes":"Please deliver during business hours"}' "$LISTING_ID")
echo "ORDER_JSON: $ORDER_JSON"
ORDER_RESPONSE=$(curl --max-time 15 -s -X POST "$API_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d "$ORDER_JSON")
echo "ORDER_RESPONSE: $ORDER_RESPONSE"

ORDER_ID=$(echo "$ORDER_RESPONSE" | jq -r '.id')
ORDER_NUMBER=$(echo "$ORDER_RESPONSE" | jq -r '.orderNumber')

if [[ "$ORDER_ID" == "null" || -z "$ORDER_ID" ]]; then
  echo -e "${RED}✗ Order creation failed${NC}"
  echo "$ORDER_RESPONSE" | jq '.'
  exit 1
fi
echo -e "${GREEN}✓ Order created${NC}"
echo "Order ID: $ORDER_ID"
echo "Order Number: $ORDER_NUMBER"
echo "Order State: $(echo "$ORDER_RESPONSE" | jq -r '.state')"
echo "Total Amount: ₹$(echo "$ORDER_RESPONSE" | jq -r '.totalAmount')"

echo -e "\n${BLUE}8. Fetching order details...${NC}"
ORDER_DETAILS=$(curl -s -X GET "$API_URL/orders/$ORDER_ID" \
  -H "Authorization: Bearer $BUYER_TOKEN")
echo "$ORDER_DETAILS" | jq '{
  orderNumber: .orderNumber,
  state: .state,
  subtotal: .subtotal,
  taxAmount: .taxAmount,
  totalAmount: .totalAmount,
  shippingAddress: .shippingAddress
}'

echo -e "\n${BLUE}9. Fetching order items...${NC}"
ORDER_ITEMS=$(curl -s -X GET "$API_URL/orders/$ORDER_ID/items" \
  -H "Authorization: Bearer $BUYER_TOKEN")
echo "$ORDER_ITEMS" | jq '.[]| {
  productName: .productName,
  quantity: .quantity,
  unitPrice: .unitPrice,
  totalPrice: .totalPrice
}'

echo -e "\n${BLUE}10. Checking inventory after order (should show reserved)...${NC}"
STOCK_AFTER=$(curl -s -X GET "$API_URL/inventory/$LISTING_ID/available")
echo "$STOCK_AFTER" | jq '.'

echo -e "${YELLOW}Order Creation & Basic Checks Complete${NC}"
# Save for next scripts
cat <<EOF >> /tmp/test-week2-env.sh
export ORDER_ID="$ORDER_ID"
export ORDER_NUMBER="$ORDER_NUMBER"
EOF
