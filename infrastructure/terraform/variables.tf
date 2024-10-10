# Project Name
variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "supplement-reminder"
}

# Deployment Environment
variable "environment" {
  description = "Deployment environment (e.g., dev, staging, production)"
  type        = string
  default     = "production"
}

# AWS Region
variable "aws_region" {
  description = "AWS region for deploying resources"
  type        = string
  default     = "us-west-2"
}

# VPC Configuration
variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "List of CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "List of CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.3.0/24", "10.0.4.0/24"]
}

# Application Configuration
variable "app_image" {
  description = "Docker image for the application"
  type        = string
}

variable "app_count" {
  description = "Number of Docker containers to run"
  type        = number
  default     = 2
}

variable "app_port" {
  description = "Port exposed by the Docker image"
  type        = number
  default     = 3000
}

# Fargate Configuration
variable "fargate_cpu" {
  description = "Fargate instance CPU units (256 = 0.25 vCPU)"
  type        = number
  default     = 256
}

variable "fargate_memory" {
  description = "Fargate instance memory in MiB"
  type        = number
  default     = 512
}

# Database Configuration
variable "db_name" {
  description = "Name of the database"
  type        = string
  default     = "supplement_reminder_db"
}

variable "db_username" {
  description = "Username for the database"
  type        = string
}

variable "db_password" {
  description = "Password for the database"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

# Redis Configuration
variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t3.micro"
}

variable "redis_num_cache_nodes" {
  description = "Number of cache nodes in the ElastiCache cluster"
  type        = number
  default     = 1
}

# Domain Configuration
variable "domain_name" {
  description = "Domain name for the website"
  type        = string
}

# Tags
variable "tags" {
  description = "A map of tags to add to all resources"
  type        = map(string)
  default     = {}
}

# SSL Certificate
variable "ssl_certificate_arn" {
  description = "ARN of the SSL certificate for HTTPS"
  type        = string
}

# CloudWatch Logs Retention
variable "cloudwatch_logs_retention_days" {
  description = "Number of days to retain CloudWatch logs"
  type        = number
  default     = 30
}

# Auto Scaling Configuration
variable "min_capacity" {
  description = "Minimum number of tasks for auto scaling"
  type        = number
  default     = 2
}

variable "max_capacity" {
  description = "Maximum number of tasks for auto scaling"
  type        = number
  default     = 10
}

# Backup Configuration
variable "backup_retention_period" {
  description = "Number of days to retain backups"
  type        = number
  default     = 7
}

# Monitoring and Alerting
variable "enable_enhanced_monitoring" {
  description = "Enable enhanced monitoring for RDS"
  type        = bool
  default     = true
}

variable "alert_email" {
  description = "Email address for receiving alerts"
  type        = string
}

# Security
variable "allowed_cidr_blocks" {
  description = "List of CIDR blocks allowed to access the resources"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

# Cost Management
variable "instance_type" {
  description = "EC2 instance type for the application servers"
  type        = string
  default     = "t3.micro"
}

variable "enable_auto_scaling" {
  description = "Enable auto scaling for EC2 instances"
  type        = bool
  default     = true
}