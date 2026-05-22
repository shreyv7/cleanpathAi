# Edge Infrastructure Deployment

## Overview

Terraform configuration for deploying the Edge Gatekeeper to AWS Lambda with ElastiCache Redis.

## Architecture

```
Internet → Lambda Function URL → Lambda (Edge Gatekeeper) → ElastiCache Redis
                                       ↓
                                 CloudWatch Logs
                                       ↓
                                 CloudWatch Alarms
```

## Components

### 1. AWS Lambda
- **Runtime**: Node.js 18.x
- **Memory**: 512MB (dev) / 1024MB (prod)
- **Timeout**: 10 seconds
- **VPC**: Optional (only if Redis enabled)

### 2. ElastiCache Redis
- **Engine**: Redis 7.0
- **Node Type**: cache.t3.micro (dev) / cache.r6g.large (prod)
- **Nodes**: 1 (dev) / 2 (prod)
- **VPC**: Private subnet with security groups

### 3. CloudWatch
- **Logs**: 3 days (dev) / 30 days (prod) retention
- **Alarms**: Errors, latency, throttles, Redis CPU/memory

## Prerequisites

1. **AWS CLI** configured with credentials
2. **Terraform** >= 1.5.0
3. **S3 bucket** for Terraform state (create manually)

```bash
aws s3 mb s3://cleanpath-terraform-state --region us-east-1
```

## Deployment

### Initialize Terraform

```bash
cd infra/terraform/edge
terraform init
```

### Plan Deployment

```bash
# Development
terraform plan -var-file="terraform.dev.tfvars"

# Production
terraform plan -var-file="terraform.prod.tfvars"
```

### Apply Configuration

```bash
# Development
terraform apply -var-file="terraform.dev.tfvars"

# Production
terraform apply -var-file="terraform.prod.tfvars"
```

### Get Outputs

```bash
terraform output
```

## Environment Variables

Set in Lambda function automatically:

```bash
ENVIRONMENT=production
LOG_LEVEL=info
MAX_LATENCY_MS=20
ENABLE_REDIS=true
ENABLE_METRICS=true
ENABLE_DETAILED_LOGGING=false
REDIS_HOST=<redis-endpoint>
REDIS_PORT=6379
```

## Configuration

### Development

```hcl
environment              = "development"
lambda_memory_mb        = 512
enable_redis            = false  # Use mock Redis
enable_detailed_logging = true
log_retention_days      = 3
```

### Production

```hcl
environment              = "production"
lambda_memory_mb        = 1024
redis_node_type         = "cache.r6g.large"
redis_num_cache_nodes   = 2
enable_redis            = true
enable_detailed_logging = false
log_retention_days      = 30
```

## Monitoring

### CloudWatch Alarms

1. **Lambda Errors**: Triggers when error count > 10 in 2 minutes
2. **Lambda Latency**: Triggers when avg duration > 20ms
3. **Lambda Throttles**: Triggers when throttle count > 5 in 1 minute
4. **Redis CPU**: Triggers when CPU > 75% for 10 minutes
5. **Redis Memory**: Triggers when memory > 80% for 10 minutes

### Metrics Dashboard

View in CloudWatch:
- Lambda invocations
- Lambda duration (P50, P95, P99)
- Lambda errors
- Redis cache hits/misses
- Redis CPU/memory

## Health Check

```bash
# Get Lambda URL
LAMBDA_URL=$(terraform output -raw lambda_function_url)

# Health check
curl "${LAMBDA_URL}/health"
```

Expected response:
```json
{
  "healthy": true,
  "details": {
    "cache": {
      "l1Size": 850,
      "l1HitRate": 87.5,
      "l2Enabled": true
    },
    "thermalEngine": {
      "version": "1.0.0",
      "rulesEnabled": 5
    }
  }
}
```

## Deployment Package

### Build Lambda Package

```bash
cd edge-gatekeeper

# Install dependencies
pnpm install --prod

# Build TypeScript
pnpm run build

# Create deployment package
zip -r ../infra/terraform/edge/edge-gatekeeper.zip dist/ node_modules/ package.json
```

### Update Lambda

```bash
cd infra/terraform/edge

# Rebuild and redeploy
terraform apply -var-file="terraform.prod.tfvars"
```

## Cost Estimation

### Development
- Lambda: ~$0.20/month (minimal usage)
- Redis: Disabled
- CloudWatch: ~$1/month
- **Total**: ~$1.20/month

### Production (10M requests/month)
- Lambda: ~$50/month (10M invocations × 512MB × 20ms)
- Redis: ~$100/month (cache.r6g.large × 2 nodes)
- CloudWatch: ~$5/month
- **Total**: ~$155/month

## Scaling

### Lambda Auto-Scaling
- **Concurrent executions**: 1000 (default)
- **Provisioned concurrency**: Optional for consistent latency
- **Reserved concurrency**: Optional to limit costs

### Redis Scaling
- **Vertical**: Increase node type (cache.r6g.xlarge)
- **Horizontal**: Add read replicas
- **Cluster mode**: Enable for >1TB data

## Security

### IAM Permissions
- Lambda execution role with minimal permissions
- VPC security groups restrict Redis access
- API keys stored in environment variables (encrypted)

### Network Security
- Redis in private subnet (no internet access)
- Lambda in VPC (if Redis enabled)
- Security groups allow only Lambda → Redis traffic

## Troubleshooting

### High Latency

```bash
# Check CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Duration \
  --dimensions Name=FunctionName,Value=cleanpath-edge-gatekeeper-production \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-01T23:59:59Z \
  --period 300 \
  --statistics Average
```

### Redis Connection Issues

```bash
# Check Redis cluster status
aws elasticache describe-cache-clusters \
  --cache-cluster-id cleanpath-redis-production \
  --show-cache-node-info
```

### Lambda Errors

```bash
# View recent logs
aws logs tail /aws/lambda/cleanpath-edge-gatekeeper-production --follow
```

## Cleanup

```bash
# Destroy all resources
terraform destroy -var-file="terraform.prod.tfvars"
```

## Next Steps

- Configure CloudWatch dashboards
- Set up SNS notifications for alarms
- Enable X-Ray tracing for distributed tracing
- Configure auto-scaling policies
- Set up CI/CD pipeline for automated deployments
