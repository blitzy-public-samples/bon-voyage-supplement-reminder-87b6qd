# Main Terraform configuration file for the supplement reminder website infrastructure
# Requirements addressed:
# - Cloud Infrastructure Setup (9. INFRASTRUCTURE/9.2 CLOUD SERVICES)
#   Configure and provision AWS services for hosting the supplement reminder website

# Terraform configuration
terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

# Provider configuration
provider "aws" {
  region = var.aws_region
}

# VPC Module
module "vpc" {
  source               = "./modules/vpc"
  project_name         = var.project_name
  environment          = var.environment
  vpc_cidr             = var.vpc_cidr
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
}

# ECS Module
module "ecs" {
  source             = "./modules/ecs"
  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  vpc_cidr           = var.vpc_cidr
  public_subnet_ids  = module.vpc.public_subnet_ids
  private_subnet_ids = module.vpc.private_subnet_ids
  app_image          = var.app_image
  app_count          = var.app_count
  app_port           = var.app_port
  fargate_cpu        = var.fargate_cpu
  fargate_memory     = var.fargate_memory
}

# RDS Module
module "rds" {
  source             = "./modules/rds"
  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  vpc_cidr           = var.vpc_cidr
  private_subnet_ids = module.vpc.private_subnet_ids
  db_name            = var.db_name
  db_username        = var.db_username
  db_password        = var.db_password
  db_instance_class  = var.db_instance_class
}

# ElastiCache Module
module "elasticache" {
  source               = "./modules/elasticache"
  project_name         = var.project_name
  environment          = var.environment
  vpc_id               = module.vpc.vpc_id
  vpc_cidr             = var.vpc_cidr
  private_subnet_ids   = module.vpc.private_subnet_ids
  redis_node_type      = var.redis_node_type
  redis_num_cache_nodes = var.redis_num_cache_nodes
}

# S3 Module
module "s3" {
  source      = "./modules/s3"
  project_name = var.project_name
  environment = var.environment
}

# CloudFront Module
module "cloudfront" {
  source       = "./modules/cloudfront"
  project_name = var.project_name
  environment  = var.environment
  s3_bucket_id = module.s3.bucket_id
  domain_name  = var.domain_name
}

# Route53 Module
module "route53" {
  source                             = "./modules/route53"
  domain_name                        = var.domain_name
  cloudfront_distribution_domain_name = module.cloudfront.distribution_domain_name
}

# Output values
output "vpc_id" {
  value       = module.vpc.vpc_id
  description = "ID of the created VPC"
}

output "public_subnet_ids" {
  value       = module.vpc.public_subnet_ids
  description = "List of public subnet IDs"
}

output "private_subnet_ids" {
  value       = module.vpc.private_subnet_ids
  description = "List of private subnet IDs"
}

output "ecs_cluster_name" {
  value       = module.ecs.ecs_cluster_name
  description = "Name of the ECS cluster"
}

output "ecs_service_name" {
  value       = module.ecs.ecs_service_name
  description = "Name of the ECS service"
}

output "alb_hostname" {
  value       = module.ecs.alb_hostname
  description = "Hostname of the Application Load Balancer"
}

output "rds_endpoint" {
  value       = module.rds.db_instance_endpoint
  description = "Endpoint of the RDS instance"
}

output "redis_cluster_address" {
  value       = module.elasticache.redis_cluster_address
  description = "Address of the ElastiCache Redis cluster"
}

output "s3_bucket_id" {
  value       = module.s3.bucket_id
  description = "ID of the created S3 bucket"
}

output "cloudfront_distribution_id" {
  value       = module.cloudfront.distribution_id
  description = "ID of the CloudFront distribution"
}

output "cloudfront_distribution_domain_name" {
  value       = module.cloudfront.distribution_domain_name
  description = "Domain name of the CloudFront distribution"
}

output "route53_zone_id" {
  value       = module.route53.route53_zone_id
  description = "ID of the Route53 hosted zone"
}