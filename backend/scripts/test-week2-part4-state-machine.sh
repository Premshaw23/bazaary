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

echo -e "${BLUE}11. Viewing inventory transactions...${NC}"
INVENTORY_TXN=$(curl -s -X GET "$API_URL/inventory/$LISTING_ID/transactions" \
  -H "Authorization: Bearer $SELLER_TOKEN")
echo "$INVENTORY_TXN" | jq '.[]| {
  type: .type,
  quantity: .quantity,
  reason: .reason,
  createdAt: .createdAt
}' | head -20

echo -e "\n${BLUE}12. Seller viewing their orders...${NC}"
SELLER_ORDERS=$(curl -s -X GET "$API_URL/orders" \
  -H "Authorization: Bearer $SELLER_TOKEN")
echo "$SELLER_ORDERS" | jq '.[]| {
  orderNumber: .orderNumber,
  state: .state,
  totalAmount: .totalAmount,
  createdAt: .createdAt
}'

echo -e "\n${BLUE}13. Testing invalid state transition (CREATED -> SHIPPED, should fail)...${NC}"
INVALID_TRANSITION=$(curl -s -X PATCH "$API_URL/orders/$ORDER_ID/state" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{
    "state": "SHIPPED"
  }')
ERROR_MSG=$(echo "$INVALID_TRANSITION" | jq -r '.message')
if [[ "$ERROR_MSG" == *"Invalid state transition"* ]]; then
  echo -e "${GREEN}✓ Invalid transition correctly blocked${NC}"
else
  echo -e "${YELLOW}⚠ Expected error but got:${NC}"
  echo "$INVALID_TRANSITION" | jq '.'
fi

echo -e "\n${BLUE}14. Transitioning order to PAYMENT_PENDING...${NC}"
PAYMENT_PENDING=$(curl -s -X PATCH "$API_URL/orders/$ORDER_ID/state" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{
    "state": "PAYMENT_PENDING"
  }')
echo "New State: $(echo "$PAYMENT_PENDING" | jq -r '.state')"

echo -e "\n${BLUE}15. Transitioning order to PAID...${NC}"
PAID_ORDER=$(curl -s -X PATCH "$API_URL/orders/$ORDER_ID/state" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{
    "state": "PAID"
  }')
echo "New State: $(echo "$PAID_ORDER" | jq -r '.state')"

echo -e "\n${BLUE}16. Seller confirming order...${NC}"
CONFIRMED=$(curl -s -X PATCH "$API_URL/orders/$ORDER_ID/state" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{
    "state": "CONFIRMED"
  }')
echo "New State: $(echo "$CONFIRMED" | jq -r '.state')"
echo "Confirmed At: $(echo "$CONFIRMED" | jq -r '.confirmedAt')"

echo -e "\n${BLUE}17. Seller packing order...${NC}"
PACKED=$(curl -s -X PATCH "$API_URL/orders/$ORDER_ID/state" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{
    "state": "PACKED"
  }')
echo "New State: $(echo "$PACKED" | jq -r '.state')"

echo -e "\n${BLUE}18. Seller shipping order...${NC}"
SHIPPED=$(curl -s -X PATCH "$API_URL/orders/$ORDER_ID/state" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{
    "state": "SHIPPED",
    "trackingNumber": "TRACK123456789",
    "carrier": "Blue Dart"
  }')
echo "New State: $(echo "$SHIPPED" | jq -r '.state')"
echo "Tracking: $(echo "$SHIPPED" | jq -r '.trackingNumber')"
echo "Carrier: $(echo "$SHIPPED" | jq -r '.carrier')"

echo -e "${YELLOW}State Machine Transitions Complete${NC}"
