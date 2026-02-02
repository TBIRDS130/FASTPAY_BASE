#!/bin/bash

# FastPay Backend Initial Setup Script
# Run this script once on a new VPS

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "========================================="
echo "FastPay Backend VPS Setup"
echo "========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Update system
echo -e "${GREEN}Updating system packages...${NC}"
sudo apt-get update
sudo apt-get upgrade -y

# Install required packages
echo -e "${GREEN}Installing required packages...${NC}"
sudo apt-get install -y \
    curl \
    wget \
    git \
    python3 \
    python3-pip \
    python3-venv \
    postgresql \
    postgresql-contrib \
    nginx \
    certbot \
    python3-certbot-nginx \
    ufw \
    fail2ban \
    docker.io \
    docker-compose \
    || echo -e "${YELLOW}Some packages may have failed to install${NC}"

# Add user to docker group (if not root)
if [ "$USER" != "root" ]; then
    echo -e "${GREEN}Adding $USER to docker group...${NC}"
    sudo usermod -aG docker $USER
    echo -e "${YELLOW}Note: You may need to log out and log back in for docker group to take effect${NC}"
fi

# Start and enable Docker
echo -e "${GREEN}Starting Docker service...${NC}"
sudo systemctl start docker
sudo systemctl enable docker

# Configure firewall
echo -e "${GREEN}Configuring firewall...${NC}"
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8000/tcp

# Create directories
echo -e "${GREEN}Creating necessary directories...${NC}"
mkdir -p nginx/conf.d
mkdir -p nginx/ssl
mkdir -p logs

# Create .env.production from template
if [ ! -f ".env.production" ]; then
    echo -e "${GREEN}Creating .env.production from template...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env.production
        # Generate a secure SECRET_KEY
        SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))")
        sed -i "s/your-secret-key-change-this-in-production/$SECRET_KEY/" .env.production
        echo -e "${YELLOW}Generated SECRET_KEY in .env.production${NC}"
        echo -e "${RED}Please edit .env.production with your production settings!${NC}"
    else
        echo -e "${YELLOW}Warning: .env.example not found${NC}"
    fi
fi

# Make scripts executable
echo -e "${GREEN}Making scripts executable...${NC}"
chmod +x deploy.sh
chmod +x setup.sh
chmod +x restart.sh

echo ""
echo "========================================="
echo "Setup completed!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Edit .env.production with your settings"
echo "2. Configure database settings in .env.production"
echo "3. Run ./deploy.sh to deploy the application"
echo ""
echo "For SSL certificate:"
echo "  sudo certbot --nginx -d yourdomain.com"
echo ""
