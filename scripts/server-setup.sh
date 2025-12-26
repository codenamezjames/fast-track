#!/bin/bash
#
# Fast Track Server Setup Script
# Run this once on the media server to set up the deployment environment
#

set -e

# Configuration
REPO_URL="${REPO_URL:-git@github.com:yourusername/fast-track.git}"
REPO_DIR="${REPO_DIR:-/opt/fast-track}"
DEPLOY_USER="${DEPLOY_USER:-$(whoami)}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
  echo -e "${GREEN}[SETUP]${NC} $1"
}

warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

# Check for Docker
if ! command -v docker &> /dev/null; then
  log "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker "$DEPLOY_USER"
  warn "Docker installed. You may need to log out and back in for group changes."
fi

# Check for Docker Compose (v2 plugin)
if ! docker compose version &> /dev/null; then
  log "Installing Docker Compose plugin..."
  sudo apt-get update
  sudo apt-get install -y docker-compose-plugin
fi

# Create deployment directory
log "Creating deployment directory at $REPO_DIR..."
sudo mkdir -p "$REPO_DIR"
sudo chown "$DEPLOY_USER:$DEPLOY_USER" "$REPO_DIR"

# Clone repository if not exists
if [ ! -d "$REPO_DIR/.git" ]; then
  log "Cloning repository..."
  git clone "$REPO_URL" "$REPO_DIR"
else
  log "Repository already exists, pulling latest..."
  cd "$REPO_DIR"
  git pull
fi

cd "$REPO_DIR"

# Create .env file if not exists
if [ ! -f ".env" ]; then
  log "Creating .env file..."
  cat > .env << 'EOF'
# MongoDB
MONGO_PASSWORD=your-secure-mongo-password-here

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_SECRET=your-jwt-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# CORS (update if accessing from different domain)
CORS_ORIGIN=http://theflyingdutchman.local:8080

# API URL for frontend (used at build time)
VITE_API_URL=http://theflyingdutchman.local:3000/api
EOF
  warn "Created .env file. Please edit with secure values!"
  warn "Generate secrets with: openssl rand -base64 32"
fi

log "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit $REPO_DIR/.env with secure passwords and secrets"
echo "2. Run: cd $REPO_DIR && docker compose up -d"
echo "3. Access the app at: http://theflyingdutchman.local:8080"
echo ""
echo "For auto-deploy, set up the systemd service:"
echo "  sudo cp scripts/fast-track-deploy.service /etc/systemd/system/"
echo "  sudo systemctl enable fast-track-deploy.timer"
echo "  sudo systemctl start fast-track-deploy.timer"
