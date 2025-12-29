# Fast Track v2 Deployment Guide

This guide walks through deploying Fast Track v2 to your home server (theflyingdutchman.local).

## Prerequisites

- SSH access to theflyingdutchman.local configured in `~/.ssh/config`
- Docker and Docker Compose installed on the server
- Cloudflare DNS configured for:
  - `ft.theflyingdutchman.online` → 100.89.126.7:8088
  - `api-ft.theflyingdutchman.online` → 100.89.126.7:3000

## Pre-Deployment Setup

### 1. Generate Required Secrets

#### Generate APP_KEY for AdonisJS

```bash
# From the project root
cd packages/api
npm run build
node ace generate:key
```

Copy the generated key for use in `.env.production`.

#### Generate VAPID Keys for Web Push

```bash
npx web-push generate-vapid-keys
```

You'll get output like:
```
Public Key: BGx...
Private Key: y8b...
```

Save both keys for use in `.env.production`.

### 2. Create Production Environment File

Copy the example file:
```bash
cp .env.production.example .env.production
```

Edit `.env.production` and fill in all the values:

```bash
# Required changes:
# 1. Set POSTGRES_PASSWORD to a secure password (same value in two places)
# 2. Set APP_KEY to the value from step 1
# 3. Set VAPID_SUBJECT to your email (e.g., mailto:you@example.com)
# 4. Set VAPID_PUBLIC_KEY to the public key from step 1
# 5. Set VAPID_PRIVATE_KEY to the private key from step 1
# 6. Set VITE_VAPID_PUBLIC_KEY to the same public key

vim .env.production
```

**Important**: Keep the following values as-is unless you need to change ports:
- `DB_HOST=postgres` (Docker service name)
- `REDIS_HOST=redis` (Docker service name)
- `PORT=3000` (API port - matches v1)
- `CORS_ORIGIN=https://ft.theflyingdutchman.online`
- `VITE_API_URL=https://api-ft.theflyingdutchman.online/api`

### 3. Update GitHub Repository URL

Edit `deploy.sh` and update the `REPO_URL` variable (not currently used, but good to set):

```bash
REPO_URL="https://github.com/yourusername/fast-track.git"
```

### 4. Make Deploy Script Executable

```bash
chmod +x deploy.sh
```

## Deployment

Run the deployment script:

```bash
./deploy.sh
```

The script will:
1. Stop and remove v1 containers (fast-track-api, fast-track-web, fast-track-mongo)
2. Create deployment directory at `/home/theflyingdutchman/dev/fast-track-v2`
3. Sync project files to the server
4. Copy `.env.production` to server as `.env`
5. Build Docker images on the server
6. Start all services (postgres, redis, api, web)
7. Run database migrations
8. Verify all services are healthy

## Post-Deployment

### Verify Services

Check that all containers are running:
```bash
ssh theflyingdutchman@theflyingdutchman.local
cd /home/theflyingdutchman/dev/fast-track-v2
docker compose -f docker-compose.prod.yml ps
```

Expected output:
```
NAME                       STATUS              PORTS
fast-track-v2-postgres     Up (healthy)        5432/tcp
fast-track-v2-redis        Up (healthy)        6379/tcp
fast-track-v2-api          Up (healthy)        0.0.0.0:3000->3000/tcp
fast-track-v2-web          Up                  0.0.0.0:8088->80/tcp
```

### Test Endpoints

**Frontend**: https://ft.theflyingdutchman.online
**API Health**: https://api-ft.theflyingdutchman.online/health

### View Logs

```bash
# All services
ssh theflyingdutchman@theflyingdutchman.local 'cd /home/theflyingdutchman/dev/fast-track-v2 && docker compose -f docker-compose.prod.yml logs -f'

# Specific service
ssh theflyingdutchman@theflyingdutchman.local 'cd /home/theflyingdutchman/dev/fast-track-v2 && docker compose -f docker-compose.prod.yml logs -f api'
```

### Create First User

Register via the web UI:
1. Visit https://ft.theflyingdutchman.online
2. Click "Sign Up"
3. Enter email and password
4. You'll be automatically logged in

