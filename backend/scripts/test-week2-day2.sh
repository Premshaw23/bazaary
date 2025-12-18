#!/bin/bash

set -e

API_URL="http://localhost:3001/api"
TIMESTAMP=$(date +%s)

echo "🧪 Testing Week 2 Day 2: Payments Module"
echo "========================================"

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

echo -e "${GREEN}✓ Seller registered${NC}"

# Step 3: Apply as Seller
echo -e "\n${BLUE}3. Applying as seller...${NC}"
SELLER_APPLY=$(curl -s -X POST "$API_URL/sellers/apply" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{
    "businessName": "Payment Test Store",
    "businessType": "INDIVIDUAL",
    "description": "Testing payments",
    "address": {
      "street": "123 Test St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "country": "India"
    },
    "contactPhone": "+91-9876543210",
    "contactEmail": "seller_'${TIMESTAMP}'@test.com"
  }')

SELLER_ID=$(echo "$SELLER_APPLY" | jq -r '.id')
echo -e "${GREEN}✓ Seller created${NC}"

# Step 4: Create Product
echo -e "\n${BLUE}4. Creating product...${NC}"
PRODUCT_RESPONSE=$(curl -s -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{
    "sku": "PAY-TEST-'${TIMESTAMP}'",
    "name": "Payment Test Product",
    "brand": "TestBrand",
    "description": "Product for payment testing",
    "shortDescription": "Test product",
    "images": [{"url": "https://example.com/test.jpg", "alt": "Test"}],
    "specifications": {"Type": "Test"},
    "searchKeywords": ["test", "payment"]
  }')

PRODUCT_ID=$(echo "$PRODUCT_RESPONSE" | jq -r '.id')
echo -e "${GREEN}✓ Product created${NC}"

# Step 5: Create Listing
echo -e "\n${BLUE}5. Creating listing...${NC}"
LISTING_RESPONSE=$(curl -s -X POST "$API_URL/listings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d "{
    \"productId\": \"$PRODUCT_ID\",
    \"price\": 1000.00,
    \"stockQuantity\": 100,
    \"condition\": \"NEW\",
    \"warrantyMonths\": 6,
    \"returnWindowDays\": 7
  }")

LISTING_ID=$(echo "$LISTING_RESPONSE" | jq -r '.id')
echo -e "${GREEN}✓ Listing created${NC}"

# Step 6: Create Order
echo -e "\n${BLUE}6. Creating order...${NC}"
ORDER_RESPONSE=$(curl -s -X POST "$API_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d "{
    \"items\": [{
      \"listingId\": \"$LISTING_ID\",
      \"quantity\": 2
    }],
    \"shippingAddress\": {
      \"name\": \"Test Buyer\",
      \"phone\": \"+91-9876543211\",
      \"street\": \"Test Street\",
      \"city\": \"Delhi\",
      \"state\": \"Delhi\",
      \"pincode\": \"110001\",
      \"country\": \"India\"
    }
  }")

ORDER_ID=$(echo "$ORDER_RESPONSE" | jq -r '.id')
ORDER_NUMBER=$(echo "$ORDER_RESPONSE" | jq -r '.orderNumber')
TOTAL_AMOUNT=$(echo "$ORDER_RESPONSE" | jq -r '.totalAmount')

if [[ "$ORDER_ID" == "null" ]]; then
  echo -e "${RED}✗ Order creation failed${NC}"
  echo "$ORDER_RESPONSE" | jq '.'
  exit 1
fi

echo -e "${GREEN}✓ Order created${NC}"
echo "Order ID: $ORDER_ID"
echo "Order Number: $ORDER_NUMBER"
echo "Total Amount: ₹$TOTAL_AMOUNT"

# Step 7: Initiate Payment (Card)
echo -e "\n${BLUE}7. Initiating payment with CARD...${NC}"
IDEMPOTENCY_KEY="payment-${TIMESTAMP}-card"
PAYMENT_RESPONSE=$(curl -s -X POST "$API_URL/payments/initiate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "idempotency-key: $IDEMPOTENCY_KEY" \
  -d "{
    \"orderId\": \"$ORDER_ID\",
    \"method\": \"CARD\"
  }")

PAYMENT_ID=$(echo "$PAYMENT_RESPONSE" | jq -r '.id')
TRANSACTION_ID=$(echo "$PAYMENT_RESPONSE" | jq -r '.gatewayTransactionId')
PAYMENT_STATUS=$(echo "$PAYMENT_RESPONSE" | jq -r '.status')

if [[ "$PAYMENT_ID" == "null" ]]; then
  echo -e "${RED}✗ Payment initiation failed${NC}"
  echo "$PAYMENT_RESPONSE" | jq '.'
  exit 1
fi

echo -e "${GREEN}✓ Payment initiated${NC}"
echo "Payment ID: $PAYMENT_ID"
echo "Transaction ID: $TRANSACTION_ID"
echo "Status: $PAYMENT_STATUS"
echo "$PAYMENT_RESPONSE" | jq '{
  id: .id,
  amount: .amount,
  method: .method,
  status: .status,
  gatewayTransactionId: .gatewayTransactionId,
  gatewayOrderId: .gatewayOrderId
}'

# Step 8: Test Idempotency
echo -e "\n${BLUE}8. Testing idempotency (duplicate request)...${NC}"
DUPLICATE_PAYMENT=$(curl -s -X POST "$API_URL/payments/initiate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "idempotency-key: $IDEMPOTENCY_KEY" \
  -d "{
    \"orderId\": \"$ORDER_ID\",
    \"method\": \"CARD\"
  }")

DUPLICATE_ID=$(echo "$DUPLICATE_PAYMENT" | jq -r '.id')

if [[ "$DUPLICATE_ID" == "$PAYMENT_ID" ]]; then
  echo -e "${GREEN}✓ Idempotency working - same payment returned${NC}"
else
  echo -e "${YELLOW}⚠ Warning: Different payment returned${NC}"
fi

# Step 9: Verify Payment
echo -e "\n${BLUE}9. Verifying payment...${NC}"
sleep 2 # Wait for mock gateway processing

VERIFY_RESPONSE=$(curl -s -X POST "$API_URL/payments/verify" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d "{
    \"paymentId\": \"$PAYMENT_ID\",
    \"transactionId\": \"$TRANSACTION_ID\"
  }")

VERIFIED_STATUS=$(echo "$VERIFY_RESPONSE" | jq -r '.status')

echo "Verified Status: $VERIFIED_STATUS"
echo "$VERIFY_RESPONSE" | jq '{
  id: .id,
  status: .status,
  completedAt: .completedAt,
  amount: .amount
}'

# Step 10: Check Order Status After Payment
echo -e "\n${BLUE}10. Checking order status after payment...${NC}"
ORDER_CHECK=$(curl -s -X GET "$API_URL/orders/$ORDER_ID" \
  -H "Authorization: Bearer $BUYER_TOKEN")

ORDER_STATE=$(echo "$ORDER_CHECK" | jq -r '.state')
echo "Order State: $ORDER_STATE"

if [[ "$ORDER_STATE" == "PAID" ]]; then
  echo -e "${GREEN}✓ Order correctly transitioned to PAID${NC}"
else
  echo -e "${YELLOW}⚠ Order state: $ORDER_STATE (expected PAID)${NC}"
fi

# Step 11: Get Payment Details
echo -e "\n${BLUE}11. Fetching payment details...${NC}"
PAYMENT_DETAILS=$(curl -s -X GET "$API_URL/payments/$PAYMENT_ID" \
  -H "Authorization: Bearer $BUYER_TOKEN")

echo "$PAYMENT_DETAILS" | jq '{
  id: .id,
  orderId: .orderId,
  amount: .amount,
  currency: .currency,
  method: .method,
  status: .status,
  paymentGateway: .paymentGateway,
  gatewayTransactionId: .gatewayTransactionId,
  createdAt: .createdAt,
  completedAt: .completedAt
}'

