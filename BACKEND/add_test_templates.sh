#!/bin/bash
# Script to add 4 test bank card templates

cd /opt/FASTPAY/BACKEND

echo "========================================="
echo "Adding 4 Test Bank Card Templates"
echo "========================================="
echo ""

docker-compose exec -T web python manage.py add_test_templates

echo ""
echo "========================================="
echo "Done!"
echo "========================================="
