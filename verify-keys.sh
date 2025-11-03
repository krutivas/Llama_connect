#!/bin/bash

# Verify Stripe Keys Configuration
echo "?? Checking Stripe Configuration..."
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "? .env.local exists"
else
    echo "? .env.local not found!"
    echo "   Create it by copying: cp .env.local.example .env.local"
    exit 1
fi

# Check if .env exists
if [ -f ".env" ]; then
    echo "? .env exists"
else
    echo "? .env not found!"
    exit 1
fi

echo ""
echo "?? Checking values in .env.local:"
echo ""

# Function to check a key
check_key() {
    local key=$1
    local file=$2
    local value=$(grep "^$key=" "$file" | cut -d'=' -f2 | tr -d '"' | tr -d "'")
    
    if [ -z "$value" ]; then
        echo "? $key: NOT SET"
        return 1
    elif [[ "$value" == *"YOUR"* ]] || [[ "$value" == *"placeholder"* ]]; then
        echo "??  $key: PLACEHOLDER (needs updating)"
        return 1
    else
        # Show first 20 chars
        local preview="${value:0:20}"
        echo "? $key: $preview..."
        return 0
    fi
}

# Check secret key
check_key "STRIPE_SECRET_KEY" ".env.local"
SECRET_OK=$?

# Check publishable key
check_key "STRIPE_PUBLISHABLE_KEY" ".env.local"
PUB_OK=$?

# Check monthly price
check_key "STRIPE_PRICE_MONTHLY" ".env.local"
MONTHLY_OK=$?

# Check annual price
check_key "STRIPE_PRICE_ANNUAL" ".env.local"
ANNUAL_OK=$?

echo ""

# Overall status
if [ $SECRET_OK -eq 0 ] && [ $PUB_OK -eq 0 ] && [ $MONTHLY_OK -eq 0 ] && [ $ANNUAL_OK -eq 0 ]; then
    echo "?? All Stripe keys configured!"
    echo ""
    echo "Next steps:"
    echo "1. Run: npm run dev"
    echo "2. Run: stripe listen --forward-to localhost:3000/api/stripe/webhook"
    echo "3. Test at: http://localhost:3000"
    exit 0
else
    echo "??  Some keys need updating!"
    echo ""
    echo "To fix:"
    echo "1. Go to: https://dashboard.stripe.com/test/apikeys"
    echo "2. Copy your test keys"
    echo "3. Edit .env.local and .env with actual values"
    echo "4. Run this script again to verify"
    echo ""
    echo "See UPDATE_STRIPE_KEYS.md for detailed instructions"
    exit 1
fi
