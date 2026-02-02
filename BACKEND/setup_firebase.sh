#!/bin/bash
# Setup and Test Firebase Connection

cd /opt/FASTPAY/BACKEND

echo "Installing Firebase Admin SDK..."
docker-compose exec -T web pip install firebase-admin

echo "Restarting service..."
docker-compose restart web
sleep 5

echo "Testing Firebase connection..."
docker-compose exec -T web python -c "
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fastpay_be.settings')
import django
django.setup()
from api.utils import initialize_firebase
try:
    initialize_firebase()
    print('SUCCESS: Firebase connected!')
except Exception as e:
    print(f'ERROR: {e}')
"
