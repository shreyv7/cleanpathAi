# CloudWatch Alarms and Monitoring

# Lambda Error Rate Alarm
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "cleanpath-edge-errors-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 60
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "Alert when Lambda error count exceeds threshold"
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = aws_lambda_function.edge_gatekeeper.function_name
  }
}

# Lambda Duration Alarm (Latency)
resource "aws_cloudwatch_metric_alarm" "lambda_duration" {
  alarm_name          = "cleanpath-edge-latency-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "Duration"
  namespace           = "AWS/Lambda"
  period              = 60
  statistic           = "Average"
  threshold           = var.max_latency_ms
  alarm_description   = "Alert when Lambda duration exceeds ${var.max_latency_ms}ms"
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = aws_lambda_function.edge_gatekeeper.function_name
  }
}

# Lambda Throttles Alarm
resource "aws_cloudwatch_metric_alarm" "lambda_throttles" {
  alarm_name          = "cleanpath-edge-throttles-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Throttles"
  namespace           = "AWS/Lambda"
  period              = 60
  statistic           = "Sum"
  threshold           = 5
  alarm_description   = "Alert when Lambda is being throttled"
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = aws_lambda_function.edge_gatekeeper.function_name
  }
}

# Redis CPU Utilization Alarm
resource "aws_cloudwatch_metric_alarm" "redis_cpu" {
  count               = var.enable_redis ? 1 : 0
  alarm_name          = "cleanpath-redis-cpu-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ElastiCache"
  period              = 300
  statistic           = "Average"
  threshold           = 75
  alarm_description   = "Alert when Redis CPU exceeds 75%"
  treat_missing_data  = "notBreaching"

  dimensions = {
    CacheClusterId = aws_elasticache_cluster.redis[0].cluster_id
  }
}

# Redis Memory Alarm
resource "aws_cloudwatch_metric_alarm" "redis_memory" {
  count               = var.enable_redis ? 1 : 0
  alarm_name          = "cleanpath-redis-memory-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "DatabaseMemoryUsagePercentage"
  namespace           = "AWS/ElastiCache"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Alert when Redis memory usage exceeds 80%"
  treat_missing_data  = "notBreaching"

  dimensions = {
    CacheClusterId = aws_elasticache_cluster.redis[0].cluster_id
  }
}
