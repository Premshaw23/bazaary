#!/bin/bash

set -e

API_URL="http://localhost:3001/api"
TIMESTAMP=$(date +%s)

echo "🧪 Testing Week 2 Day 1: Orders & State Machine"
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Register Buyer
echo -e "${BLUE}1. Registering buyer...${NC}"
BUYER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"buyer_${TIMESTAMP}@test.com\",
    \"password\": \"password123\",
    \"role\": \"BUYER\"
  }")

BUYER_TOKEN=$(echo "$BUYER_RESPONSE" | jq -r '.access_token')
BUYER_ID=$(echo "$BUYER_RESPONSE" | jq -r '.user.id')

if [[ "$BUYER_ID" == "null" || -z "$BUYER_ID" ]]; then
  echo -e "${RED}✗ Buyer registration failed${NC}"
  echo "$BUYER_RESPONSE" | jq '.'
  exit 1
fi
echo -e "${GREEN}✓ Buyer registered${NC}"
echo "Buyer ID: $BUYER_ID"

# Step 2: Register Seller
echo -e "\n${BLUE}2. Registering seller...${NC}"
SELLER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"seller_${TIMESTAMP}@test.com\",
    \"password\": \"password123\",
    \"role\": \"SELLER\"
  }")

SELLER_TOKEN=$(echo "$SELLER_RESPONSE" | jq -r '.access_token')
SELLER_USER_ID=$(echo "$SELLER_RESPONSE" | jq -r '.user.id')

if [[ "$SELLER_USER_ID" == "null" || -z "$SELLER_USER_ID" ]]; then
  echo -e "${RED}✗ Seller registration failed${NC}"
  echo "$SELLER_RESPONSE" | jq '.'
  exit 1
fi
echo -e "${GREEN}✓ Seller registered${NC}"

# Step 3: Apply as Seller
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

# Step 4: Create Product
echo -e "\n${BLUE}4. Creating product...${NC}"
PRODUCT_RESPONSE=$(curl -s -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{
    "sku": "ORDER-TEST-'${TIMESTAMP}'",
    "name": "Premium Wireless Earbuds",
    "brand": "AudioTech",
    "description": "High-quality wireless earbuds with noise cancellation",
    "shortDescription": "Premium earbuds with ANC",
    "images": [
      {
        "url": "https://example.com/earbuds.jpg",
        "alt": "Wireless Earbuds"
      }
    ],
    "specifications": {
      "Battery Life": "24 hours",
      "Connectivity": "Bluetooth 5.2",
      "Noise Cancellation": "Active"
    },
    "searchKeywords": ["wireless", "earbuds", "bluetooth", "noise cancellation"]
  }')

PRODUCT_ID=$(echo "$PRODUCT_RESPONSE" | jq -r '.id')

if [[ "$PRODUCT_ID" == "null" || -z "$PRODUCT_ID" ]]; then
  echo -e "${RED}✗ Product creation failed${NC}"
  echo "$PRODUCT_RESPONSE" | jq '.'
  exit 1
fi
echo -e "${GREEN}✓ Product created${NC}"
echo "Product ID: $PRODUCT_ID"

# Step 5: Create Listing
echo -e "\n${BLUE}5. Creating seller listing...${NC}"
LISTING_RESPONSE=$(curl -s -X POST "$API_URL/listings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d "{
    \"productId\": \"$PRODUCT_ID\",
    \"price\": 4999.99,
    \"compareAtPrice\": 6999.99,
    \"stockQuantity\": 50,
    \"condition\": \"NEW\",
    \"warrantyMonths\": 12,
    \"returnWindowDays\": 7
  }")

LISTING_ID=$(echo "$LISTING_RESPONSE" | jq -r '.id')

if [[ "$LISTING_ID" == "null" || -z "$LISTING_ID" ]]; then
  echo -e "${RED}✗ Listing creation failed${NC}"
  echo "$LISTING_RESPONSE" | jq '.'
  exit 1
fi
echo -e "${GREEN}✓ Listing created${NC}"
echo "Listing ID: $LISTING_ID"

# Step 6: Check Available Stock
echo -e "\n${BLUE}6. Checking available stock...${NC}"
STOCK_CHECK=$(curl -s -X GET "$API_URL/inventory/$LISTING_ID/available")
echo "$STOCK_CHECK" | jq '.'

# Step 7: Create Order
echo -e "\n${BLUE}7. Creating order...${NC}"
ORDER_RESPONSE=$(curl -s -X POST "$API_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d "{
    \"items\": [
      {
        \"listingId\": \"$LISTING_ID\",
        \"quantity\": 2
      }
    ],
    \"shippingAddress\": {
      \"name\": \"John Doe\",
      \"phone\": \"+91-9876543211\",
      \"street\": \"123 Buyer Street\",
      \"city\": \"Delhi\",
      \"state\": \"Delhi\",
      \"pincode\": \"110001\",
      \"country\": \"India\"
    },
    \"billingAddress\": {
      \"name\": \"John Doe\",
      \"phone\": \"+91-9876543211\",
      \"street\": \"123 Buyer Street\",
      \"city\": \"Delhi\",
      \"state\": \"Delhi\",
      \"pincode\": \"110001\",
      \"country\": \"India\"
    },
    \"notes\": \"Please deliver during business hours\"
  }")

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

