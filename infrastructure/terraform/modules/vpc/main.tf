# Terraform module for creating and configuring the VPC (Virtual Private Cloud) for the supplement reminder website
# This module addresses the requirement: "Network Infrastructure" (Location: 9. INFRASTRUCTURE/9.2 CLOUD SERVICES)
# Description: Set up the VPC and subnets for hosting the application components securely

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

# Data source to fetch available AWS Availability Zones
data "aws_availability_zones" "available" {
  state = "available"
}

# Create the main VPC
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-vpc"
    }
  )
}

# Create an Internet Gateway for the VPC
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-igw"
    }
  )
}

# Create public subnets
resource "aws_subnet" "public" {
  count                   = length(var.public_subnet_cidrs)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = element(var.public_subnet_cidrs, count.index)
  availability_zone       = element(data.aws_availability_zones.available.names, count.index)
  map_public_ip_on_launch = true

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-public-subnet-${count.index + 1}"
      Tier = "Public"
    }
  )
}

# Create private subnets
resource "aws_subnet" "private" {
  count             = length(var.private_subnet_cidrs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = element(var.private_subnet_cidrs, count.index)
  availability_zone = element(data.aws_availability_zones.available.names, count.index)

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-private-subnet-${count.index + 1}"
      Tier = "Private"
    }
  )
}

# Create a public route table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-public-rt"
    }
  )
}

# Create private route tables
resource "aws_route_table" "private" {
  count  = length(var.private_subnet_cidrs)
  vpc_id = aws_vpc.main.id

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-private-rt-${count.index + 1}"
    }
  )
}

# Associate public subnets with the public route table
resource "aws_route_table_association" "public" {
  count          = length(var.public_subnet_cidrs)
  subnet_id      = element(aws_subnet.public[*].id, count.index)
  route_table_id = aws_route_table.public.id
}

# Associate private subnets with their respective private route tables
resource "aws_route_table_association" "private" {
  count          = length(var.private_subnet_cidrs)
  subnet_id      = element(aws_subnet.private[*].id, count.index)
  route_table_id = element(aws_route_table.private[*].id, count.index)
}

# Create NAT Gateways for private subnet internet access
resource "aws_nat_gateway" "main" {
  count         = var.create_nat_gateway ? length(var.public_subnet_cidrs) : 0
  allocation_id = element(aws_eip.nat[*].id, count.index)
  subnet_id     = element(aws_subnet.public[*].id, count.index)

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-nat-gw-${count.index + 1}"
    }
  )

  depends_on = [aws_internet_gateway.main]
}

# Create Elastic IPs for NAT Gateways
resource "aws_eip" "nat" {
  count = var.create_nat_gateway ? length(var.public_subnet_cidrs) : 0
  vpc   = true

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-eip-${count.index + 1}"
    }
  )

  depends_on = [aws_internet_gateway.main]
}

# Add routes to private route tables for internet access via NAT Gateways
resource "aws_route" "private_nat_gateway" {
  count                  = var.create_nat_gateway ? length(var.private_subnet_cidrs) : 0
  route_table_id         = element(aws_route_table.private[*].id, count.index)
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = element(aws_nat_gateway.main[*].id, count.index)
}

# VPC Flow Logs
resource "aws_flow_log" "main" {
  count                = var.enable_vpc_flow_logs ? 1 : 0
  iam_role_arn         = aws_iam_role.vpc_flow_log_role[0].arn
  log_destination      = aws_cloudwatch_log_group.vpc_flow_log[0].arn
  traffic_type         = "ALL"
  vpc_id               = aws_vpc.main.id
  max_aggregation_interval = 600

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-vpc-flow-log"
    }
  )
}

# CloudWatch Log Group for VPC Flow Logs
resource "aws_cloudwatch_log_group" "vpc_flow_log" {
  count             = var.enable_vpc_flow_logs ? 1 : 0
  name              = "/aws/vpc/${aws_vpc.main.id}/flow-log"
  retention_in_days = var.vpc_flow_log_retention_in_days

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-vpc-flow-log-group"
    }
  )
}

# IAM Role for VPC Flow Logs
resource "aws_iam_role" "vpc_flow_log_role" {
  count = var.enable_vpc_flow_logs ? 1 : 0
  name  = "${var.project_name}-${var.environment}-vpc-flow-log-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "vpc-flow-logs.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-vpc-flow-log-role"
    }
  )
}

# IAM Role Policy for VPC Flow Logs
resource "aws_iam_role_policy" "vpc_flow_log_policy" {
  count = var.enable_vpc_flow_logs ? 1 : 0
  name  = "${var.project_name}-${var.environment}-vpc-flow-log-policy"
  role  = aws_iam_role.vpc_flow_log_role[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ]
        Effect   = "Allow"
        Resource = "${aws_cloudwatch_log_group.vpc_flow_log[0].arn}:*"
      }
    ]
  })
}