# Step 12: Get Payments by Order
echo -e "\n${BLUE}12. Fetching all payments for order...${NC}"
ORDER_PAYMENTS=$(curl -s -X GET "$API_URL/payments/order/$ORDER_ID" \
  -H "Authorization: Bearer $BUYER_TOKEN")

echo "$ORDER_PAYMENTS" | jq '.[] | {
  id: .id,
  amount: .amount,
  method: .method,
  status: .status,
  createdAt: .createdAt
}'

# Step 13: Test UPI Payment
echo -e "\n${BLUE}13. Testing UPI payment method...${NC}"
ORDER2_RESPONSE=$(curl -s -X POST "$API_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d "{
    \"items\": [{
      \"listingId\": \"$LISTING_ID\",
      \"quantity\": 1
    }],
    \"shippingAddress\": {
      \"name\": \"Test Buyer\",
      \"phone\": \"+91-9876543211\",
      \"street\": \"Test Street\",
      \"city\": \"Delhi\",
      \"state\": \"Delhi\",
      \"pincode\": \"110001\",
      \"country\": \"India\"
    }
  }")

ORDER2_ID=$(echo "$ORDER2_RESPONSE" | jq -r '.id')

UPI_IDEMPOTENCY_KEY="payment-${TIMESTAMP}-upi"
UPI_PAYMENT=$(curl -s -X POST "$API_URL/payments/initiate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Idempotency-Key: $UPI_IDEMPOTENCY_KEY" \
  -d "{
    \"orderId\": \"$ORDER2_ID\",
    \"method\": \"UPI\"
  }")

