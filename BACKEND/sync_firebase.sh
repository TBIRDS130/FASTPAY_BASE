#!/bin/bash

# This script runs the Firebase sync command to sync messages from Firebase to Django
# and clean Firebase to keep only the latest 100 messages per device.
# It detects if Docker Compose is running and executes the command inside the 'web' service container,
# otherwise, it attempts to run it directly using python3.

# Default values
DEVICE_ID=""
KEEP_LATEST=100
DRY_RUN=false
VERBOSITY=1 # 0=minimal, 1=normal, 2=verbose, 3=very verbose

# Parse arguments
for arg in "$@"; do
  case $arg in
    --device-id=*)
      DEVICE_ID="${arg#*=}"
      shift
      ;;
    --keep-latest=*)
      KEEP_LATEST="${arg#*=}"
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

echo "Starting Firebase sync..."

# Check if Docker Compose is running
if docker-compose ps --services | grep -q web; then
  echo "Docker Compose 'web' service is running. Executing command inside container..."
  COMMAND="docker-compose exec web python manage.py sync_firebase_messages"
elif docker ps -a --format '{{.Names}}' | grep -q "fastpay_be_web_1"; then
  echo "Docker container 'fastpay_be_web_1' is running. Executing command inside container..."
  COMMAND="docker exec fastpay_be_web_1 python manage.py sync_firebase_messages"
else
  echo "Docker Compose 'web' service or container 'fastpay_be_web_1' not found. Attempting direct execution..."
  COMMAND="python3 manage.py sync_firebase_messages"
fi

# Add options to the command
if [ -n "$DEVICE_ID" ]; then
  COMMAND+=" --device-id $DEVICE_ID"
fi
COMMAND+=" --keep-latest $KEEP_LATEST"
if [ "$DRY_RUN" = true ]; then
  COMMAND+=" --dry-run"
fi
COMMAND+=" --verbosity $VERBOSITY"

# Execute the command
echo "Executing: $COMMAND"
eval $COMMAND

if [ $? -eq 0 ]; then
  echo "Firebase sync completed successfully."
else
  echo "Error during Firebase sync. Please check the logs above."
  exit 1
fi