## Maintenance

### Update Deployment

To deploy changes:
1. Commit and push changes to Git
2. Run `./deploy.sh` again

### Restart Services

```bash
ssh theflyingdutchman@theflyingdutchman.local
cd /home/theflyingdutchman/dev/fast-track-v2
docker compose -f docker-compose.prod.yml restart
```

### Stop Services

```bash
ssh theflyingdutchman@theflyingdutchman.local
cd /home/theflyingdutchman/dev/fast-track-v2
docker compose -f docker-compose.prod.yml down
```

### Database Backup

```bash
# Backup
ssh theflyingdutchman@theflyingdutchman.local
cd /home/theflyingdutchman/dev/fast-track-v2
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres fast_track > backup.sql

# Restore
docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres fast_track < backup.sql
```

### Run Migrations Manually

```bash
ssh theflyingdutchman@theflyingdutchman.local
cd /home/theflyingdutchman/dev/fast-track-v2
docker compose -f docker-compose.prod.yml exec api node ace migration:run --force
```

### Access Database Console

```bash
ssh theflyingdutchman@theflyingdutchman.local
cd /home/theflyingdutchman/dev/fast-track-v2
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres fast_track
```

### Access Redis Console

```bash
ssh theflyingdutchman@theflyingdutchman.local
cd /home/theflyingdutchman/dev/fast-track-v2
docker compose -f docker-compose.prod.yml exec redis redis-cli
```

## Troubleshooting

### API Won't Start

Check logs:
```bash
docker compose -f docker-compose.prod.yml logs api
```

Common issues:
- Database not ready: Wait for postgres health check
- Missing APP_KEY: Generate with `node ace generate:key`
- Port conflict: Check if port 3000 is already in use

### Web Won't Build

Check logs:
```bash
docker compose -f docker-compose.prod.yml logs web
```

Common issues:
- Missing VITE_API_URL in .env
- Missing VITE_VAPID_PUBLIC_KEY in .env
- Out of memory during build: Increase Docker memory limit

### Database Connection Errors

Verify postgres is healthy:
```bash
docker compose -f docker-compose.prod.yml ps postgres
```

Check credentials match in .env:
- POSTGRES_PASSWORD = DB_PASSWORD
- POSTGRES_USER = DB_USER
- POSTGRES_DB = DB_DATABASE

### CORS Errors

Verify CORS_ORIGIN in .env matches your frontend domain:
```bash
CORS_ORIGIN=https://ft.theflyingdutchman.online
```

### Push Notifications Not Working

1. Verify VAPID keys are set correctly (public key matches in 3 places)
2. Check service worker registration in browser console
3. Ensure HTTPS is working (required for push notifications)
4. Test subscription endpoint: https://api-ft.theflyingdutchman.online/api/push-subscriptions

## Architecture

### Services

| Service | Container Name | Port | Volume |
|---------|---------------|------|--------|
| PostgreSQL | fast-track-v2-postgres | 5432 | fast_track_v2_postgres_data |
| Redis | fast-track-v2-redis | 6379 | fast_track_v2_redis_data |
| API | fast-track-v2-api | 3000 | - |
| Web | fast-track-v2-web | 8088 (→80) | - |

### Network Flow

```
Internet → Cloudflare (HTTPS) → Server (theflyingdutchman.local)
  ├── ft.theflyingdutchman.online:443 → 100.89.126.7:8088 (Web)
  └── api-ft.theflyingdutchman.online:443 → 100.89.126.7:3000 (API)
```

### Data Persistence

Data is persisted in Docker volumes:
- `fast_track_v2_postgres_data` - PostgreSQL database files
- `fast_track_v2_redis_data` - Redis AOF persistence

These volumes survive container restarts and rebuilds.

## Rollback to v1

If you need to rollback:

```bash
ssh theflyingdutchman@theflyingdutchman.local
cd /home/theflyingdutchman/dev/fast-track
docker compose up -d
```

Then stop v2:
```bash
cd /home/theflyingdutchman/dev/fast-track-v2
docker compose -f docker-compose.prod.yml down
```
