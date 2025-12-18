#!/bin/bash

set -e

API_URL="http://localhost:3001/api"

echo "🧪 Testing Payment Refunds"
echo "=========================="

# Setup (abbreviated)
REGISTER=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"refund$(date +%s)@test.com\",\"password\":\"test123\",\"role\":\"SELLER\"}")

SELLER_TOKEN=$(echo "$REGISTER" | jq -r '.access_token')

SELLER=$(curl -s -X POST "$API_URL/sellers/apply" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{"businessName":"Refund Test","businessType":"INDIVIDUAL","description":"Test","address":{"street":"123","city":"Mumbai","state":"MH","pincode":"400001","country":"India"},"contactPhone":"+919876543210"}')

PRODUCT=$(curl -s -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d "{\"sku\":\"REF-$(date +%s)\",\"name\":\"Refund Test\",\"brand\":\"Test\",\"description\":\"Test\",\"images\":[{\"url\":\"https://example.com/img.jpg\"}],\"searchKeywords\":[\"test\"]}")

PRODUCT_ID=$(echo "$PRODUCT" | jq -r '.id')

LISTING=$(curl -s -X POST "$API_URL/listings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d "{\"productId\":\"$PRODUCT_ID\",\"price\":1000.00,\"stockQuantity\":100,\"condition\":\"NEW\"}")

LISTING_ID=$(echo "$LISTING" | jq -r '.id')

BUYER_REG=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"refund_buyer$(date +%s)@test.com\",\"password\":\"test123\",\"role\":\"BUYER\"}")

BUYER_TOKEN=$(echo "$BUYER_REG" | jq -r '.access_token')

ORDER=$(curl -s -X POST "$API_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d "{\"items\":[{\"listingId\":\"$LISTING_ID\",\"quantity\":1}],\"shippingAddress\":{\"name\":\"Test\",\"phone\":\"+919876543210\",\"street\":\"123\",\"city\":\"Mumbai\",\"state\":\"MH\",\"pincode\":\"400001\",\"country\":\"India\"}}")

ORDER_ID=$(echo "$ORDER" | jq -r '.id')

echo "✅ Setup complete"

# Initiate and verify payment
echo ""
echo "Initiating payment..."
PAYMENT=$(curl -s -X POST "$API_URL/payments/initiate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Idempotency-Key: refund_test_$(date +%s)" \
  -d "{\"orderId\":\"$ORDER_ID\",\"method\":\"CARD\"}")

PAYMENT_ID=$(echo "$PAYMENT" | jq -r '.id')
TXN_ID=$(echo "$PAYMENT" | jq -r '.gatewayTransactionId')

sleep 1

curl -s -X POST "$API_URL/payments/verify" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d "{\"paymentId\":\"$PAYMENT_ID\",\"transactionId\":\"$TXN_ID\"}" > /dev/null

echo "✅ Payment completed"

# Test full refund
echo ""
echo "Testing full refund..."
REFUND=$(curl -s -X POST "$API_URL/payments/refund" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d "{\"paymentId\":\"$PAYMENT_ID\",\"reason\":\"Customer requested refund\"}")

echo "$REFUND" | jq '.'

REFUND_STATUS=$(echo "$REFUND" | jq -r '.status')
REFUND_AMOUNT=$(echo "$REFUND" | jq -r '.refundAmount')

if [ "$REFUND_STATUS" == "REFUNDED" ]; then
  echo "✅ Full refund processed successfully"
  echo "   Refund amount: $REFUND_AMOUNT"
else
  echo "❌ Refund failed"
fi

echo ""
echo "🎉 Refund test complete!"