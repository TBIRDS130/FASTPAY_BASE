#!/bin/bash

# FastPay Dashboard Setup Script
# This script creates an admin user and syncs all devices from Firebase

# Default values
EMAIL="admin@fastpay.com"
PASSWORD="adminpassword"
FULL_NAME="System Admin"

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --email) EMAIL="$2"; shift ;;
        --password) PASSWORD="$2"; shift ;;
        --name) FULL_NAME="$2"; shift ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

echo "Starting FastPay Dashboard Setup..."
echo "Admin Email: $EMAIL"

# Check if docker-compose or docker compose is available
if command -v docker-compose &> /dev/null; then
    DOCKER_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_CMD="docker compose"
else
    echo "Error: Docker Compose not found. Please install docker-compose or docker compose v2."
    exit 1
fi

# Run the management command inside the web container
$DOCKER_CMD exec -T web python manage.py setup_dashboard --email "$EMAIL" --password "$PASSWORD" --full-name "$FULL_NAME"

if [ $? -eq 0 ]; then
    echo ""
    echo "===================================================="
    echo "✅ Setup successful!"
    echo "You can now log in to the dashboard with:"
    echo "Email: $EMAIL"
    echo "Password: $PASSWORD"
    echo "===================================================="
else
    echo "❌ Setup failed. Please check the errors above."
    exit 1
fi
