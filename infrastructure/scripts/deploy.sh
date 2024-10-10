#!/bin/bash

# Supplement Reminder Application Deployment Script
# This script automates the deployment process for the supplement reminder application.
# Requirements addressed:
# - Deployment Automation (9. INFRASTRUCTURE/9.5 CI/CD PIPELINE)

# Exit immediately if a command exits with a non-zero status
set -e

# Enable debug mode
set -x

# Load environment variables from .env file if it exists
if [ -f .env ]; then
    source .env
fi

# Required environment variables
REQUIRED_VARS=(
    "AWS_ACCOUNT_ID"
    "AWS_REGION"
    "ECR_REPO_PREFIX"
    "ECS_CLUSTER_NAME"
    "ECS_SERVICE_FRONTEND"
    "ECS_SERVICE_BACKEND"
    "TASK_DEFINITION_FRONTEND"
    "TASK_DEFINITION_BACKEND"
    "FRONTEND_URL"
    "BACKEND_URL"
    "DB_MIGRATION_COMMAND"
)

# Function to check if required environment variables are set
check_env_vars() {
    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            echo "Error: Required environment variable $var is not set."
            exit 1
        fi
    done
}

# Function to check if required tools are installed
check_dependencies() {
    echo "Checking dependencies..."
    local deps=("docker" "docker-compose" "aws" "jq" "curl")
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            echo >&2 "$dep is required but not installed. Aborting."
            exit 1
        fi
    done
    echo "All dependencies are installed."
}

# Function to authenticate with AWS ECR
authenticate_ecr() {
    echo "Authenticating with AWS ECR..."
    aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
}

# Function to build and push Docker images
build_and_push_images() {
    echo "Building and pushing Docker images..."
    
    # Build images
    docker-compose -f infrastructure/docker-compose.yml build

    # Tag and push images
    local services=("frontend" "backend")
    for service in "${services[@]}"; do
        local image_name="${ECR_REPO_PREFIX}-${service}"
        local ecr_repo="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${image_name}"
        
        echo "Tagging ${image_name}..."
        docker tag "supplement-reminder-${service}:latest" "${ecr_repo}:latest"
        docker tag "supplement-reminder-${service}:latest" "${ecr_repo}:${GITHUB_SHA:-$(date +%Y%m%d%H%M%S)}"
        
        echo "Pushing ${image_name}..."
        docker push "${ecr_repo}:latest"
        docker push "${ecr_repo}:${GITHUB_SHA:-$(date +%Y%m%d%H%M%S)}"
    done
}

# Function to update ECS services
update_ecs_services() {
    echo "Updating ECS services..."
    
    local services=("${ECS_SERVICE_FRONTEND}" "${ECS_SERVICE_BACKEND}")
    for service in "${services[@]}"; do
        echo "Updating service: ${service}"
        aws ecs update-service --cluster "${ECS_CLUSTER_NAME}" --service "${service}" --force-new-deployment
    done

    echo "Waiting for services to stabilize..."
    aws ecs wait services-stable --cluster "${ECS_CLUSTER_NAME}" --services "${ECS_SERVICE_FRONTEND}" "${ECS_SERVICE_BACKEND}"
}

# Function to run database migrations
run_database_migrations() {
    echo "Running database migrations..."
    aws ecs run-task \
        --cluster "${ECS_CLUSTER_NAME}" \
        --task-definition "${TASK_DEFINITION_BACKEND}" \
        --overrides "{\"containerOverrides\": [{\"name\": \"backend\", \"command\": [${DB_MIGRATION_COMMAND}]}]}" \
        --started-by "deploy_script"
}

# Function to perform post-deployment checks
post_deployment_checks() {
    echo "Performing post-deployment checks..."
    
    local max_retries=5
    local wait_time=30
    local endpoints=("${FRONTEND_URL}" "${BACKEND_URL}/health")

    for endpoint in "${endpoints[@]}"; do
        local retries=0
        while [ $retries -lt $max_retries ]; do
            if curl -sSf "${endpoint}" &> /dev/null; then
                echo "${endpoint} is responding successfully."
                break
            else
                echo "${endpoint} is not responding. Retrying in ${wait_time} seconds..."
                sleep $wait_time
                retries=$((retries + 1))
            fi
        done

        if [ $retries -eq $max_retries ]; then
            echo "Error: ${endpoint} is not responding after ${max_retries} attempts."
            exit 1
        fi
    done
}

# Function to clean up old images
cleanup_old_images() {
    echo "Cleaning up old images..."
    local services=("frontend" "backend")
    for service in "${services[@]}"; do
        local image_name="${ECR_REPO_PREFIX}-${service}"
        local repo_name="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${image_name}"
        
        # Keep the latest 5 images, delete the rest
        aws ecr list-images --repository-name "${image_name}" --query 'imageIds[?type!=`IMAGE_TAG`].[imageDigest]' --output text | \
        while read -r imageDigest; do
            aws ecr batch-delete-image --repository-name "${image_name}" --image-ids imageDigest="${imageDigest}"
        done
    done
}

# Main deployment function
deploy_application() {
    echo "Starting deployment process..."

    check_env_vars
    check_dependencies
    authenticate_ecr
    build_and_push_images
    update_ecs_services
    run_database_migrations
    post_deployment_checks
    cleanup_old_images

    echo "Deployment completed successfully!"
}

# Trap errors
trap 'echo "An error occurred. Exiting..."; exit 1' ERR

# Run the main deployment function
deploy_application