# Terraform outputs configuration file for the supplement reminder website infrastructure
# This file defines output values for important infrastructure components

# Output: VPC ID
output "vpc_id" {
  value       = module.vpc.vpc_id
  description = "ID of the created VPC"
}

# Output: Public Subnet IDs
output "public_subnet_ids" {
  value       = module.vpc.public_subnet_ids
  description = "List of public subnet IDs"
}

# Output: Private Subnet IDs
output "private_subnet_ids" {
  value       = module.vpc.private_subnet_ids
  description = "List of private subnet IDs"
}

# Output: ECS Cluster Name
output "ecs_cluster_name" {
  value       = module.ecs.ecs_cluster_name
  description = "Name of the ECS cluster"
}

# Output: ECS Service Name
output "ecs_service_name" {
  value       = module.ecs.ecs_service_name
  description = "Name of the ECS service"
}

# Output: Application Load Balancer DNS Name
output "alb_dns_name" {
  value       = module.ecs.alb_hostname
  description = "DNS name of the Application Load Balancer"
}

# Output: RDS Instance Endpoint
output "rds_endpoint" {
  value       = module.rds.db_instance_endpoint
  description = "Endpoint of the RDS instance"
}

# Output: RDS Instance Database Name
output "rds_database_name" {
  value       = module.rds.db_instance_name
  description = "Name of the RDS database"
}

# Output: ElastiCache Cluster ID
output "elasticache_cluster_id" {
  value       = module.elasticache.redis_cluster_id
  description = "ID of the ElastiCache Redis cluster"
}

# Output: ElastiCache Cluster Address
output "elasticache_cluster_address" {
  value       = module.elasticache.redis_cluster_address
  description = "Address of the ElastiCache Redis cluster"
}

# Output: ElastiCache Cluster Port
output "elasticache_cluster_port" {
  value       = module.elasticache.redis_cluster_port
  description = "Port of the ElastiCache Redis cluster"
}

# Output: S3 Bucket ID
output "s3_bucket_id" {
  value       = module.s3.bucket_id
  description = "ID of the S3 bucket for static assets"
}

# Output: S3 Bucket ARN
output "s3_bucket_arn" {
  value       = module.s3.bucket_arn
  description = "ARN of the S3 bucket for static assets"
}

# Output: CloudFront Distribution ID
output "cloudfront_distribution_id" {
  value       = module.cloudfront.distribution_id
  description = "ID of the CloudFront distribution"
}

# Output: CloudFront Domain Name
output "cloudfront_domain_name" {
  value       = module.cloudfront.distribution_domain_name
  description = "Domain name of the CloudFront distribution"
}

# Output: Website URL
output "website_url" {
  value       = "https://${var.domain_name}"
  description = "URL of the deployed website"
}