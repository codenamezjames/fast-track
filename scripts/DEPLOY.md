# Fast Track Deployment Guide

This guide covers deploying Fast Track to your media server (`theflyingdutchman.local`).

## Prerequisites

- Docker and Docker Compose installed on the server
- SSH access to the server
- Git repository accessible from the server

## Quick Start

### 1. Initial Setup (One-time)

From your Mac:

```bash
# Copy setup script to server
scp scripts/server-setup.sh theflyingdutchman.local:~/

# SSH to server and run setup
ssh theflyingdutchman.local
chmod +x server-setup.sh
REPO_URL=git@github.com:yourusername/fast-track.git ./server-setup.sh
```

### 2. Configure Environment

On the server, edit the environment file:

```bash
cd /opt/fast-track
nano .env
```

Generate secure secrets:

```bash
# Generate JWT secrets
openssl rand -base64 32  # Use for JWT_SECRET
openssl rand -base64 32  # Use for JWT_REFRESH_SECRET

# Generate MongoDB password
openssl rand -base64 24  # Use for MONGO_PASSWORD
```

### 3. Start the Application

```bash
cd /opt/fast-track
docker compose up -d
```

Access the app at: `http://theflyingdutchman.local:8088`

---

## Auto-Deploy Options

Choose one of these options for automatic deployments:

### Option A: Timer-based Polling (Recommended for Local)

This option checks for new commits every 5 minutes and deploys automatically.

```bash
# On the server
cd /opt/fast-track

# Copy systemd files
sudo cp scripts/fast-track-deploy.service /etc/systemd/system/
sudo cp scripts/fast-track-deploy.timer /etc/systemd/system/

# Enable and start the timer
sudo systemctl daemon-reload
sudo systemctl enable fast-track-deploy.timer
sudo systemctl start fast-track-deploy.timer

# Check status
systemctl status fast-track-deploy.timer
systemctl list-timers | grep fast-track
```

To view deployment logs:

```bash
journalctl -u fast-track-deploy -f
```

### Option B: GitHub Actions Self-Hosted Runner

This option deploys immediately when you push to main.

#### Install the Runner

1. Go to your GitHub repo → Settings → Actions → Runners → New self-hosted runner

2. On your server, follow GitHub's instructions:

```bash
# Create a folder
mkdir -p ~/actions-runner && cd ~/actions-runner

# Download (use URL from GitHub)
curl -o actions-runner-linux-x64-2.xxx.x.tar.gz -L https://github.com/actions/runner/releases/download/v2.xxx.x/actions-runner-linux-x64-2.xxx.x.tar.gz

# Extract
tar xzf ./actions-runner-linux-x64-2.xxx.x.tar.gz

# Configure (use token from GitHub)
./config.sh --url https://github.com/yourusername/fast-track --token YOUR_TOKEN

# Install as service
sudo ./svc.sh install
sudo ./svc.sh start
```

3. The `deploy-server.yml` workflow will now run on your server when you push to main.

---

## Manual Deployment

If you need to deploy manually:

```bash
ssh theflyingdutchman.local
cd /opt/fast-track
./scripts/deploy.sh
```

Or from your Mac:

```bash
ssh theflyingdutchman.local 'cd /opt/fast-track && ./scripts/deploy.sh'
```

---

## Useful Commands

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api
docker compose logs -f web
docker compose logs -f mongodb
```

### Restart Services

```bash
docker compose restart

# Restart specific service
docker compose restart api
```

### Check Service Health

```bash
# API health
curl http://localhost:3000/api/health

# Container status
docker compose ps
```

### Database Backup

```bash
# Backup
docker exec fast-track-mongo mongodump --archive=/data/backup.archive --gzip -u admin -p $MONGO_PASSWORD --authenticationDatabase admin

# Copy backup to host
docker cp fast-track-mongo:/data/backup.archive ./backup-$(date +%Y%m%d).archive
```

### Full Rebuild

If something goes wrong:

```bash
cd /opt/fast-track
docker compose down -v  # Warning: removes volumes/data
docker compose build --no-cache
docker compose up -d
```

---

## Troubleshooting

### API not starting

```bash
# Check API logs
docker compose logs api

# Common issues:
# - MongoDB not ready: wait and retry
# - Wrong MONGODB_URI: check .env
# - Port conflict: check if 3000 is in use
```

### Web not loading

```bash
# Check web logs
docker compose logs web

# Check nginx config
docker exec fast-track-web cat /etc/nginx/conf.d/default.conf
```

### MongoDB connection issues

```bash
# Check if MongoDB is running
docker compose ps mongodb

# Test connection
docker exec fast-track-mongo mongosh -u admin -p $MONGO_PASSWORD --authenticationDatabase admin
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  theflyingdutchman.local                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────┐    ┌───────────┐    ┌───────────────┐   │
│  │   Web     │───▶│    API    │───▶│   MongoDB     │   │
│  │  :8088    │    │   :3000   │    │    :27017     │   │
│  │  (nginx)  │    │ (Express) │    │   (mongo:7)   │   │
│  └───────────┘    └───────────┘    └───────────────┘   │
│                                                         │
│  Docker Network: fast-track-network                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Public Domain Access (Cloudflare Tunnel)

If you have a Cloudflare tunnel configured, update `/etc/cloudflared/config.yml`:

```yaml
ingress:
  - hostname: ft.theflyingdutchman.online
    service: http://localhost:8088
  - hostname: api-ft.theflyingdutchman.online
    service: http://localhost:3000
  - service: http_status:404
```

Then restart the tunnel:

```bash
sudo systemctl restart cloudflared
```

Make sure your `.env` includes both origins for CORS:

```env
CORS_ORIGIN=http://theflyingdutchman.local:8088,https://ft.theflyingdutchman.online
VITE_API_URL=https://api-ft.theflyingdutchman.online/api
```

---

## File Locations

| What | Where |
|------|-------|
| Application | `/opt/fast-track` |
| Environment | `/opt/fast-track/.env` |
| MongoDB data | Docker volume `fast-track_mongo_data` |
| Deploy logs | `journalctl -u fast-track-deploy` |
| Container logs | `docker compose logs` |
| Cloudflare config | `/etc/cloudflared/config.yml` |
