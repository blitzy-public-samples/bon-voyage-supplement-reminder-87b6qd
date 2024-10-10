# ElastiCache module for the supplement reminder website
# This module provisions an Amazon ElastiCache Redis cluster for caching frequent database queries

# Requirement addressed: Caching Layer
# Location: 9. INFRASTRUCTURE/9.2 CLOUD SERVICES
# Description: Implement Amazon ElastiCache for Redis as a caching layer to improve performance by caching frequent database queries

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

# Create ElastiCache subnet group
resource "aws_elasticache_subnet_group" "main" {
  name        = "${var.project_name}-${var.environment}-cache-subnet-group"
  description = "ElastiCache subnet group for ${var.project_name} ${var.environment}"
  subnet_ids  = var.private_subnet_ids

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-${var.environment}-cache-subnet-group"
      Environment = var.environment
    }
  )
}

# Create ElastiCache Redis cluster
resource "aws_elasticache_cluster" "main" {
  cluster_id           = "${var.project_name}-${var.environment}-redis-cluster"
  engine               = "redis"
  node_type            = var.redis_node_type
  num_cache_nodes      = var.redis_num_cache_nodes
  parameter_group_name = var.redis_parameter_group_name
  engine_version       = var.redis_engine_version
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.redis.id]

  maintenance_window = var.maintenance_window
  snapshot_window    = var.snapshot_window
  snapshot_retention_limit = var.snapshot_retention_limit

  apply_immediately = var.apply_immediately

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-${var.environment}-redis-cluster"
      Environment = var.environment
    }
  )
}

# Create security group for ElastiCache Redis cluster
resource "aws_security_group" "redis" {
  name        = "${var.project_name}-${var.environment}-redis-sg"
  description = "Security group for ElastiCache Redis cluster"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    cidr_blocks     = [var.vpc_cidr]
    description     = "Allow inbound Redis traffic from VPC"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-${var.environment}-redis-sg"
      Environment = var.environment
    }
  )
}

# Output values
output "redis_cluster_id" {
  value       = aws_elasticache_cluster.main.id
  description = "ID of the ElastiCache Redis cluster"
}

output "redis_cluster_address" {
  value       = aws_elasticache_cluster.main.cache_nodes[0].address
  description = "Address of the ElastiCache Redis cluster"
}

output "redis_cluster_port" {
  value       = aws_elasticache_cluster.main.port
  description = "Port of the ElastiCache Redis cluster"
}

output "redis_security_group_id" {
  value       = aws_security_group.redis.id
  description = "ID of the Redis security group"
}
```

This regenerated version of the ElastiCache module includes several improvements and best practices for enterprise-grade, production-ready Terraform code:

1. Added a `terraform` block to specify the required provider and version.
2. Enhanced the `aws_elasticache_subnet_group` resource with a description.
3. Added more configuration options to the `aws_elasticache_cluster` resource:
   - `engine_version` for specifying the Redis version
   - `maintenance_window` for scheduled maintenance
   - `snapshot_window` and `snapshot_retention_limit` for backup configuration
   - `apply_immediately` for controlling when changes are applied
4. Improved the security group configuration with a description for each rule.
5. Added tags to all resources using a `merge` function to combine common tags with resource-specific tags.
6. Added an output for the Redis security group ID.
7. Used variables for various configuration options to make the module more flexible and reusable.

To fully implement these changes, you'll need to update the `variables.tf` file in the same directory to include the new variables used in this module. Here's a list of variables that should be added or updated:

```hcl
variable "redis_parameter_group_name" {
  description = "Name of the parameter group to associate with the Redis cluster"
  type        = string
  default     = "default.redis6.x"
}

variable "redis_engine_version" {
  description = "Version number of the Redis engine"
  type        = string
  default     = "6.x"
}

variable "maintenance_window" {
  description = "Preferred maintenance window"
  type        = string
  default     = "sun:05:00-sun:09:00"
}

variable "snapshot_window" {
  description = "The daily time range during which automated backups are created"
  type        = string
  default     = "00:00-05:00"
}

variable "snapshot_retention_limit" {
  description = "The number of days for which ElastiCache will retain automatic cache cluster snapshots"
  type        = number
  default     = 7
}

variable "apply_immediately" {
  description = "Specifies whether any database modifications are applied immediately, or during the next maintenance window"
  type        = bool
  default     = false
}

variable "common_tags" {
  description = "A map of common tags to add to all resources"
  type        = map(string)
  default     = {}
}