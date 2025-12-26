#!/bin/bash
#
# Fast Track Deployment Script
# Run this on the media server to deploy the latest version
#

set -e

# Configuration
REPO_DIR="${REPO_DIR:-/opt/fast-track}"
BRANCH="${BRANCH:-main}"
COMPOSE_FILE="docker-compose.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
  echo -e "${GREEN}[DEPLOY]${NC} $1"
}

warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
  echo -e "${RED}[ERROR]${NC} $1"
  exit 1
}

# Check if repo exists
if [ ! -d "$REPO_DIR" ]; then
  error "Repository not found at $REPO_DIR. Run initial setup first."
fi

cd "$REPO_DIR"

# Get current commit for comparison
OLD_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "none")

log "Fetching latest changes from origin/$BRANCH..."
git fetch origin "$BRANCH"

# Check if there are new changes
NEW_COMMIT=$(git rev-parse "origin/$BRANCH")
if [ "$OLD_COMMIT" = "$NEW_COMMIT" ]; then
  log "Already up to date. No deployment needed."
  exit 0
fi

log "New changes detected: $OLD_COMMIT -> $NEW_COMMIT"

# Pull changes
log "Pulling latest code..."
git checkout "$BRANCH"
git pull origin "$BRANCH"

# Check if docker-compose files changed
COMPOSE_CHANGED=$(git diff --name-only "$OLD_COMMIT" "$NEW_COMMIT" | grep -E "(docker-compose|Dockerfile)" || true)

# Check if package files changed (need to rebuild)
PACKAGES_CHANGED=$(git diff --name-only "$OLD_COMMIT" "$NEW_COMMIT" | grep -E "package.*\.json" || true)

if [ -n "$COMPOSE_CHANGED" ] || [ -n "$PACKAGES_CHANGED" ]; then
  log "Rebuilding containers (dependencies or Docker config changed)..."
  docker compose build --no-cache
else
  log "Rebuilding containers..."
  docker compose build
fi

# Stop old containers
log "Stopping old containers..."
docker compose down

# Start new containers
log "Starting new containers..."
docker compose up -d

# Wait for health check
log "Waiting for services to be healthy..."
sleep 5

# Check if API is responding
if curl -sf http://localhost:3000/api/health > /dev/null 2>&1; then
  log "API is healthy!"
else
  warn "API health check failed. Check logs with: docker compose logs api"
fi

# Check if web is responding
if curl -sf http://localhost:8080 > /dev/null 2>&1; then
  log "Web is healthy!"
else
  warn "Web health check failed. Check logs with: docker compose logs web"
fi

# Cleanup old images
log "Cleaning up old Docker images..."
docker image prune -f

log "Deployment complete!"
echo ""
echo "Services running:"
docker compose ps
echo ""
echo "View logs: docker compose logs -f"
