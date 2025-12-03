#!/bin/bash
# DNAI Deployment Script
# Usage: ./deploy.sh [command]
# Commands: build, up, down, logs, rebuild-index, add-food

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | xargs)
fi

# Functions
print_status() {
    echo -e "${GREEN}[DNAI]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_env() {
    if [ -z "$GEMINI_API_KEY" ]; then
        print_warning "GEMINI_API_KEY not set. Chatbot features will not work."
    fi
    if [ -z "$JWT_SECRET_KEY" ]; then
        print_error "JWT_SECRET_KEY not set. Please set it in .env file."
        exit 1
    fi
}

build() {
    print_status "Building Docker images..."
    docker-compose build
    print_status "Build complete!"
}

up() {
    check_env
    print_status "Starting DNAI services..."
    docker-compose up -d
    print_status "Services started!"
    print_status "Frontend: http://localhost"
    print_status "Backend API: http://localhost:8000"
    print_status "API Docs: http://localhost:8000/docs"
}

down() {
    print_status "Stopping DNAI services..."
    docker-compose down
    print_status "Services stopped!"
}

logs() {
    docker-compose logs -f
}

rebuild_index() {
    print_status "Rebuilding FAISS index..."
    docker-compose exec backend python scripts/build_index.py
    print_status "Index rebuilt!"
}

add_food() {
    if [ $# -lt 7 ]; then
        print_error "Usage: ./deploy.sh add-food <image_path> <id> <name> <calories> <price> <location> <description>"
        exit 1
    fi
    
    print_status "Adding new food to database..."
    docker-compose exec backend python scripts/add_food.py \
        --image "$1" \
        --id "$2" \
        --name "$3" \
        --calories "$4" \
        --price "$5" \
        --location "$6" \
        --description "$7"
}

status() {
    print_status "DNAI Service Status:"
    docker-compose ps
}

# Main command handler
case "$1" in
    build)
        build
        ;;
    up)
        up
        ;;
    down)
        down
        ;;
    logs)
        logs
        ;;
    rebuild-index)
        rebuild_index
        ;;
    add-food)
        shift
        add_food "$@"
        ;;
    status)
        status
        ;;
    restart)
        down
        up
        ;;
    *)
        echo "DNAI Deployment Script"
        echo ""
        echo "Usage: ./deploy.sh [command]"
        echo ""
        echo "Commands:"
        echo "  build         Build Docker images"
        echo "  up            Start all services"
        echo "  down          Stop all services"
        echo "  restart       Restart all services"
        echo "  logs          View logs (follow mode)"
        echo "  status        Show service status"
        echo "  rebuild-index Rebuild FAISS vector database"
        echo "  add-food      Add new food (see usage)"
        echo ""
        echo "Example - Add new food:"
        echo "  ./deploy.sh add-food ./nasi_uduk.jpg nasi_uduk \"Nasi Uduk\" 280 12000 \"Warung Bu Ani\" \"Coconut rice with side dishes\""
        ;;
esac
