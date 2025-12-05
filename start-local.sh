#!/bin/bash
# DNAI Local Development Start Script (tanpa Docker)
# Menjalankan Backend (Python) dan Frontend (React) bersamaan
# Usage: ./start-local.sh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Fix OpenMP duplicate library issue on macOS
export KMP_DUPLICATE_LIB_OK=TRUE

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}    DNAI - Local Development Mode    ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down services...${NC}"
    
    # Kill background processes
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        echo -e "${GREEN}✓ Backend stopped${NC}"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        echo -e "${GREEN}✓ Frontend stopped${NC}"
    fi
    
    # Kill any remaining processes on ports
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    
    echo -e "${GREEN}Done!${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# ==================== BACKEND SETUP ====================
echo -e "${BLUE}[Backend]${NC} Setting up..."

cd backend

# Check if venv exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate venv and check dependencies
echo -e "${BLUE}[Backend]${NC} Activating virtual environment..."
source venv/bin/activate

# Check if requirements installed
if ! python -c "import fastapi" 2>/dev/null; then
    echo -e "${YELLOW}Installing Python dependencies...${NC}"
    pip install -r requirements.txt
fi

# Check if FAISS index exists
if [ ! -f "data/food_index.faiss" ]; then
    echo -e "${YELLOW}Building FAISS index (this may take a few minutes)...${NC}"
    python scripts/prepare_data.py
    python scripts/build_index.py
fi

# Setup .env if not exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        JWT_SECRET=$(openssl rand -hex 32)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/your_super_secret_jwt_key_change_in_production/$JWT_SECRET/" .env
        else
            sed -i "s/your_super_secret_jwt_key_change_in_production/$JWT_SECRET/" .env
        fi
        echo -e "${GREEN}✓ .env created${NC}"
        echo -e "${YELLOW}⚠️  Edit backend/.env and add GEMINI_API_KEY for chat feature${NC}"
    fi
fi

echo -e "${GREEN}✓ Backend ready${NC}"

# Start Backend
echo -e "${BLUE}[Backend]${NC} Starting on http://localhost:8000 ..."
python app.py &
BACKEND_PID=$!

cd ..

# Wait for backend to be ready
echo -e "${BLUE}[Backend]${NC} Waiting for server to start..."
for i in {1..30}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend is running!${NC}"
        break
    fi
    sleep 1
done

# ==================== FRONTEND SETUP ====================
echo ""
echo -e "${BLUE}[Frontend]${NC} Setting up..."

cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing npm dependencies...${NC}"
    npm install
fi

echo -e "${GREEN}✓ Frontend ready${NC}"

# Start Frontend
echo -e "${BLUE}[Frontend]${NC} Starting on http://localhost:3000 ..."
npm start &
FRONTEND_PID=$!

cd ..

# ==================== DONE ====================
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}    DNAI is running!                 ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Frontend:  ${GREEN}http://localhost:3000${NC}"
echo -e "Backend:   ${GREEN}http://localhost:8000${NC}"
echo -e "API Docs:  ${GREEN}http://localhost:8000/docs${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Wait for processes
wait
