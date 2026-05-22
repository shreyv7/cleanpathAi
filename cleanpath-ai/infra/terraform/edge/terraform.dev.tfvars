# Development Environment
environment              = "development"
aws_region              = "us-east-1"
lambda_memory_mb        = 512
lambda_timeout_seconds  = 10
redis_node_type         = "cache.t3.micro"
redis_num_cache_nodes   = 1
max_latency_ms          = 20
enable_redis            = false  # Disable Redis for local dev
enable_detailed_logging = true
log_retention_days      = 3
