# Variables for Edge Infrastructure

variable "aws_region" {
  description = "AWS region for edge deployment"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (development, staging, production)"
  type        = string
  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be development, staging, or production."
  }
}

variable "lambda_memory_mb" {
  description = "Memory allocation for Lambda function (MB)"
  type        = number
  default     = 512
}

variable "lambda_timeout_seconds" {
  description = "Timeout for Lambda function (seconds)"
  type        = number
  default     = 10
}

variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t3.micro"
}

variable "redis_num_cache_nodes" {
  description = "Number of Redis cache nodes"
  type        = number
  default     = 1
}

variable "api_keys" {
  description = "List of API keys for authentication"
  type        = list(string)
  sensitive   = true
  default     = []
}

variable "max_latency_ms" {
  description = "Maximum allowed latency in milliseconds"
  type        = number
  default     = 20
}

variable "enable_redis" {
  description = "Enable Redis cache"
  type        = bool
  default     = true
}

variable "enable_detailed_logging" {
  description = "Enable detailed request logging"
  type        = bool
  default     = false
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 7
}
