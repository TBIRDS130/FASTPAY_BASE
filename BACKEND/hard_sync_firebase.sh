#!/bin/bash

# This script runs the hard sync command to sync complete Firebase data device-wise
# and update Django with all device data (messages, notifications, contacts, device info).
# It detects if Docker Compose is running and executes the command inside the 'web' service container,
# otherwise, it attempts to run it directly using python3.

# Default values
DEVICE_ID=""
UPDATE_EXISTING=true
DRY_RUN=false
VERBOSITY=1 # 0=minimal, 1=normal, 2=verbose, 3=very verbose

# Parse arguments
for arg in "$@"; do
  case $arg in
    --device-id=*)
      DEVICE_ID="${arg#*=}"
      shift
      ;;
    --no-update-existing)
      UPDATE_EXISTING=false
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    -v|--verbosity=*)
      VERBOSITY="${arg#*=}"
      shift
      ;;
    *)
      # Unknown option, pass it through
      ;;
  esac
done

echo "Starting hard sync from Firebase..."

# Check if Docker Compose is running
if docker-compose ps --services | grep -q web; then
  echo "Docker Compose 'web' service is running. Executing command inside container..."
  COMMAND="docker-compose exec web python manage.py hard_sync_firebase"
elif docker ps -a --format '{{.Names}}' | grep -q "fastpay_be_web_1"; then
  echo "Docker container 'fastpay_be_web_1' is running. Executing command inside container..."
  COMMAND="docker exec fastpay_be_web_1 python manage.py hard_sync_firebase"
else
  echo "Docker Compose 'web' service or container 'fastpay_be_web_1' not found. Attempting direct execution..."
  COMMAND="python3 manage.py hard_sync_firebase"
fi

# Add options to the command
if [ -n "$DEVICE_ID" ]; then
  COMMAND+=" --device-id $DEVICE_ID"
fi
if [ "$UPDATE_EXISTING" = false ]; then
  COMMAND+=" --no-update-existing"
fi
if [ "$DRY_RUN" = true ]; then
  COMMAND+=" --dry-run"
fi
COMMAND+=" --verbosity $VERBOSITY"

# Execute the command
echo "Executing: $COMMAND"
eval $COMMAND

if [ $? -eq 0 ]; then
  echo "Hard sync completed successfully."
else
  echo "Error during hard sync. Please check the logs above."
  exit 1
fi
