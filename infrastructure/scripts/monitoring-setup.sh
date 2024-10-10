#!/bin/bash

# Monitoring Setup Script for Supplement Reminder Application
# This script sets up and configures monitoring tools for the application

# Exit immediately if a command exits with a non-zero status
set -e

# Enable debug mode
set -x

# Load environment variables
if [[ -f ../../src/backend/.env ]]; then
    source ../../src/backend/.env
else
    echo "Error: .env file not found in ../../src/backend/.env"
    exit 1
fi

# Global variables
PROJECT_NAME="supplement-reminder"
ENVIRONMENT="${ENVIRONMENT:-production}"
AWS_REGION="${AWS_REGION:-us-west-2}"
ECS_CLUSTER_NAME="${ECS_CLUSTER_NAME:-supplement-reminder-cluster}"
RDS_INSTANCE_IDENTIFIER="${RDS_INSTANCE_IDENTIFIER:-supplement-reminder-db}"
ALERT_EMAIL="${ALERT_EMAIL:-alerts@example.com}"

# Function to load environment variables
load_env_vars() {
    echo "Loading environment variables..."
    # Export necessary variables for use in the script
    export AWS_REGION
    export ECS_CLUSTER_NAME
    export RDS_INSTANCE_IDENTIFIER
    export ALERT_EMAIL
}

# Function to create CloudWatch dashboard
create_cloudwatch_dashboard() {
    echo "Creating CloudWatch dashboard..."
    DASHBOARD_NAME="${PROJECT_NAME}-${ENVIRONMENT}-dashboard"
    DASHBOARD_BODY=$(cat <<EOF
{
    "widgets": [
        {
            "type": "metric",
            "x": 0,
            "y": 0,
            "width": 12,
            "height": 6,
            "properties": {
                "metrics": [
                    [ "AWS/ECS", "CPUUtilization", "ClusterName", "${ECS_CLUSTER_NAME}" ]
                ],
                "period": 300,
                "stat": "Average",
                "region": "${AWS_REGION}",
                "title": "ECS Cluster CPU Utilization"
            }
        },
        {
            "type": "metric",
            "x": 12,
            "y": 0,
            "width": 12,
            "height": 6,
            "properties": {
                "metrics": [
                    [ "AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", "${RDS_INSTANCE_IDENTIFIER}" ]
                ],
                "period": 300,
                "stat": "Average",
                "region": "${AWS_REGION}",
                "title": "RDS CPU Utilization"
            }
        }
    ]
}
EOF
)
    aws cloudwatch put-dashboard --dashboard-name "$DASHBOARD_NAME" --dashboard-body "$DASHBOARD_BODY"
    echo "CloudWatch dashboard created: $DASHBOARD_NAME"
}

# Function to set up ECS monitoring
setup_ecs_monitoring() {
    echo "Setting up ECS monitoring..."
    # Create CPU utilization alarm for ECS cluster
    aws cloudwatch put-metric-alarm \
        --alarm-name "${PROJECT_NAME}-${ENVIRONMENT}-ecs-cpu-alarm" \
        --alarm-description "Alarm when CPU exceeds 70% for 5 minutes" \
        --metric-name CPUUtilization \
        --namespace AWS/ECS \
        --statistic Average \
        --period 300 \
        --threshold 70 \
        --comparison-operator GreaterThanThreshold \
        --dimensions Name=ClusterName,Value=${ECS_CLUSTER_NAME} \
        --evaluation-periods 1 \
        --alarm-actions ${SNS_TOPIC_ARN}

    # Create memory utilization alarm for ECS cluster
    aws cloudwatch put-metric-alarm \
        --alarm-name "${PROJECT_NAME}-${ENVIRONMENT}-ecs-memory-alarm" \
        --alarm-description "Alarm when memory exceeds 80% for 5 minutes" \
        --metric-name MemoryUtilization \
        --namespace AWS/ECS \
        --statistic Average \
        --period 300 \
        --threshold 80 \
        --comparison-operator GreaterThanThreshold \
        --dimensions Name=ClusterName,Value=${ECS_CLUSTER_NAME} \
        --evaluation-periods 1 \
        --alarm-actions ${SNS_TOPIC_ARN}
}

# Function to set up RDS monitoring
setup_rds_monitoring() {
    echo "Setting up RDS monitoring..."
    # Create CPU utilization alarm for RDS instance
    aws cloudwatch put-metric-alarm \
        --alarm-name "${PROJECT_NAME}-${ENVIRONMENT}-rds-cpu-alarm" \
        --alarm-description "Alarm when RDS CPU exceeds 80% for 5 minutes" \
        --metric-name CPUUtilization \
        --namespace AWS/RDS \
        --statistic Average \
        --period 300 \
        --threshold 80 \
        --comparison-operator GreaterThanThreshold \
        --dimensions Name=DBInstanceIdentifier,Value=${RDS_INSTANCE_IDENTIFIER} \
        --evaluation-periods 1 \
        --alarm-actions ${SNS_TOPIC_ARN}

    # Create storage space alarm for RDS instance
    aws cloudwatch put-metric-alarm \
        --alarm-name "${PROJECT_NAME}-${ENVIRONMENT}-rds-storage-alarm" \
        --alarm-description "Alarm when RDS free storage space is below 20% for 5 minutes" \
        --metric-name FreeStorageSpace \
        --namespace AWS/RDS \
        --statistic Average \
        --period 300 \
        --threshold 20 \
        --comparison-operator LessThanThreshold \
        --dimensions Name=DBInstanceIdentifier,Value=${RDS_INSTANCE_IDENTIFIER} \
        --evaluation-periods 1 \
        --alarm-actions ${SNS_TOPIC_ARN}
}

