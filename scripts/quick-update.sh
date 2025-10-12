#!/bin/bash
# Quick Update Script - Just pull new images and restart
# Use when you only updated code without changing config

set -e

if [ ! -f .env.production.local.local ]; then
    echo "ERROR: .env.production.local not found!"
    exit 1
fi

export $(cat .env.production.local.local | grep -v '^#' | xargs)
IMAGE_TAG=${IMAGE_TAG:-latest}

echo "Pulling latest images..."
docker pull $DOCKER_USERNAME/$BACKEND_IMAGE_NAME:$IMAGE_TAG
docker pull $DOCKER_USERNAME/$FRONTEND_IMAGE_NAME:$IMAGE_TAG

echo "Restarting containers..."
docker-compose -f docker-compose.prod.yml --env-file .env.production.local.local up -d --force-recreate

echo "Done! Checking status..."
sleep 5
docker-compose -f docker-compose.prod.yml ps
