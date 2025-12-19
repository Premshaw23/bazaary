#!/bin/bash
set -e

API_URL="http://localhost:3001/api"
TIMESTAMP=$(date +%s)

echo "🧪 Testing Week 3: Event Replay (ORDER_CREATED)"
echo "============================================="

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# -------------------------------
# 1️⃣ Register Buyer
# -------------------------------
echo -e "${BLUE}1. Registering buyer...${NC}"
BUYER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"buyer_event_${TIMESTAMP}@test.com\",
    \"password\": \"password123\",
    \"role\": \"BUYER\"
  }")

BUYER_TOKEN=$(echo "$BUYER_RESPONSE" | jq -r '.access_token')
BUYER_ID=$(echo "$BUYER_RESPONSE" | jq -r '.user.id')

echo -e "${GREEN}✓ Buyer registered${NC} ($BUYER_ID)"

# -------------------------------
# 2️⃣ Register Seller
# -------------------------------
echo -e "\n${BLUE}2. Registering seller...${NC}"

SELLER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"seller_week3_${TIMESTAMP}@test.com\",\"password\": \"password123\",\"role\": \"SELLER\"}")
echo "[DEBUG] Seller response: $SELLER_RESPONSE"
SELLER_TOKEN=$(echo "$SELLER_RESPONSE" | jq -r '.accessToken // .access_token')
echo "[DEBUG] Seller token: $SELLER_TOKEN"
if [[ -z "$SELLER_TOKEN" || "$SELLER_TOKEN" == "null" ]]; then
  echo "[ERROR] Seller token missing. Registration response was: $SELLER_RESPONSE"
  exit 1
fi
echo "✓ Seller registered"

# -------------------------------
# 3️⃣ Apply as Seller
# -------------------------------
echo -e "\n${BLUE}3. Applying as seller...${NC}"
SELLER_APPLY_RESPONSE=$(curl -s -X POST "$API_URL/sellers/apply" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"businessName\": \"Test Seller $TIMESTAMP\",
    \"businessType\": \"INDIVIDUAL\",
    \"address\": {
      \"street\": \"123 Test St\",
      \"city\": \"Delhi\",
      \"state\": \"Delhi\",
      \"pincode\": \"110001\",
      \"country\": \"India\"
    },
    \"contactPhone\": \"+91-9999999999\"
  }")
SELLER_ID=$(echo "$SELLER_APPLY_RESPONSE" | jq -r '.id')
if [[ -z "$SELLER_ID" || "$SELLER_ID" == "null" ]]; then
  echo -e "${RED}[ERROR] Seller apply failed. Response: $SELLER_APPLY_RESPONSE${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Seller created${NC} ($SELLER_ID)"

# -------------------------------
# 4️⃣ Create Product
# -------------------------------
echo -e "\n${BLUE}4. Creating product...${NC}"
PRODUCT_ID=$(curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"sku\": \"EVT-${TIMESTAMP}\",
    \"name\": \"Event Replay Product\",
    \"description\": \"Testing event replay\"
  }" | jq -r '.id')

echo -e "${GREEN}✓ Product created${NC} ($PRODUCT_ID)"

# -------------------------------
# 5️⃣ Create Listing
# -------------------------------
echo -e "\n${BLUE}5. Creating listing...${NC}"
LISTING_RESPONSE=$(curl -s -X POST "$API_URL/listings" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"productId\": \"$PRODUCT_ID\",
    \"price\": 500,
    \"stockQuantity\": 10
  }")
LISTING_ID=$(echo "$LISTING_RESPONSE" | jq -r '.id')
if [[ -z "$LISTING_ID" || "$LISTING_ID" == "null" ]]; then
  echo -e "${RED}[ERROR] Listing creation failed. Response: $LISTING_RESPONSE${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Listing created${NC} ($LISTING_ID)"

# -------------------------------
# 6️⃣ Check initial stock
# -------------------------------
echo -e "\n${BLUE}6. Checking initial inventory...${NC}"
INITIAL_STOCK=$(curl -s "$API_URL/inventory/$LISTING_ID/available" | jq -r '.availableStock')
echo "Initial stock: $INITIAL_STOCK"

# -------------------------------
# 7️⃣ Create Order
# -------------------------------
echo -e "\n${BLUE}7. Creating order...${NC}"
ORDER_RESPONSE=$(curl -s -X POST "$API_URL/orders" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"items\": [
      { \"listingId\": \"$LISTING_ID\", \"quantity\": 2 }
    ],
    \"shippingAddress\": {
      \"name\": \"Replay Tester\",
      \"phone\": \"+91-9999999999\",
      \"street\": \"Test Street\",
      \"city\": \"Delhi\",
      \"state\": \"Delhi\",
      \"pincode\": \"110001\",
      \"country\": \"India\"
    }
  }")

ORDER_ID=$(echo "$ORDER_RESPONSE" | jq -r '.id')

echo -e "${GREEN}✓ Order created${NC} ($ORDER_ID)"

# Wait for transaction commit
sleep 1

# Wait for event processor
sleep 4

# -------------------------------
# 8️⃣ Check stock after ORDER_CREATED
# -------------------------------
echo -e "\n${BLUE}8. Checking inventory after event...${NC}"
AFTER_ORDER_STOCK=$(curl -s "$API_URL/inventory/$LISTING_ID/available" | jq -r '.availableStock')
echo "Stock after order: $AFTER_ORDER_STOCK"

EXPECTED_STOCK=$((INITIAL_STOCK - 2))

if [[ "$AFTER_ORDER_STOCK" -ne "$EXPECTED_STOCK" ]]; then
  echo -e "${RED}✗ Inventory reservation failed${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Inventory reserved correctly${NC}"

# -------------------------------
# 9️⃣ Replay ORDER events
# -------------------------------
echo -e "\n${BLUE}9. Replaying ORDER_CREATED event...${NC}"
curl -s -X POST "$API_URL/admin/events/replay/ORDER/$ORDER_ID" > /dev/null

sleep 4

# -------------------------------
# 🔟 Check inventory AFTER replay
# -------------------------------
echo -e "\n${BLUE}10. Checking inventory after replay...${NC}"
AFTER_REPLAY_STOCK=$(curl -s "$API_URL/inventory/$LISTING_ID/available" | jq -r '.availableStock')
echo "Stock after replay: $AFTER_REPLAY_STOCK"

if [[ "$AFTER_REPLAY_STOCK" -ne "$EXPECTED_STOCK" ]]; then
  echo -e "${RED}✗ Replay caused double reservation (NOT idempotent)${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Replay is idempotent${NC}"

# -------------------------------
# ✅ FINAL RESULT
# -------------------------------
echo -e "\n${YELLOW}================================================${NC}"
echo -e "${GREEN}✅ Week 3 Event Replay Test PASSED${NC}"
echo -e "${YELLOW}================================================${NC}"
