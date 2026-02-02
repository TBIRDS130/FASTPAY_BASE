#!/bin/bash
# Script to create test data for FastPay Backend
# Usage: ./create_test_data.sh [--clear] [--count N]

cd "$(dirname "$0")"

# Check if Docker is available
if command -v docker &> /dev/null; then
    # Use Docker
    if docker ps | grep -q fastpay_be_web; then
        echo "Using Docker container: fastpay_be_web_1"
        docker exec fastpay_be_web_1 python manage.py create_test_data "$@"
    elif docker-compose ps | grep -q web; then
        echo "Using Docker Compose"
        docker-compose exec web python manage.py create_test_data "$@"
    else
        echo "Docker container not found. Trying direct execution..."
        python3 manage.py create_test_data "$@"
    fi
else
    # Use direct Python
    echo "Using direct Python execution"
    python3 manage.py create_test_data "$@"
fi
