# Edge Infrastructure - Terraform Configuration

terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket = "cleanpath-terraform-state"
    key    = "edge/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "CleanPath AI"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Component   = "Edge"
    }
  }
}
