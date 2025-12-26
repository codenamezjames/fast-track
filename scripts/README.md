# OCI Instance Retry Script

Automatically retries creating an Oracle Cloud ARM A1 instance until capacity becomes available.

## Setup on Media Server

### 1. Install OCI CLI

```bash
# Ubuntu/Debian
pip3 install oci-cli

# Or download installer
bash -c "$(curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh)"
```

### 2. Copy OCI credentials

From your Mac, copy these files to the media server:

```bash
# On your Mac
scp -r ~/.oci user@media-server:~/
```

This copies:
- `~/.oci/config` - OCI configuration
- `~/.oci/oci_api_key.pem` - Private key

### 3. Copy SSH public key

The script will auto-detect keys in `~/.ssh/id_rsa.pub` or `~/.ssh/id_ed25519.pub`.

Or copy from Mac:
```bash
scp ~/.ssh/id_rsa.pub user@media-server:~/.ssh/
```

### 4. Copy and run the script

```bash
# Copy script
scp scripts/oci-instance-retry.sh user@media-server:~/

# SSH to media server
ssh user@media-server

# Run in background with nohup
chmod +x oci-instance-retry.sh
nohup ./oci-instance-retry.sh > oci-retry.log 2>&1 &

# Or run in screen/tmux
screen -S oci
./oci-instance-retry.sh
# Ctrl+A, D to detach
```

### 5. Monitor progress

```bash
# Watch the log
tail -f oci-retry.log

# Check if running
ps aux | grep oci-instance-retry
```

## Configuration

Edit the script to customize:

| Variable | Default | Description |
|----------|---------|-------------|
| `OCPUS` | 4 | Number of CPUs (max 4 for free tier) |
| `MEMORY_GB` | 24 | RAM in GB (max 24 for free tier) |
| `RETRY_INTERVAL_SECONDS` | 300 | Time between attempts (5 min) |
| `WEBHOOK_URL` | "" | Discord/Slack webhook for notifications |

## Notifications

Set `WEBHOOK_URL` to get notified when the instance is created:

```bash
# Discord
WEBHOOK_URL="https://discord.com/api/webhooks/xxx/yyy"

# Slack
WEBHOOK_URL="https://hooks.slack.com/services/xxx/yyy/zzz"
```

## After Success

Once the instance is created, the script will output:
- Instance ID
- Public IP address
- SSH command

Then deploy Fast Track:

```bash
ssh ubuntu@<PUBLIC_IP>

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Clone and deploy
git clone https://github.com/yourusername/fast-track.git
cd fast-track
cp .env.example .env
# Edit .env with production secrets
docker compose up -d
```