# Function to set up application monitoring
setup_application_monitoring() {
    echo "Setting up application monitoring..."
    # Create a custom metric for SMS delivery success rate
    aws cloudwatch put-metric-data \
        --metric-name SMSDeliverySuccessRate \
        --namespace "${PROJECT_NAME}/${ENVIRONMENT}" \
        --unit Percent \
        --value 100 \
        --dimensions Service=SMSDelivery

    # Create an alarm for low SMS delivery success rate
    aws cloudwatch put-metric-alarm \
        --alarm-name "${PROJECT_NAME}-${ENVIRONMENT}-sms-delivery-alarm" \
        --alarm-description "Alarm when SMS delivery success rate falls below 95% for 5 minutes" \
        --metric-name SMSDeliverySuccessRate \
        --namespace "${PROJECT_NAME}/${ENVIRONMENT}" \
        --statistic Average \
        --period 300 \
        --threshold 95 \
        --comparison-operator LessThanThreshold \
        --dimensions Name=Service,Value=SMSDelivery \
        --evaluation-periods 1 \
        --alarm-actions ${SNS_TOPIC_ARN}
}

# Function to create SNS topic for alerts
create_sns_topic() {
    echo "Creating SNS topic for alerts..."
    SNS_TOPIC_ARN=$(aws sns create-topic --name "${PROJECT_NAME}-${ENVIRONMENT}-alerts" --output json | jq -r '.TopicArn')
    if [[ -z "$SNS_TOPIC_ARN" ]]; then
        echo "Error: Failed to create SNS topic"
        exit 1
    fi
    aws sns subscribe \
        --topic-arn ${SNS_TOPIC_ARN} \
        --protocol email \
        --notification-endpoint ${ALERT_EMAIL}
    echo "SNS topic created: ${SNS_TOPIC_ARN}"
    echo "Subscription pending for email: ${ALERT_EMAIL}"
}

# Function to set up log monitoring
setup_log_monitoring() {
    echo "Setting up log monitoring..."
    # Create a log group for application logs
    aws logs create-log-group --log-group-name "/aws/ecs/${PROJECT_NAME}-${ENVIRONMENT}"

    # Create a metric filter for error logs
    aws logs put-metric-filter \
        --log-group-name "/aws/ecs/${PROJECT_NAME}-${ENVIRONMENT}" \
        --filter-name "${PROJECT_NAME}-${ENVIRONMENT}-errors" \
        --filter-pattern "ERROR" \
        --metric-transformations \
            metricName=ErrorCount,metricNamespace="${PROJECT_NAME}/${ENVIRONMENT}",metricValue=1

    # Create an alarm based on error log metrics
    aws cloudwatch put-metric-alarm \
        --alarm-name "${PROJECT_NAME}-${ENVIRONMENT}-error-logs-alarm" \
        --alarm-description "Alarm when error logs exceed 10 in 5 minutes" \
        --metric-name ErrorCount \
        --namespace "${PROJECT_NAME}/${ENVIRONMENT}" \
        --statistic Sum \
        --period 300 \
        --threshold 10 \
        --comparison-operator GreaterThanThreshold \
        --evaluation-periods 1 \
        --alarm-actions ${SNS_TOPIC_ARN}
}

# Function to validate AWS CLI installation
validate_aws_cli() {
    if ! command -v aws &> /dev/null; then
        echo "Error: AWS CLI is not installed or not in PATH"
        exit 1
    fi
}

# Function to validate AWS credentials
validate_aws_credentials() {
    if ! aws sts get-caller-identity &> /dev/null; then
        echo "Error: Invalid AWS credentials or permissions"
        exit 1
    fi
}

# Main function
main() {
    echo "Starting monitoring setup for ${PROJECT_NAME} in ${ENVIRONMENT} environment..."
    validate_aws_cli
    validate_aws_credentials
    load_env_vars
    create_sns_topic
    create_cloudwatch_dashboard
    setup_ecs_monitoring
    setup_rds_monitoring
    setup_application_monitoring
    setup_log_monitoring
    echo "Monitoring setup completed successfully."
}

# Run the main function
main

# Error handling
if [ $? -ne 0 ]; then
    echo "An error occurred during the monitoring setup. Please check the logs and try again."
    exit 1
fi

# Disable debug mode
set +x