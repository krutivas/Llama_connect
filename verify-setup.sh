#!/bin/bash

# Llama Connect - Setup Verification Script
# This script checks if all prerequisites are in place

echo "?? Llama Connect - Setup Verification"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}?${NC} Found $NODE_VERSION"
else
    echo -e "${RED}?${NC} Node.js not found!"
    exit 1
fi

# Check npm
echo -n "Checking npm... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}?${NC} Found v$NPM_VERSION"
else
    echo -e "${RED}?${NC} npm not found!"
    exit 1
fi

# Check Stripe CLI
echo -n "Checking Stripe CLI... "
if command -v stripe &> /dev/null; then
    STRIPE_VERSION=$(stripe --version)
    echo -e "${GREEN}?${NC} Found $STRIPE_VERSION"
else
    echo -e "${YELLOW}!${NC} Stripe CLI not found (required for webhooks)"
    echo "  Install: https://stripe.com/docs/stripe-cli"
fi

echo ""

# Check if node_modules exists
echo -n "Checking dependencies... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}?${NC} node_modules found"
else
    echo -e "${YELLOW}!${NC} Dependencies not installed"
    echo "  Run: npm install"
fi

# Check if database exists
echo -n "Checking database... "
if [ -f "prisma/dev.db" ]; then
    echo -e "${GREEN}?${NC} Database exists"
else
    echo -e "${YELLOW}!${NC} Database not initialized"
    echo "  Run: npx prisma migrate dev --name init"
fi

# Check environment variables
echo -n "Checking .env.local... "
if [ -f ".env.local" ]; then
    echo -e "${GREEN}?${NC} Found"
    
    # Check for placeholder values
    if grep -q "YOUR_SECRET_KEY_HERE" .env.local 2>/dev/null; then
        echo -e "${YELLOW}  Warning:${NC} .env.local contains placeholder values"
        echo "  Update with your actual Stripe keys"
    fi
else
    echo -e "${YELLOW}!${NC} Not found"
    echo "  Copy: cp .env.local.example .env.local"
fi

echo -n "Checking .env... "
if [ -f ".env" ]; then
    echo -e "${GREEN}?${NC} Found"
    
    # Check for placeholder values
    if grep -q "placeholder" .env 2>/dev/null; then
        echo -e "${YELLOW}  Warning:${NC} .env contains placeholder values"
        echo "  Update with your actual Stripe keys"
    fi
else
    echo -e "${YELLOW}!${NC} Not found"
    echo "  This file is needed for Prisma CLI"
fi

echo ""

# Check project structure
echo "Checking project structure..."
REQUIRED_FILES=(
    "package.json"
    "tsconfig.json"
    "next.config.js"
    "tailwind.config.ts"
    "prisma/schema.prisma"
    "middleware.ts"
    "lib/auth.ts"
    "lib/prisma.ts"
    "lib/stripe.ts"
    "app/page.tsx"
    "app/signin/page.tsx"
    "app/pricing/page.tsx"
    "app/app/activities/page.tsx"
    "app/api/auth/start/route.ts"
    "app/api/checkout/session/route.ts"
    "app/api/stripe/webhook/route.ts"
)

MISSING_COUNT=0
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}?${NC} $file"
    else
        echo -e "  ${RED}?${NC} $file (MISSING)"
        ((MISSING_COUNT++))
    fi
done

echo ""

# Final summary
if [ $MISSING_COUNT -eq 0 ]; then
    echo -e "${GREEN}???????????????????????????????????${NC}"
    echo -e "${GREEN}? All checks passed!${NC}"
    echo -e "${GREEN}???????????????????????????????????${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Update .env.local with your Stripe keys"
    echo "2. Run: stripe listen --forward-to localhost:3000/api/stripe/webhook"
    echo "3. Run: npm run dev"
    echo "4. Open: http://localhost:3000"
    echo ""
    echo "See SETUP_GUIDE.md for detailed instructions."
else
    echo -e "${RED}???????????????????????????????????${NC}"
    echo -e "${RED}? $MISSING_COUNT file(s) missing!${NC}"
    echo -e "${RED}???????????????????????????????????${NC}"
    echo ""
    echo "Please ensure all files are present before running the app."
    exit 1
fi