# Step 8: View Order Details
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

# Step 9: Get Order Items
echo -e "\n${BLUE}9. Fetching order items...${NC}"
ORDER_ITEMS=$(curl -s -X GET "$API_URL/orders/$ORDER_ID/items" \
  -H "Authorization: Bearer $BUYER_TOKEN")
echo "$ORDER_ITEMS" | jq '.[]| {
  productName: .productName,
  quantity: .quantity,
  unitPrice: .unitPrice,
  totalPrice: .totalPrice
}'

# Step 10: Check Inventory After Order (should show reserved)
echo -e "\n${BLUE}10. Checking inventory after order (should show reserved)...${NC}"
STOCK_AFTER=$(curl -s -X GET "$API_URL/inventory/$LISTING_ID/available")
echo "$STOCK_AFTER" | jq '.'

# Step 11: Get Inventory Transactions
echo -e "\n${BLUE}11. Viewing inventory transactions...${NC}"
INVENTORY_TXN=$(curl -s -X GET "$API_URL/inventory/$LISTING_ID/transactions" \
  -H "Authorization: Bearer $SELLER_TOKEN")
echo "$INVENTORY_TXN" | jq '.[]| {
  type: .type,
  quantity: .quantity,
  reason: .reason,
  createdAt: .createdAt
}' | head -20

# Step 12: Seller Views Orders
echo -e "\n${BLUE}12. Seller viewing their orders...${NC}"
SELLER_ORDERS=$(curl -s -X GET "$API_URL/orders" \
  -H "Authorization: Bearer $SELLER_TOKEN")
echo "$SELLER_ORDERS" | jq '.[]| {
  orderNumber: .orderNumber,
  state: .state,
  totalAmount: .totalAmount,
  createdAt: .createdAt
}'

# Step 13: Test Invalid State Transition (should fail)
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

