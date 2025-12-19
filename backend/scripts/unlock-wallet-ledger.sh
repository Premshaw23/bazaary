#!/bin/bash
# Usage: ./unlock-wallet-ledger.sh <SELLER_ID>
# Example: ./unlock-wallet-ledger.sh 123e4567-e89b-12d3-a456-426614174000

SELLER_ID="$1"
if [ -z "$SELLER_ID" ]; then
  echo "Usage: $0 <SELLER_ID>"
  exit 1
fi

# Update wallet_ledger status from LOCKED to AVAILABLE for the given seller
psql "$DATABASE_URL" -c "UPDATE wallet_ledger SET status = 'AVAILABLE' WHERE seller_id = '$SELLER_ID' AND status = 'LOCKED';"

echo "Unlocked wallet ledger entries for seller: $SELLER_ID"
