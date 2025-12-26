#!/bin/bash
#
# Oracle Cloud ARM Instance Retry Script
# Keeps trying to create an ARM A1 instance until capacity is available
#
# Usage: ./oci-instance-retry.sh
#
# Prerequisites:
#   1. OCI CLI installed: brew install oci-cli (macOS) or pip install oci-cli
#   2. Copy ~/.oci/config and ~/.oci/oci_api_key.pem to this machine
#   3. Make executable: chmod +x oci-instance-retry.sh
#

set -euo pipefail

# ============== CONFIGURATION ==============
# OCI Settings
TENANCY_OCID="ocid1.tenancy.oc1..aaaaaaaaylffmli4l3svnenirzk2gtlhj5l7flvobxxvniafezugydykkv7q"
SUBNET_OCID="ocid1.subnet.oc1.iad.aaaaaaaau55d2f23jmunkhqx54njgesbkvy2voqhpgiez5l4ibfsvr52jpfa"
IMAGE_OCID="ocid1.image.oc1.iad.aaaaaaaaawgpyvs3zh7tu5343gpj45yqcj6hosrmrgvo5xovc7dvjwgi4vaq"
INSTANCE_NAME="fast-track-server"
SHAPE="VM.Standard.A1.Flex"

# Instance size (free tier allows up to 4 OCPUs, 24GB total)
OCPUS=4
MEMORY_GB=24

# Availability domains to try (cycles through them)
ADS=(
  "OaOm:US-ASHBURN-AD-1"
  "OaOm:US-ASHBURN-AD-2"
  "OaOm:US-ASHBURN-AD-3"
)

# Retry settings
RETRY_INTERVAL_SECONDS=300  # 5 minutes between attempts
MAX_ATTEMPTS=0              # 0 = unlimited

# SSH public key (paste your public key here)
SSH_PUBLIC_KEY="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC+..."  # Will be loaded from file if exists

# Notification webhook (optional - set to your Discord/Slack webhook URL)
WEBHOOK_URL=""

# Log file
LOG_FILE="./oci-retry.log"

# ============== END CONFIGURATION ==============

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
  local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
  echo -e "$msg" | tee -a "$LOG_FILE"
}

send_notification() {
  local message="$1"
  if [[ -n "$WEBHOOK_URL" ]]; then
    curl -s -X POST "$WEBHOOK_URL" \
      -H "Content-Type: application/json" \
      -d "{\"content\": \"$message\"}" > /dev/null 2>&1 || true
  fi
  # Also try to send macOS notification if available
  if command -v osascript &> /dev/null; then
    osascript -e "display notification \"$message\" with title \"OCI Instance\"" 2>/dev/null || true
  fi
}

check_oci_cli() {
  if ! command -v oci &> /dev/null; then
    log "${RED}ERROR: OCI CLI not installed${NC}"
    log "Install with: brew install oci-cli (macOS) or pip install oci-cli"
    exit 1
  fi
}

load_ssh_key() {
  # Try to load SSH key from common locations
  for keyfile in ~/.ssh/id_rsa.pub ~/.ssh/id_ed25519.pub; do
    if [[ -f "$keyfile" ]]; then
      SSH_PUBLIC_KEY=$(cat "$keyfile")
      log "Loaded SSH key from $keyfile"
      return
    fi
  done

  if [[ "$SSH_PUBLIC_KEY" == "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC+..." ]]; then
    log "${RED}ERROR: No SSH public key found. Edit the script to add your key.${NC}"
    exit 1
  fi
}

try_create_instance() {
  local ad="$1"
  log "Attempting to create instance in ${YELLOW}$ad${NC}..."

  local result
  result=$(oci compute instance launch \
    --compartment-id "$TENANCY_OCID" \
    --availability-domain "$ad" \
    --display-name "$INSTANCE_NAME" \
    --shape "$SHAPE" \
    --shape-config "{\"ocpus\": $OCPUS, \"memoryInGBs\": $MEMORY_GB}" \
    --image-id "$IMAGE_OCID" \
    --subnet-id "$SUBNET_OCID" \
    --assign-public-ip true \
    --metadata "{\"ssh_authorized_keys\": \"$SSH_PUBLIC_KEY\"}" \
    2>&1) || true

  if echo "$result" | grep -q '"lifecycle-state"'; then
    # Success! Extract instance ID and wait for it to be running
    local instance_id
    instance_id=$(echo "$result" | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)
    log "${GREEN}SUCCESS! Instance created: $instance_id${NC}"
    log "Waiting for instance to be RUNNING..."

    # Wait for running state
    oci compute instance get --instance-id "$instance_id" --wait-for-state RUNNING --wait-interval-seconds 10 2>&1 | tee -a "$LOG_FILE"

    # Get public IP
    sleep 10  # Give it a moment to assign IP
    local public_ip
    public_ip=$(oci compute instance list-vnics --instance-id "$instance_id" --query 'data[0]."public-ip"' --raw-output 2>/dev/null || echo "pending")

    log "${GREEN}============================================${NC}"
    log "${GREEN}INSTANCE READY!${NC}"
    log "${GREEN}Instance ID: $instance_id${NC}"
    log "${GREEN}Public IP: $public_ip${NC}"
    log "${GREEN}SSH: ssh ubuntu@$public_ip${NC}"
    log "${GREEN}============================================${NC}"

    send_notification "OCI ARM instance created! IP: $public_ip - SSH: ssh ubuntu@$public_ip"

    return 0
  elif echo "$result" | grep -q "Out of host capacity"; then
    log "${YELLOW}Out of capacity in $ad${NC}"
    return 1
  elif echo "$result" | grep -q "LimitExceeded"; then
    log "${RED}Limit exceeded - you may already have an instance or hit free tier limits${NC}"
    exit 1
  else
    log "${RED}Unexpected error: $result${NC}"
    return 1
  fi
}

main() {
  log "============================================"
  log "OCI ARM Instance Retry Script"
  log "Instance: $INSTANCE_NAME ($OCPUS OCPUs, ${MEMORY_GB}GB RAM)"
  log "Retry interval: ${RETRY_INTERVAL_SECONDS}s"
  log "============================================"

  check_oci_cli
  load_ssh_key

  local attempt=0
  local ad_index=0

  while true; do
    attempt=$((attempt + 1))

    if [[ $MAX_ATTEMPTS -gt 0 && $attempt -gt $MAX_ATTEMPTS ]]; then
      log "${RED}Max attempts ($MAX_ATTEMPTS) reached. Giving up.${NC}"
      exit 1
    fi

    # Cycle through availability domains
    local ad="${ADS[$ad_index]}"
    ad_index=$(( (ad_index + 1) % ${#ADS[@]} ))

    log "Attempt #$attempt"

    if try_create_instance "$ad"; then
      log "${GREEN}Script complete!${NC}"
      exit 0
    fi

    log "Waiting ${RETRY_INTERVAL_SECONDS}s before next attempt..."
    sleep "$RETRY_INTERVAL_SECONDS"
  done
}

# Handle Ctrl+C gracefully
trap 'log "Interrupted. Exiting..."; exit 130' INT

main "$@"