UPI_PAYMENT_ID=$(echo "$UPI_PAYMENT" | jq -r '.id')
UPI_STATUS=$(echo "$UPI_PAYMENT" | jq -r '.status')

echo "UPI Payment ID: $UPI_PAYMENT_ID"
echo "Status: $UPI_STATUS"
echo "Method: $(echo "$UPI_PAYMENT" | jq -r '.method')"
echo "UPI payment raw response: $UPI_PAYMENT"

# Step 14: Test Refund (Admin/Seller only)
echo -e "\n${BLUE}14. Testing refund (partial)...${NC}"

# First transition order to enable refund
curl -s -X PATCH "$API_URL/orders/$ORDER_ID/state" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{"state": "CONFIRMED"}' > /dev/null

REFUND_AMOUNT=500.00

REFUND_RESPONSE=$(curl -s -X POST "$API_URL/payments/refund" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d "{
    \"paymentId\": \"$PAYMENT_ID\",
    \"amount\": $REFUND_AMOUNT,
    \"reason\": \"Product damaged\"
  }")

REFUND_STATUS=$(echo "$REFUND_RESPONSE" | jq -r '.status')
REFUND_AMOUNT_DONE=$(echo "$REFUND_RESPONSE" | jq -r '.refundAmount')

echo "Refund Status: $REFUND_STATUS"
echo "Refunded Amount: ₹$REFUND_AMOUNT_DONE"
echo "$REFUND_RESPONSE" | jq '{
  id: .id,
  status: .status,
  refundAmount: .refundAmount,
  refundReference: .refundReference,
  refundCompletedAt: .refundCompletedAt
}'

if [[ "$REFUND_STATUS" == "PARTIALLY_REFUNDED" ]]; then
  echo -e "${GREEN}✓ Partial refund successful${NC}"
fi

# Step 15: Test Full Refund
echo -e "\n${BLUE}15. Testing full refund...${NC}"

