#!/bin/bash
# DNAI Local Development with Conda
# Usage: ./start-conda.sh

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   DNAI - Conda Environment Setup      ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check Conda
if ! command -v conda &> /dev/null; then
    echo -e "${RED}❌ Conda not found!${NC}"
    echo "Install Miniconda from: https://docs.conda.io/en/latest/miniconda.html"
    exit 1
fi
echo -e "${GREEN}✓ Conda found${NC}"

# Initialize conda for this shell
CONDA_BASE=$(conda info --base)
source "$CONDA_BASE/etc/profile.d/conda.sh"

ENV_NAME="dnai"

# Remove broken environment if exists
if conda info --envs | grep -q "^$ENV_NAME "; then
    # Check if it has python
    ENV_PATH="$CONDA_BASE/envs/$ENV_NAME"
    if [ ! -f "$ENV_PATH/bin/python" ]; then
        echo -e "${YELLOW}Removing broken environment...${NC}"
        conda env remove -n $ENV_NAME -y
    fi
fi

# Create environment if not exists
if ! conda info --envs | grep -q "^$ENV_NAME "; then
    echo -e "${YELLOW}Creating conda environment '$ENV_NAME'...${NC}"
    echo -e "${YELLOW}This will install Python 3.10 + PyTorch + FAISS (may take a few minutes)${NC}"
    conda create -n $ENV_NAME python=3.10 pytorch torchvision faiss-cpu -c conda-forge -y
    echo -e "${GREEN}✓ Conda environment created${NC}"
fi

# Activate environment
echo -e "${YELLOW}Activating environment...${NC}"
conda activate $ENV_NAME

# Get python path
PYTHON="$CONDA_BASE/envs/$ENV_NAME/bin/python"
PIP="$CONDA_BASE/envs/$ENV_NAME/bin/pip"

# Verify python exists
if [ ! -f "$PYTHON" ]; then
    echo -e "${RED}❌ Python not found in environment${NC}"
    echo -e "${YELLOW}Recreating environment...${NC}"
    conda env remove -n $ENV_NAME -y
    conda create -n $ENV_NAME python=3.10 pytorch torchvision faiss-cpu -c conda-forge -y
    conda activate $ENV_NAME
fi

# Verify torch installation
echo -e "${YELLOW}Verifying PyTorch installation...${NC}"
if $PYTHON -c "import torch; import faiss; print(f'PyTorch {torch.__version__}'); print('FAISS OK')" 2>/dev/null; then
    echo -e "${GREEN}✓ ML dependencies verified${NC}"
else
    echo -e "${YELLOW}Installing ML dependencies...${NC}"
    conda install -n $ENV_NAME pytorch torchvision faiss-cpu -c conda-forge -y
fi

# Store script directory as root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Go to backend directory
cd "$SCRIPT_DIR/backend"

# Setup .env if not exists
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
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
        
        echo -e "${GREEN}✓ .env created${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  PENTING: Edit backend/.env dan tambahkan GEMINI_API_KEY${NC}"
        echo -e "${YELLOW}   Dapat dari: https://makersuite.google.com/app/apikey${NC}"
        echo ""
    fi
fi

# Install remaining dependencies via pip
echo -e "${YELLOW}Installing pip dependencies...${NC}"
$PIP install --quiet fastapi 'uvicorn[standard]' python-multipart 2>/dev/null
$PIP install --quiet PyJWT 'passlib[bcrypt]' 'python-jose[cryptography]' 2>/dev/null
$PIP install --quiet transformers Pillow 2>/dev/null
$PIP install --quiet langchain langchain-core langchain-community langchain-google-genai google-generativeai 2>/dev/null
$PIP install --quiet python-dotenv pydantic httpx 2>/dev/null
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Create data directories
mkdir -p data/food_images

# Build FAISS index
echo -e "${YELLOW}Building FAISS index...${NC}"
$PYTHON scripts/build_index.py

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}    Starting DNAI Servers            ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Backend API:  ${GREEN}http://localhost:8000${NC}"
echo -e "API Docs:     ${GREEN}http://localhost:8000/docs${NC}"
echo -e "Frontend:     ${GREEN}http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping servers...${NC}"
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    # Kill any remaining processes on ports
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    echo -e "${GREEN}Servers stopped${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend in background (already in backend dir)
echo -e "${YELLOW}Starting backend...${NC}"
$PYTHON -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend if node is available
cd "$SCRIPT_DIR"
if command -v npm &> /dev/null; then
    if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
        echo -e "${YELLOW}Starting frontend...${NC}"
        cd "$SCRIPT_DIR/frontend"
        npm install --silent 2>/dev/null
        npm start &
        FRONTEND_PID=$!
        echo -e "${GREEN}Frontend started (PID: $FRONTEND_PID)${NC}"
    fi
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Both servers are running!           ${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Backend:  ${GREEN}http://localhost:8000${NC}"
echo -e "Frontend: ${GREEN}http://localhost:3000${NC}"
echo ""

# Wait for both processes
wait
