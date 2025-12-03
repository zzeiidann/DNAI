#!/bin/bash
# DNAI Local Development Start Script (tanpa Docker)
# Usage: ./start-local.sh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   DNAI - Local Development Mode       ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 not found! Please install Python 3.9+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python3 found: $(python3 --version)${NC}"

# Go to backend directory
cd backend

# Setup .env if not exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cp .env.example .env
    
    # Generate JWT secret
    JWT_SECRET=$(openssl rand -hex 32)
    
    # Update JWT_SECRET in .env
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/your_super_secret_jwt_key_change_in_production/$JWT_SECRET/" .env
    else
        sed -i "s/your_super_secret_jwt_key_change_in_production/$JWT_SECRET/" .env
    fi
    
    echo -e "${GREEN}✓ .env created with auto-generated JWT secret${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  PENTING: Edit backend/.env dan tambahkan GEMINI_API_KEY${NC}"
    echo -e "${YELLOW}   Dapat dari: https://makersuite.google.com/app/apikey${NC}"
    echo ""
fi

# Create virtual environment if not exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
fi

# Activate virtual environment
echo -e "${YELLOW}Activating virtual environment...${NC}"
source venv/bin/activate

# Install dependencies
echo -e "${YELLOW}Installing Python dependencies (this may take a while)...${NC}"
pip install --upgrade pip
pip install -r requirements.txt

# Create data directories if not exists
mkdir -p data/food_images

# Build FAISS index if images exist
if [ "$(ls -A data/food_images 2>/dev/null)" ]; then
    echo -e "${YELLOW}Building FAISS index...${NC}"
    python scripts/build_index.py
else
    echo -e "${YELLOW}⚠️  No food images found in data/food_images/${NC}"
    echo -e "${YELLOW}   Add .jpg images there and run: python scripts/build_index.py${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   🚀 Starting DNAI Backend Server     ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Backend API:  ${GREEN}http://localhost:8000${NC}"
echo -e "API Docs:     ${GREEN}http://localhost:8000/docs${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

# Run the server
python app.py