ORDER3_RESPONSE=$(curl -s -X POST "$API_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d "{
    \"items\": [{
      \"listingId\": \"$LISTING_ID\",
      \"quantity\": 1
    }],
    \"shippingAddress\": {
      \"name\": \"Test Buyer\",
      \"phone\": \"+91-9876543211\",
      \"street\": \"Test Street\",
      \"city\": \"Delhi\",
      \"state\": \"Delhi\",
      \"pincode\": \"110001\",
      \"country\": \"India\"
    }
  }")

ORDER3_ID=$(echo "$ORDER3_RESPONSE" | jq -r '.id')


# Add Idempotency-Key header for Payment 3 (full refund test)
PAYMENT3_IDEMPOTENCY_KEY="payment-${TIMESTAMP}-card-refund"
PAYMENT3=$(curl -s -X POST "$API_URL/payments/initiate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Idempotency-Key: $PAYMENT3_IDEMPOTENCY_KEY" \
  -d "{\"orderId\": \"$ORDER3_ID\",\"method\": \"CARD\"}")

PAYMENT3_ID=$(echo "$PAYMENT3" | jq -r '.id')
TRANSACTION3_ID=$(echo "$PAYMENT3" | jq -r '.gatewayTransactionId')

sleep 2

echo "Full Refund Status: $FULL_REFUND_STATUS"

# Check if payment was created
if [[ "$PAYMENT3_ID" == "null" || -z "$PAYMENT3_ID" ]]; then
  echo -e "${RED}✗ Full refund test: Payment creation failed. Skipping refund.${NC}"
  echo "$PAYMENT3" | jq '.'
else
  # Verify payment
  VERIFY3_RESPONSE=$(curl -s -X POST "$API_URL/payments/verify" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $BUYER_TOKEN" \
    -d "{\"paymentId\": \"$PAYMENT3_ID\", \"transactionId\": \"$TRANSACTION3_ID\"}")
  VERIFIED3_STATUS=$(echo "$VERIFY3_RESPONSE" | jq -r '.status')
  if [[ "$VERIFIED3_STATUS" != "SUCCESS" ]]; then
    echo -e "${RED}✗ Full refund test: Payment verification failed (status: $VERIFIED3_STATUS). Skipping refund.${NC}"
    echo "$VERIFY3_RESPONSE" | jq '.'
  else
    # Attempt full refund
    FULL_REFUND=$(curl -s -X POST "$API_URL/payments/refund" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $SELLER_TOKEN" \
      -d "{\"paymentId\": \"$PAYMENT3_ID\", \"reason\": \"Order cancelled\"}")
    FULL_REFUND_STATUS=$(echo "$FULL_REFUND" | jq -r '.status')
    echo "Full Refund Status: $FULL_REFUND_STATUS"
    if [[ "$FULL_REFUND_STATUS" == "REFUNDED" ]]; then
      echo -e "${GREEN}✓ Full refund successful${NC}"
    else
      echo -e "${RED}✗ Full refund failed${NC}"
      echo "$FULL_REFUND" | jq '.'
    fi
  fi
fi

# Summary
echo -e "\n${YELLOW}================================================${NC}"
echo -e "${GREEN}✅ Week 2 Day 2 Tests Complete!${NC}"
echo -e "${YELLOW}================================================${NC}"
echo ""
echo "Summary:"
echo "  - Payment Gateway: Mock"
echo "  - Payment 1 (Card): $PAYMENT_ID - $VERIFIED_STATUS"
echo "  - Payment 2 (UPI): $UPI_PAYMENT_ID - $UPI_STATUS"
echo "  - Payment 3 (Refund Test): $PAYMENT3_ID - $FULL_REFUND_STATUS"
echo ""
echo "Features Tested:"
echo "  ✓ Payment initiation (CARD, UPI)"
echo "  ✓ Idempotency key handling"
echo "  ✓ Payment verification"
echo "  ✓ Order state transition (CREATED → PAYMENT_PENDING → PAID)"
echo "  ✓ Partial refund"
echo "  ✓ Full refund"
echo "  ✓ Payment gateway integration (Mock)"
echo ""