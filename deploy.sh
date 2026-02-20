#!/bin/bash

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Variables
IMAGE_TAG="${1:-latest}"
REGISTRY="${2:-localhost:5000}"

echo -e "${BLUE}========================================"
echo "K3S Admin - Deploy Script"
echo -e "========================================${NC}"
echo -e "Image tag: ${YELLOW}${IMAGE_TAG}${NC}"
echo -e "Registry:  ${YELLOW}${REGISTRY}${NC}"
echo ""

# Check if scripts directory exists
if [ ! -d "scripts" ]; then
    echo -e "${RED}Error: scripts directory not found!${NC}"
    echo "Please run this script from the project root directory."
    exit 1
fi

# Step 1: Build Docker image
echo -e "${BLUE}[1/3]${NC} Building Docker image..."
if ! ./scripts/build.sh ${IMAGE_TAG} ${REGISTRY}; then
    echo -e "${RED}Build failed!${NC}"
    exit 1
fi

# Step 2: Push to registry
echo ""
echo -e "${BLUE}[2/3]${NC} Pushing to registry..."
if ! ./scripts/push.sh ${IMAGE_TAG} ${REGISTRY}; then
    echo -e "${RED}Push failed!${NC}"
    exit 1
fi

# Step 3: Deploy to K3S
echo ""
echo -e "${BLUE}[3/3]${NC} Deploying to K3S cluster..."
if ! ./scripts/deploy.sh; then
    echo -e "${RED}Deploy failed!${NC}"
    exit 1
fi

# Success message
echo ""
echo -e "${GREEN}========================================"
echo "✓ Deployment completed successfully!"
echo -e "========================================${NC}"
echo ""
echo -e "Your application is now running on K3S:"
echo -e "  • NodePort: ${GREEN}http://localhost:30080/k3s${NC}"
echo -e "  • Ingress:  ${GREEN}https://northr3nd.duckdns.org/k3s${NC}"
echo ""
echo -e "To check status: ${YELLOW}kubectl get pods -n k3s-admin${NC}"
echo -e "To view logs:    ${YELLOW}kubectl logs -n k3s-admin -l app=k3s-admin -f${NC}"
echo ""
