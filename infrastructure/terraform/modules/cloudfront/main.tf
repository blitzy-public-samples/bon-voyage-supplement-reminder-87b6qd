# CloudFront Distribution Module for Supplement Reminder Website
# This module creates and configures a CloudFront distribution for serving static assets globally
# and improving loading times for the supplement reminder website.

# Requirement addressed: Content Delivery Network (CDN)
# Location: 9. INFRASTRUCTURE/9.2 CLOUD SERVICES

terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

# CloudFront distribution for the supplement reminder website
resource "aws_cloudfront_distribution" "supplement_reminder_distribution" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.project_name} - ${var.environment} distribution"
  default_root_object = "index.html"
  http_version        = "http2"
  price_class         = var.cloudfront_price_class

  origin {
    domain_name = aws_s3_bucket.supplement_reminder_bucket.bucket_regional_domain_name
    origin_id   = local.s3_origin_id

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.supplement_reminder_oai.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.s3_origin_id

    forwarded_values {
      query_string = false
      headers      = ["Origin"]

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  ordered_cache_behavior {
    path_pattern     = "/assets/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = local.s3_origin_id

    forwarded_values {
      query_string = false
      headers      = ["Origin"]

      cookies {
        forward = "none"
      }
    }

    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.acm_certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  custom_error_response {
    error_caching_min_ttl = 300
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
  }

  web_acl_id = var.web_acl_id

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-${var.environment}-distribution"
      Environment = var.environment
    }
  )
}

# CloudFront Origin Access Identity for secure S3 access
resource "aws_cloudfront_origin_access_identity" "supplement_reminder_oai" {
  comment = "${var.project_name} - ${var.environment} OAI"
}

# S3 bucket for static assets
resource "aws_s3_bucket" "supplement_reminder_bucket" {
  bucket = var.s3_bucket_name
  acl    = "private"

  versioning {
    enabled = true
  }

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-${var.environment}-static-assets"
      Environment = var.environment
    }
  )
}

# S3 bucket policy to allow CloudFront access
resource "aws_s3_bucket_policy" "supplement_reminder_bucket_policy" {
  bucket = aws_s3_bucket.supplement_reminder_bucket.id
  policy = data.aws_iam_policy_document.s3_policy.json
}

# IAM policy document for S3 bucket access
data "aws_iam_policy_document" "s3_policy" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.supplement_reminder_bucket.arn}/*"]

    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.supplement_reminder_oai.iam_arn]
    }
  }

  statement {
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.supplement_reminder_bucket.arn]

    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.supplement_reminder_oai.iam_arn]
    }
  }
}

locals {
  s3_origin_id = "S3-${var.project_name}-${var.environment}"
}

# Input variables
variable "project_name" {
  type        = string
  description = "Name of the project"
}

variable "environment" {
  type        = string
  description = "Deployment environment (e.g., dev, staging, production)"
}

variable "s3_bucket_name" {
  type        = string
  description = "Name of the S3 bucket to use as the origin for CloudFront"
}

variable "domain_name" {
  type        = string
  description = "Domain name for the CloudFront distribution"
}

variable "acm_certificate_arn" {
  type        = string
  description = "ARN of the ACM certificate for the CloudFront distribution"
}

variable "cloudfront_price_class" {
  type        = string
  description = "CloudFront distribution price class"
  default     = "PriceClass_100"
}

variable "web_acl_id" {
  type        = string
  description = "ID of the AWS WAF WebACL to associate with the CloudFront distribution"
  default     = ""
}

variable "common_tags" {
  type        = map(string)
  description = "Common tags to be applied to all resources"
  default     = {}
}

# Output values
output "distribution_id" {
  value       = aws_cloudfront_distribution.supplement_reminder_distribution.id
  description = "The ID of the CloudFront distribution"
}

output "distribution_domain_name" {
  value       = aws_cloudfront_distribution.supplement_reminder_distribution.domain_name
  description = "The domain name of the CloudFront distribution"
}

output "s3_bucket_id" {
  value       = aws_s3_bucket.supplement_reminder_bucket.id
  description = "The ID of the S3 bucket used as the origin for CloudFront"
}

output "cloudfront_origin_access_identity_iam_arn" {
  value       = aws_cloudfront_origin_access_identity.supplement_reminder_oai.iam_arn
  description = "The IAM ARN of the CloudFront Origin Access Identity"
}