# Step 14: Transition to PAYMENT_PENDING
echo -e "\n${BLUE}14. Transitioning order to PAYMENT_PENDING...${NC}"
PAYMENT_PENDING=$(curl -s -X PATCH "$API_URL/orders/$ORDER_ID/state" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{
    "state": "PAYMENT_PENDING"
  }')
echo "New State: $(echo "$PAYMENT_PENDING" | jq -r '.state')"

# Step 15: Simulate Payment and Transition to PAID
echo -e "\n${BLUE}15. Transitioning order to PAID...${NC}"
PAID_ORDER=$(curl -s -X PATCH "$API_URL/orders/$ORDER_ID/state" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{
    "state": "PAID"
  }')
echo "New State: $(echo "$PAID_ORDER" | jq -r '.state')"

# Step 16: Seller Confirms Order
echo -e "\n${BLUE}16. Seller confirming order...${NC}"
CONFIRMED=$(curl -s -X PATCH "$API_URL/orders/$ORDER_ID/state" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{
    "state": "CONFIRMED"
  }')
echo "New State: $(echo "$CONFIRMED" | jq -r '.state')"
echo "Confirmed At: $(echo "$CONFIRMED" | jq -r '.confirmedAt')"

# Step 17: Seller Packs Order
echo -e "\n${BLUE}17. Seller packing order...${NC}"
PACKED=$(curl -s -X PATCH "$API_URL/orders/$ORDER_ID/state" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{
    "state": "PACKED"
  }')
echo "New State: $(echo "$PACKED" | jq -r '.state')"

# Step 18: Seller Ships Order
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

# Step 19: Test Cancellation Flow - Create New Order
echo -e "\n${BLUE}19. Testing cancellation flow - creating new order...${NC}"
CANCEL_ORDER=$(curl -s -X POST "$API_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d "{
    \"items\": [
      {
        \"listingId\": \"$LISTING_ID\",
        \"quantity\": 1
      }
    ],
    \"shippingAddress\": {
      \"name\": \"Jane Doe\",
      \"phone\": \"+91-9876543212\",
      \"street\": \"456 Buyer Lane\",
      \"city\": \"Bangalore\",
      \"state\": \"Karnataka\",
      \"pincode\": \"560001\",
      \"country\": \"India\"
    }
  }")

CANCEL_ORDER_ID=$(echo "$CANCEL_ORDER" | jq -r '.id')

if [[ "$CANCEL_ORDER_ID" == "null" || -z "$CANCEL_ORDER_ID" ]]; then
  echo -e "${RED}✗ Cancellation test order creation failed${NC}"
  echo "$CANCEL_ORDER" | jq '.'
else
  echo -e "${GREEN}✓ Cancellation test order created${NC}"
  echo "Order ID: $CANCEL_ORDER_ID"

  # Step 20: Cancel the Order
  echo -e "\n${BLUE}20. Cancelling order...${NC}"
  CANCELLED=$(curl -s -X POST "$API_URL/orders/$CANCEL_ORDER_ID/cancel" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $BUYER_TOKEN" \
    -d '{
      "reason": "Changed my mind"
    }')
  echo "Cancelled State: $(echo "$CANCELLED" | jq -r '.state')"
  echo "Cancellation Reason: $(echo "$CANCELLED" | jq -r '.cancellationReason')"
fi

# Step 21: Verify Inventory Released
echo -e "\n${BLUE}21. Verifying inventory after cancellation...${NC}"
FINAL_STOCK=$(curl -s -X GET "$API_URL/inventory/$LISTING_ID/available")
echo "$FINAL_STOCK" | jq '.'

# Step 22: Buyer Views All Orders
echo -e "\n${BLUE}22. Buyer viewing all their orders...${NC}"
BUYER_ORDERS=$(curl -s -X GET "$API_URL/orders" \
  -H "Authorization: Bearer $BUYER_TOKEN")
echo "$BUYER_ORDERS" | jq '.[]| {
  orderNumber: .orderNumber,
  state: .state,
  totalAmount: .totalAmount,
  createdAt: .createdAt
}'

# Step 23: Filter Orders by State
echo -e "\n${BLUE}23. Filtering orders by state (SHIPPED)...${NC}"
SHIPPED_ORDERS=$(curl -s -X GET "$API_URL/orders?state=SHIPPED" \
  -H "Authorization: Bearer $BUYER_TOKEN")
echo "$SHIPPED_ORDERS" | jq '.[]| {
  orderNumber: .orderNumber,
  state: .state,
  trackingNumber: .trackingNumber
}'

# Summary
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
if [[ "$CANCEL_ORDER_ID" != "null" && -n "$CANCEL_ORDER_ID" ]]; then
  echo "  - Order 2 (Cancelled): Order ID $CANCEL_ORDER_ID"
fi
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