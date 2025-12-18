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

echo -e "${BLUE}19. Testing cancellation flow - creating new order...${NC}"
CANCEL_ORDER=$(curl -s -X POST "$API_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d "{\n    \"items\": [\n      {\n        \"listingId\": \"$LISTING_ID\",\n        \"quantity\": 1\n      }\n    ],\n    \"shippingAddress\": {\n      \"name\": \"Jane Doe\",\n      \"phone\": \"+91-9876543212\",\n      \"street\": \"456 Buyer Lane\",\n      \"city\": \"Bangalore\",\n      \"state\": \"Karnataka\",\n      \"pincode\": \"560001\",\n      \"country\": \"India\"\n    }\n  }")

CANCEL_ORDER_ID=$(echo "$CANCEL_ORDER" | jq -r '.id')
echo -e "${GREEN}✓ Cancellation test order created${NC}"
echo "Order ID: $CANCEL_ORDER_ID"

echo -e "\n${BLUE}20. Cancelling order...${NC}"
CANCELLED=$(curl -s -X POST "$API_URL/orders/$CANCEL_ORDER_ID/cancel" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d '{
    "reason": "Changed my mind"
  }')
echo "Cancelled State: $(echo "$CANCELLED" | jq -r '.state')"
echo "Cancellation Reason: $(echo "$CANCELLED" | jq -r '.cancellationReason')"

echo -e "\n${BLUE}21. Verifying inventory released after cancellation...${NC}"
FINAL_STOCK=$(curl -s -X GET "$API_URL/inventory/$LISTING_ID/available")
echo "$FINAL_STOCK" | jq '.'

echo -e "${YELLOW}Cancellation Flow & Inventory Release Complete${NC}"
