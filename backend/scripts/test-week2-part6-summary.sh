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

echo -e "${BLUE}22. Buyer viewing all their orders...${NC}"
BUYER_ORDERS=$(curl -s -X GET "$API_URL/orders" \
  -H "Authorization: Bearer $BUYER_TOKEN")
echo "$BUYER_ORDERS" | jq '.[]| {
  orderNumber: .orderNumber,
  state: .state,
  totalAmount: .totalAmount,
  createdAt: .createdAt
}'

echo -e "\n${BLUE}23. Filtering orders by state (SHIPPED)...${NC}"
SHIPPED_ORDERS=$(curl -s -X GET "$API_URL/orders?state=SHIPPED" \
  -H "Authorization: Bearer $BUYER_TOKEN")
echo "$SHIPPED_ORDERS" | jq '.[]| {
  orderNumber: .orderNumber,
  state: .state,
  trackingNumber: .trackingNumber
}'

echo -e "\n${YELLOW}================================================${NC}"
echo -e "${GREEN}✅ Week 2 Day 1 Tests Complete!${NC}"
echo -e "${YELLOW}================================================${NC}"
echo ""
echo "Summary:"
echo "  - Buyer ID: $BUYER_ID"
echo "  - Seller ID: $SELLER_ID"
echo "  - Product ID: $PRODUCT_ID"
echo "  - Listing ID: $LISTING_ID"
echo "  - Order 1 (Full Flow): $ORDER_NUMBER ($ORDER_ID)"
echo "  - Order 2 (Cancelled): Order ID $CANCEL_ORDER_ID"
echo ""
echo "State Machine Transitions Tested:"
echo "  ✓ CREATED → PAYMENT_PENDING"
echo "  ✓ PAYMENT_PENDING → PAID"
echo "  ✓ PAID → CONFIRMED"
echo "  ✓ CONFIRMED → PACKED"
echo "  ✓ PACKED → SHIPPED"
echo "  ✓ CREATED → CANCELLED"
echo "  ✓ Invalid transition (CREATED → SHIPPED) blocked"
echo ""
echo "Inventory Management Tested:"
echo "  ✓ Stock reservation on order creation"
echo "  ✓ Stock release on order cancellation"
echo "  ✓ Transaction logging"
echo ""
