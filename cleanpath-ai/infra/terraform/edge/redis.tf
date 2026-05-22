# ElastiCache Redis Cluster

# VPC for Redis
resource "aws_vpc" "main" {
  count                = var.enable_redis ? 1 : 0
  cidr_block          = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "cleanpath-vpc-${var.environment}"
  }
}

# Private Subnet
resource "aws_subnet" "private" {
  count             = var.enable_redis ? 1 : 0
  vpc_id            = aws_vpc.main[0].id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "${var.aws_region}a"

  tags = {
    Name = "cleanpath-private-subnet-${var.environment}"
  }
}

# Security Group for Lambda
resource "aws_security_group" "lambda" {
  count       = var.enable_redis ? 1 : 0
  name        = "cleanpath-lambda-sg-${var.environment}"
  description = "Security group for Lambda function"
  vpc_id      = aws_vpc.main[0].id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "cleanpath-lambda-sg-${var.environment}"
  }
}

# Security Group for Redis
resource "aws_security_group" "redis" {
  count       = var.enable_redis ? 1 : 0
  name        = "cleanpath-redis-sg-${var.environment}"
  description = "Security group for Redis cluster"
  vpc_id      = aws_vpc.main[0].id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.lambda[0].id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "cleanpath-redis-sg-${var.environment}"
  }
}

# Subnet Group for Redis
resource "aws_elasticache_subnet_group" "redis" {
  count      = var.enable_redis ? 1 : 0
  name       = "cleanpath-redis-subnet-${var.environment}"
  subnet_ids = [aws_subnet.private[0].id]

  tags = {
    Name = "cleanpath-redis-subnet-${var.environment}"
  }
}

# ElastiCache Redis Cluster
resource "aws_elasticache_cluster" "redis" {
  count                = var.enable_redis ? 1 : 0
  cluster_id           = "cleanpath-redis-${var.environment}"
  engine               = "redis"
  engine_version       = "7.0"
  node_type            = var.redis_node_type
  num_cache_nodes      = var.redis_num_cache_nodes
  parameter_group_name = "default.redis7"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.redis[0].name
  security_group_ids   = [aws_security_group.redis[0].id]

  tags = {
    Name = "cleanpath-redis-${var.environment}"
  }
}
