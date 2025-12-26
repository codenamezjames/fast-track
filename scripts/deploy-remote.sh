#!/bin/bash
#
# Deploy Fast Track to media server from your Mac
# Usage: ./scripts/deploy-remote.sh
#

set -e

# Configuration
SERVER="${SERVER:-theflyingdutchman.local}"
USER="${USER:-theflyingdutchman}"
REPO_DIR="${REPO_DIR:-/opt/fast-track}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
  echo -e "${GREEN}[DEPLOY]${NC} $1"
}

log "Deploying to $SERVER..."

# Run deploy script on remote server
ssh "$USER@$SERVER" "cd $REPO_DIR && ./scripts/deploy.sh"

log "Deployment complete!"
echo ""
echo "View logs: ssh $USER@$SERVER 'cd $REPO_DIR && docker compose logs -f'"
