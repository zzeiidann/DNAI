#!/bin/bash
# DNAI Quick Start Script
# Usage: ./start.sh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   DNAI - Food Recognition System      ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running!${NC}"
    echo "Please start Docker Desktop first."
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"

# Check if .env exists, if not create from example
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
    echo -e "${YELLOW}⚠️  IMPORTANT: Edit .env and add your GEMINI_API_KEY${NC}"
    echo -e "${YELLOW}   Get it from: https://makersuite.google.com/app/apikey${NC}"
    echo ""
    read -p "Press Enter after you've added GEMINI_API_KEY (or type 'skip' to continue without it): " response
    
    if [ "$response" != "skip" ]; then
        # Check if GEMINI_API_KEY is still default
        if grep -q "your_gemini_api_key_here" .env; then
            echo -e "${RED}❌ GEMINI_API_KEY not set! Chatbot features won't work.${NC}"
            echo "Continuing anyway..."
        fi
    fi
fi
echo -e "${GREEN}✓ .env file ready${NC}"

# Build images if not exists
echo ""
echo -e "${YELLOW}Building Docker images (this may take a few minutes on first run)...${NC}"
docker-compose build

# Start services
echo ""
echo -e "${YELLOW}Starting services...${NC}"
docker-compose up -d

# Wait for services to be ready
echo ""
echo -e "${YELLOW}Waiting for services to start...${NC}"
sleep 5

# Check health
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is healthy${NC}"
else
    echo -e "${YELLOW}⏳ Backend still starting (CLIP model loading...)${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   🚀 DNAI is running!                 ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Frontend:  ${GREEN}http://localhost${NC}"
echo -e "Backend:   ${GREEN}http://localhost:8000${NC}"
echo -e "API Docs:  ${GREEN}http://localhost:8000/docs${NC}"
echo ""
echo -e "Commands:"
echo -e "  ${YELLOW}./deploy.sh logs${NC}    - View logs"
echo -e "  ${YELLOW}./deploy.sh down${NC}    - Stop services"
echo -e "  ${YELLOW}./deploy.sh status${NC}  - Check status"
echo ""
