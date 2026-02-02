#!/bin/bash

# FastPay Backend Restart Script
# Quick restart of all services

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# Use docker compose (v2) or docker-compose (v1)
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

echo "Restarting FastPay Backend services..."

$DOCKER_COMPOSE restart

echo "Services restarted successfully!"
echo ""

# Simple health check via nginx
HEALTH_URL="${HEALTH_URL:-http://localhost/health/}"
echo "Health check: $HEALTH_URL"
if command -v curl >/dev/null 2>&1; then
    if curl -fsS --max-time 5 "$HEALTH_URL" >/dev/null; then
        echo "Health check OK"
    else
        echo "Health check FAILED"
    fi
else
    echo "Health check skipped (curl not installed)"
fi

echo ""
echo "Tailing logs (Ctrl+C to exit)..."
$DOCKER_COMPOSE logs -f --tail=200
