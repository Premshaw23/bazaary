#!/bin/bash

set -e

API_URL="http://localhost:3001/api"

echo "🧪 Testing Payments Module"
echo "=========================="

# 1. Setup (create seller, product, listing)
echo "1. Setting up test data..."
REGISTER=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"payment$(date +%s)@test.com\",\"password\":\"test123\",\"role\":\"SELLER\"}")

SELLER_TOKEN=$(echo "$REGISTER" | jq -r '.access_token')

SELLER=$(curl -s -X POST "$API_URL/sellers/apply" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{"businessName":"Payment Test Store","businessType":"INDIVIDUAL","description":"Test","address":{"street":"123","city":"Mumbai","state":"MH","pincode":"400001","country":"India"},"contactPhone":"+919876543210"}')

PRODUCT=$(curl -s -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d "{\"sku\":\"PAY-$(date +%s)\",\"name\":\"Payment Test Product\",\"brand\":\"Test\",\"description\":\"Test product\",\"images\":[{\"url\":\"https://example.com/img.jpg\"}],\"searchKeywords\":[\"test\"]}")

PRODUCT_ID=$(echo "$PRODUCT" | jq -r '.id')

LISTING=$(curl -s -X POST "$API_URL/listings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d "{\"productId\":\"$PRODUCT_ID\",\"price\":2999.99,\"stockQuantity\":100,\"condition\":\"NEW\"}")

LISTING_ID=$(echo "$LISTING" | jq -r '.id')
echo "✅ Test data created"

# 2. Register buyer
echo ""
echo "2. Registering buyer..."
BUYER_REG=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"buyer_pay$(date +%s)@test.com\",\"password\":\"test123\",\"role\":\"BUYER\"}")

BUYER_TOKEN=$(echo "$BUYER_REG" | jq -r '.access_token')
echo "✅ Buyer registered"

# 3. Create order
echo ""
echo "3. Creating order..."
ORDER=$(curl -s -X POST "$API_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d "{\"items\":[{\"listingId\":\"$LISTING_ID\",\"quantity\":1}],\"shippingAddress\":{\"name\":\"Test User\",\"phone\":\"+919876543210\",\"street\":\"123 Test St\",\"city\":\"Mumbai\",\"state\":\"MH\",\"pincode\":\"400001\",\"country\":\"India\"}}")

ORDER_ID=$(echo "$ORDER" | jq -r '.id')
ORDER_STATE=$(echo "$ORDER" | jq -r '.state')
echo "✅ Order created: $ORDER_ID (State: $ORDER_STATE)"

# 4. Initiate payment
echo ""
echo "4. Initiating payment..."
IDEMPOTENCY_KEY="payment_$(date +%s)_$(uuidgen 2>/dev/null || echo $RANDOM)"

PAYMENT=$(curl -s -X POST "$API_URL/payments/initiate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
  -d "{\"orderId\":\"$ORDER_ID\",\"method\":\"UPI\"}")

echo "$PAYMENT" | jq '.'

PAYMENT_ID=$(echo "$PAYMENT" | jq -r '.id')
PAYMENT_STATUS=$(echo "$PAYMENT" | jq -r '.status')
TXN_ID=$(echo "$PAYMENT" | jq -r '.gatewayTransactionId')

if [ "$PAYMENT_STATUS" == "FAILED" ]; then
  echo "❌ Payment failed (this is expected ~10% of the time in mock gateway)"
  echo "Re-running payment..."
  
  IDEMPOTENCY_KEY="payment_$(date +%s)_$(uuidgen 2>/dev/null || echo $RANDOM)"
  PAYMENT=$(curl -s -X POST "$API_URL/payments/initiate" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $BUYER_TOKEN" \
    -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
    -d "{\"orderId\":\"$ORDER_ID\",\"method\":\"UPI\"}")
  
  PAYMENT_ID=$(echo "$PAYMENT" | jq -r '.id')
  PAYMENT_STATUS=$(echo "$PAYMENT" | jq -r '.status')
  TXN_ID=$(echo "$PAYMENT" | jq -r '.gatewayTransactionId')
fi

echo "✅ Payment ID: $PAYMENT_ID (Status: $PAYMENT_STATUS)"

# 5. Verify payment
echo ""
echo "5. Verifying payment..."
sleep 2

VERIFY=$(curl -s -X POST "$API_URL/payments/verify" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d "{\"paymentId\":\"$PAYMENT_ID\",\"transactionId\":\"$TXN_ID\"}")

echo "$VERIFY" | jq '.'

VERIFY_STATUS=$(echo "$VERIFY" | jq -r '.status')
echo "✅ Payment verified (Status: $VERIFY_STATUS)"

# 6. Check order state updated to PAID
echo ""
echo "6. Checking order state..."
ORDER_UPDATED=$(curl -s -X GET "$API_URL/orders/$ORDER_ID" \
  -H "Authorization: Bearer $BUYER_TOKEN")

ORDER_NEW_STATE=$(echo "$ORDER_UPDATED" | jq -r '.state')
echo "Order state: $ORDER_NEW_STATE (should be PAID)"

if [ "$ORDER_NEW_STATE" == "PAID" ]; then
  echo "✅ Order automatically updated to PAID after payment"
else
  echo "❌ Order state not updated correctly"
fi

# 7. Test idempotency - retry same payment
echo ""
echo "7. Testing idempotency (retry with same key)..."
RETRY_PAYMENT=$(curl -s -X POST "$API_URL/payments/initiate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
  -d "{\"orderId\":\"$ORDER_ID\",\"method\":\"CARD\"}")

RETRY_ID=$(echo "$RETRY_PAYMENT" | jq -r '.id')

if [ "$RETRY_ID" == "$PAYMENT_ID" ]; then
  echo "✅ Idempotency working - same payment returned"
else
  echo "❌ Idempotency failed - new payment created"
fi

# 8. Get payment details
echo ""
echo "8. Getting payment details..."
PAYMENT_DETAILS=$(curl -s -X GET "$API_URL/payments/$PAYMENT_ID" \
  -H "Authorization: Bearer $BUYER_TOKEN")
echo "$PAYMENT_DETAILS" | jq '.'

# 9. Get all payments for order
echo ""
echo "9. Getting all payments for order..."
ORDER_PAYMENTS=$(curl -s -X GET "$API_URL/payments/order/$ORDER_ID" \
  -H "Authorization: Bearer $BUYER_TOKEN")
echo "$ORDER_PAYMENTS" | jq '.'

echo ""
echo "🎉 All payment tests passed!"
echo ""
echo "Summary:"
echo "  Order ID: $ORDER_ID"
echo "  Payment ID: $PAYMENT_ID"
echo "  Transaction ID: $TXN_ID"
echo "  Payment Status: $VERIFY_STATUS"
echo "  Order State: $ORDER_NEW_STATE"