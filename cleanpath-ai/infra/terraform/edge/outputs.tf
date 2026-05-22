# Outputs

output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.edge_gatekeeper.function_name
}

output "lambda_function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.edge_gatekeeper.arn
}

output "lambda_function_url" {
  description = "HTTP URL for the Lambda function"
  value       = aws_lambda_function_url.edge_gatekeeper.function_url
}

output "redis_endpoint" {
  description = "Redis cluster endpoint"
  value       = var.enable_redis ? aws_elasticache_cluster.redis[0].cache_nodes[0].address : null
}

output "redis_port" {
  description = "Redis cluster port"
  value       = var.enable_redis ? aws_elasticache_cluster.redis[0].cache_nodes[0].port : null
}

output "cloudwatch_log_group" {
  description = "CloudWatch log group name"
  value       = aws_cloudwatch_log_group.edge_lambda_logs.name
}
