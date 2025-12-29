#!/bin/bash

set -e  # Exit on error

# Configuration
SERVER_HOST="theflyingdutchman.local"
SERVER_USER="theflyingdutchman"
DEPLOY_DIR="/home/theflyingdutchman/dev/fast-track-v2"
OLD_DIR="/home/theflyingdutchman/dev/fast-track"
REPO_URL="https://github.com/codenamezjames/fast-track.git"

echo "🚀 Fast Track v2 Deployment Script"
echo "=================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if .env.production exists locally
if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found!"
    echo "Please create .env.production with the following variables:"
    echo ""
    echo "# PostgreSQL Configuration"
    echo "POSTGRES_USER=postgres"
    echo "POSTGRES_PASSWORD=your-secure-password"
    echo "POSTGRES_DB=fast_track"
    echo ""
    echo "# Redis Configuration"
    echo "REDIS_PASSWORD="
    echo ""
    echo "# AdonisJS Configuration"
    echo "APP_KEY=your-app-key-generate-with-node-ace-generate-key"
    echo "PORT=3000"
    echo "HOST=0.0.0.0"
    echo "NODE_ENV=production"
    echo "LOG_LEVEL=info"
    echo "SESSION_DRIVER=cookie"
    echo ""
    echo "# Database"
    echo "DB_HOST=postgres"
    echo "DB_PORT=5432"
    echo "DB_USER=postgres"
    echo "DB_PASSWORD=your-secure-password"
    echo "DB_DATABASE=fast_track"
    echo ""
    echo "# Redis"
    echo "REDIS_HOST=redis"
    echo "REDIS_PORT=6379"
    echo "REDIS_PASSWORD="
    echo ""
    echo "# CORS"
    echo "CORS_ORIGIN=https://ft.theflyingdutchman.online"
    echo ""
    echo "# VAPID (Web Push)"
    echo "VAPID_SUBJECT=mailto:your-email@example.com"
    echo "VAPID_PUBLIC_KEY=your-vapid-public-key"
    echo "VAPID_PRIVATE_KEY=your-vapid-private-key"
    echo ""
    echo "# Frontend Build Args"
    echo "VITE_API_URL=https://api-ft.theflyingdutchman.online/api"
    echo "VITE_VAPID_PUBLIC_KEY=your-vapid-public-key"
    exit 1
fi

print_info "Step 1: Stopping and removing v1 containers..."
ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
    cd /home/theflyingdutchman/dev/fast-track

    echo "Stopping v1 containers..."
    docker compose down || true

    echo "Removing v1 containers..."
    docker rm -f fast-track-api fast-track-web fast-track-mongo 2>/dev/null || true

    echo "✓ v1 containers removed"
ENDSSH

print_info "Step 2: Creating deployment directory and transferring files..."
ssh ${SERVER_USER}@${SERVER_HOST} << ENDSSH
    mkdir -p ${DEPLOY_DIR}
    echo "✓ Deployment directory created"
ENDSSH

# Copy the entire project to the server
print_info "Syncing project files to server..."
rsync -avz --exclude 'node_modules' \
           --exclude '.git' \
           --exclude 'dist' \
           --exclude 'build' \
           --exclude '.env*' \
           ./ ${SERVER_USER}@${SERVER_HOST}:${DEPLOY_DIR}/

# Copy production environment file
print_info "Copying production environment file..."
scp .env.production ${SERVER_USER}@${SERVER_HOST}:${DEPLOY_DIR}/.env

print_info "Step 3: Building and starting v2 containers..."
ssh ${SERVER_USER}@${SERVER_HOST} << ENDSSH
    cd ${DEPLOY_DIR}

    echo "Building Docker images..."
    docker compose -f docker-compose.prod.yml build

    echo "Starting containers..."
    docker compose -f docker-compose.prod.yml up -d

    echo "✓ v2 containers started"
ENDSSH

print_info "Step 4: Waiting for services to be healthy..."
sleep 10

ssh ${SERVER_USER}@${SERVER_HOST} << ENDSSH
    cd ${DEPLOY_DIR}

    echo "Checking container health..."
    docker compose -f docker-compose.prod.yml ps
ENDSSH

print_info "Step 5: Running database migrations..."
ssh ${SERVER_USER}@${SERVER_HOST} << ENDSSH
    cd ${DEPLOY_DIR}

    echo "Running migrations..."
    docker compose -f docker-compose.prod.yml exec -T api node build/ace.js migration:run --force

    echo "✓ Migrations completed"
ENDSSH

print_info "Step 6: Verifying deployment..."
echo ""
echo "Checking API health..."
ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
    # Wait a bit for API to fully start
    sleep 5

    # Check if API is responding
    API_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health || echo "000")

    if [ "$API_HEALTH" = "200" ]; then
        echo "✓ API is healthy (HTTP $API_HEALTH)"
    else
        echo "⚠️  API health check returned HTTP $API_HEALTH"
    fi

    # Check if Web is responding
    WEB_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8088/health || echo "000")

    if [ "$WEB_HEALTH" = "200" ]; then
        echo "✓ Web is healthy (HTTP $WEB_HEALTH)"
    else
        echo "⚠️  Web health check returned HTTP $WEB_HEALTH"
    fi
ENDSSH

echo ""
print_info "Deployment complete! 🎉"
echo ""
echo "Services are running at:"
echo "  - Frontend: https://ft.theflyingdutchman.online"
echo "  - API: https://api-ft.theflyingdutchman.online"
echo ""
echo "To view logs:"
echo "  ssh ${SERVER_USER}@${SERVER_HOST} 'cd ${DEPLOY_DIR} && docker compose -f docker-compose.prod.yml logs -f'"
echo ""
echo "To stop services:"
echo "  ssh ${SERVER_USER}@${SERVER_HOST} 'cd ${DEPLOY_DIR} && docker compose -f docker-compose.prod.yml down'"
echo ""
