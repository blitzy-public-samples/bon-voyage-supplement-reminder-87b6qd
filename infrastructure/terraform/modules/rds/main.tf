# Terraform module for creating and configuring the Amazon RDS instance for the supplement reminder website
# This module addresses the requirement: "Database Setup" from section 9. INFRASTRUCTURE/9.2 CLOUD SERVICES

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

resource "aws_db_subnet_group" "main" {
  name        = "${var.project_name}-${var.environment}-db-subnet-group"
  description = "Database subnet group for ${var.project_name} ${var.environment} environment"
  subnet_ids  = var.private_subnet_ids

  tags = {
    Name        = "${var.project_name}-${var.environment}-db-subnet-group"
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "Terraform"
  }
}

resource "aws_security_group" "rds" {
  name        = "${var.project_name}-${var.environment}-rds-sg"
  description = "Security group for RDS instance in ${var.project_name} ${var.environment} environment"
  vpc_id      = var.vpc_id

  ingress {
    description = "Allow PostgreSQL traffic from the VPC"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-rds-sg"
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "Terraform"
  }
}

resource "aws_db_instance" "main" {
  identifier             = "${var.project_name}-${var.environment}-db"
  engine                 = "postgres"
  engine_version         = "13.7"
  instance_class         = var.db_instance_class
  allocated_storage      = 20
  max_allocated_storage  = 100
  db_name                = var.db_name
  username               = var.db_username
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false
  skip_final_snapshot    = true
  backup_retention_period = 7
  deletion_protection    = true
  storage_encrypted      = true
  multi_az               = var.environment == "production" ? true : false
  monitoring_interval    = 60
  monitoring_role_arn    = aws_iam_role.rds_monitoring_role.arn

  performance_insights_enabled          = true
  performance_insights_retention_period = 7

  maintenance_window = "Sun:03:00-Sun:04:00"
  backup_window      = "02:00-03:00"

  tags = {
    Name        = "${var.project_name}-${var.environment}-db"
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "Terraform"
  }
}

resource "aws_iam_role" "rds_monitoring_role" {
  name = "${var.project_name}-${var.environment}-rds-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-${var.environment}-rds-monitoring-role"
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "Terraform"
  }
}

resource "aws_iam_role_policy_attachment" "rds_monitoring_policy" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
  role       = aws_iam_role.rds_monitoring_role.name
}

output "db_instance_endpoint" {
  value       = aws_db_instance.main.endpoint
  description = "Connection endpoint for the RDS instance"
}

output "db_instance_name" {
  value       = aws_db_instance.main.db_name
  description = "Name of the created database"
}

output "db_instance_port" {
  value       = aws_db_instance.main.port
  description = "Port of the RDS instance"
}

output "db_instance_username" {
  value       = aws_db_instance.main.username
  description = "Master username for the RDS instance"
  sensitive   = true
}

output "db_subnet_group_name" {
  value       = aws_db_subnet_group.main.name
  description = "Name of the created DB subnet group"
}

output "db_security_group_id" {
  value       = aws_security_group.rds.id
  description = "ID of the security group for the RDS instance"
}