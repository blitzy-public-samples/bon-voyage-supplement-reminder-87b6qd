# Route53 DNS management for the supplement reminder website
# Requirement addressed: DNS Management (9. INFRASTRUCTURE/9.2 CLOUD SERVICES)
# Configure Route53 for reliable and cost-effective domain management

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

# Data source to fetch the existing Route53 hosted zone
data "aws_route53_zone" "route53_zone" {
  name         = var.domain_name
  private_zone = false
}

# Route53 record for the main domain (apex)
resource "aws_route53_record" "website_dns" {
  zone_id = data.aws_route53_zone.route53_zone.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = var.cloudfront_distribution_domain_name
    zone_id                = var.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}

# Route53 record for the www subdomain
resource "aws_route53_record" "www_website_dns" {
  zone_id = data.aws_route53_zone.route53_zone.zone_id
  name    = "www.${var.domain_name}"
  type    = "A"

  alias {
    name                   = var.cloudfront_distribution_domain_name
    zone_id                = var.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}

# Route53 health check for the main domain
resource "aws_route53_health_check" "website_health_check" {
  fqdn              = var.domain_name
  port              = 443
  type              = "HTTPS"
  resource_path     = "/"
  failure_threshold = "3"
  request_interval  = "30"

  tags = {
    Name = "website-health-check"
  }
}

# Output the Route53 zone ID for potential use in other modules or outputs
output "route53_zone_id" {
  value       = data.aws_route53_zone.route53_zone.zone_id
  description = "The ID of the Route53 hosted zone"
}

# Output the health check ID for potential use in other modules or outputs
output "health_check_id" {
  value       = aws_route53_health_check.website_health_check.id
  description = "The ID of the Route53 health check"
}

# Variables
variable "domain_name" {
  type        = string
  description = "The domain name for the website"
}

variable "cloudfront_distribution_domain_name" {
  type        = string
  description = "The domain name of the CloudFront distribution"
}

variable "cloudfront_hosted_zone_id" {
  type        = string
  description = "The hosted zone ID for CloudFront distributions"
  default     = "Z2FDTNDATAQYW2"
}