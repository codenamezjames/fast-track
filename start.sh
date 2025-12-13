#!/bin/bash

# FastTrack - Full Stack Startup Script
# Usage: ./start.sh [backend|frontend|all]

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[FastTrack]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[FastTrack]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[FastTrack]${NC} $1"
}

print_error() {
    echo -e "${RED}[FastTrack]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Wait for Appwrite to be ready
wait_for_appwrite() {
    print_status "Waiting for Appwrite to be ready..."
    local max_attempts=60
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:5501/v1/health > /dev/null 2>&1; then
            print_success "Appwrite is ready!"
            return 0
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done

    print_error "Appwrite failed to start after ${max_attempts} attempts"
    return 1
}

# Start the backend (Appwrite)
start_backend() {
    print_status "Starting Appwrite backend..."
    cd "$PROJECT_ROOT"

    # Check if containers are already running
    if docker ps | grep -q "appwrite"; then
        print_warning "Appwrite containers already running"
    else
        docker-compose up -d
        print_status "Waiting for services to initialize..."
        sleep 5
    fi

    wait_for_appwrite

    echo ""
    print_success "Backend is running!"
    echo ""
    echo "  Appwrite API:     http://localhost:5501/v1"
    echo "  Appwrite Console: http://localhost:5501/console"
    echo ""
}

# Start the frontend
start_frontend() {
    print_status "Starting frontend development server..."
    cd "$FRONTEND_DIR"

    # Ensure dependencies are installed
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        npm ci
    fi

    # Start dev server
    print_success "Starting Quasar dev server on port 9001..."
    npm run dev
}

# Start frontend in background
start_frontend_bg() {
    print_status "Starting frontend development server in background..."
    cd "$FRONTEND_DIR"

    # Ensure dependencies are installed
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        npm ci
    fi

    # Start dev server in background
    npm run dev &
    FRONTEND_PID=$!

    # Wait for frontend to be ready
    sleep 5

    if curl -s -o /dev/null -w "%{http_code}" http://localhost:9001 | grep -q "200"; then
        print_success "Frontend is ready!"
    fi

    echo ""
    echo "  Frontend: http://localhost:9001"
    echo "  Frontend PID: $FRONTEND_PID"
}

# Stop all services
stop_all() {
    print_status "Stopping all services..."
    cd "$PROJECT_ROOT"
    docker-compose down
    pkill -f "quasar dev" 2>/dev/null || true
    print_success "All services stopped"
}

# Show status
show_status() {
    echo ""
    print_status "Service Status:"
    echo ""

    # Check Appwrite
    if curl -s http://localhost:5501/v1/health > /dev/null 2>&1; then
        echo -e "  Appwrite:  ${GREEN}Running${NC} (http://localhost:5501)"
    else
        echo -e "  Appwrite:  ${RED}Stopped${NC}"
    fi

    # Check Frontend
    if curl -s http://localhost:9001 > /dev/null 2>&1; then
        echo -e "  Frontend:  ${GREEN}Running${NC} (http://localhost:9001)"
    else
        echo -e "  Frontend:  ${RED}Stopped${NC}"
    fi

    echo ""
}

# Print usage
print_usage() {
    echo ""
    echo "FastTrack Development Environment"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  backend    Start Appwrite backend only"
    echo "  frontend   Start frontend dev server only"
    echo "  all        Start both backend and frontend"
    echo "  stop       Stop all services"
    echo "  status     Show service status"
    echo "  logs       Show Appwrite logs"
    echo ""
    echo "Default: all"
    echo ""
}

# Main
case "${1:-all}" in
    backend)
        check_docker
        start_backend
        ;;
    frontend)
        start_frontend
        ;;
    all)
        check_docker
        start_backend
        echo ""
        print_status "Starting frontend..."
        start_frontend
        ;;
    stop)
        stop_all
        ;;
    status)
        show_status
        ;;
    logs)
        cd "$PROJECT_ROOT"
        docker-compose logs -f appwrite
        ;;
    help|--help|-h)
        print_usage
        ;;
    *)
        print_error "Unknown command: $1"
        print_usage
        exit 1
        ;;
esac
