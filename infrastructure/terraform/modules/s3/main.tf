# Terraform module for creating and configuring an S3 bucket for the supplement reminder website
# This module addresses the requirement: Static Asset Storage (9. INFRASTRUCTURE/9.2 CLOUD SERVICES)

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

resource "aws_s3_bucket" "supplement_reminder_bucket" {
  bucket = "${var.project_name}-${var.environment}-assets"

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-${var.environment}-assets"
      Environment = var.environment
    }
  )

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_public_access_block" "supplement_reminder_bucket_public_access_block" {
  bucket = aws_s3_bucket.supplement_reminder_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "supplement_reminder_bucket_versioning" {
  bucket = aws_s3_bucket.supplement_reminder_bucket.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "supplement_reminder_bucket_encryption" {
  bucket = aws_s3_bucket.supplement_reminder_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "supplement_reminder_bucket_lifecycle" {
  bucket = aws_s3_bucket.supplement_reminder_bucket.id

  rule {
    id     = "delete_old_objects"
    status = "Enabled"

    expiration {
      days = var.object_expiration_days
    }

    noncurrent_version_expiration {
      noncurrent_days = var.noncurrent_version_expiration_days
    }
  }
}

resource "aws_s3_bucket_cors_configuration" "supplement_reminder_bucket_cors" {
  bucket = aws_s3_bucket.supplement_reminder_bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = var.allowed_origins
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

variable "project_name" {
  type        = string
  description = "Name of the project"
}

variable "environment" {
  type        = string
  description = "Deployment environment (e.g., dev, staging, production)"
}

variable "common_tags" {
  type        = map(string)
  description = "Common tags to be applied to all resources"
  default     = {}
}

variable "object_expiration_days" {
  type        = number
  description = "Number of days after which objects should be deleted"
  default     = 90
}

variable "noncurrent_version_expiration_days" {
  type        = number
  description = "Number of days after which noncurrent object versions should be deleted"
  default     = 30
}

variable "allowed_origins" {
  type        = list(string)
  description = "List of allowed origins for CORS configuration"
  default     = ["*"]
}

output "bucket_id" {
  value       = aws_s3_bucket.supplement_reminder_bucket.id
  description = "The ID of the created S3 bucket"
}

output "bucket_arn" {
  value       = aws_s3_bucket.supplement_reminder_bucket.arn
  description = "The ARN of the created S3 bucket"
}

output "bucket_regional_domain_name" {
  value       = aws_s3_bucket.supplement_reminder_bucket.bucket_regional_domain_name
  description = "The regional domain name of the created S3 bucket"
}