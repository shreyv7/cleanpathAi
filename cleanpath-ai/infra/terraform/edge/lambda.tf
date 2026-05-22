# AWS Lambda Function for Edge Gatekeeper

# IAM Role for Lambda
resource "aws_iam_role" "edge_lambda_role" {
  name = "cleanpath-edge-lambda-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# IAM Policy for Lambda
resource "aws_iam_role_policy" "edge_lambda_policy" {
  name = "cleanpath-edge-lambda-policy-${var.environment}"
  role = aws_iam_role.edge_lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "elasticache:DescribeCacheClusters",
          "elasticache:DescribeReplicationGroups"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ec2:CreateNetworkInterface",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DeleteNetworkInterface"
        ]
        Resource = "*"
      }
    ]
  })
}

# Lambda Function
resource "aws_lambda_function" "edge_gatekeeper" {
  filename         = "edge-gatekeeper.zip"
  function_name    = "cleanpath-edge-gatekeeper-${var.environment}"
  role            = aws_iam_role.edge_lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = var.lambda_timeout_seconds
  memory_size     = var.lambda_memory_mb

  environment {
    variables = {
      ENVIRONMENT              = var.environment
      LOG_LEVEL               = var.environment == "production" ? "info" : "debug"
      MAX_LATENCY_MS          = var.max_latency_ms
      ENABLE_REDIS            = var.enable_redis
      ENABLE_METRICS          = "true"
      ENABLE_DETAILED_LOGGING = var.enable_detailed_logging
      REDIS_HOST              = var.enable_redis ? aws_elasticache_cluster.redis[0].cache_nodes[0].address : ""
      REDIS_PORT              = var.enable_redis ? aws_elasticache_cluster.redis[0].cache_nodes[0].port : "6379"
    }
  }

  # VPC configuration (if Redis is enabled)
  dynamic "vpc_config" {
    for_each = var.enable_redis ? [1] : []
    content {
      subnet_ids         = [aws_subnet.private[0].id]
      security_group_ids = [aws_security_group.lambda[0].id]
    }
  }

  tags = {
    Name = "cleanpath-edge-gatekeeper-${var.environment}"
  }
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "edge_lambda_logs" {
  name              = "/aws/lambda/${aws_lambda_function.edge_gatekeeper.function_name}"
  retention_in_days = var.log_retention_days

  tags = {
    Name = "cleanpath-edge-logs-${var.environment}"
  }
}

# Lambda Function URL (for HTTP access)
resource "aws_lambda_function_url" "edge_gatekeeper" {
  function_name      = aws_lambda_function.edge_gatekeeper.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = false
    allow_origins     = ["*"]
    allow_methods     = ["POST", "GET"]
    allow_headers     = ["*"]
    max_age          = 86400
  }
}
