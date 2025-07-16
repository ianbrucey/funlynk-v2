terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.20"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.10"
    }
  }

  backend "s3" {
    bucket         = "funlynk-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "funlynk-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Environment = "production"
      Project     = "funlynk"
      ManagedBy   = "terraform"
    }
  }
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# VPC and Networking
module "vpc" {
  source = "../../modules/networking"
  
  environment = "production"
  vpc_cidr    = var.vpc_cidr
  
  availability_zones = data.aws_availability_zones.available.names
  
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  
  enable_nat_gateway = true
  enable_vpn_gateway = false
  
  tags = {
    Environment = "production"
    Project     = "funlynk"
  }
}

# EKS Cluster
module "eks" {
  source = "../../modules/compute"
  
  cluster_name    = "funlynk-production"
  cluster_version = var.kubernetes_version
  
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnet_ids
  
  node_groups = {
    main = {
      desired_capacity = 3
      max_capacity     = 10
      min_capacity     = 3
      
      instance_types = ["t3.medium"]
      
      k8s_labels = {
        Environment = "production"
        NodeGroup   = "main"
      }
    }
    
    compute = {
      desired_capacity = 2
      max_capacity     = 8
      min_capacity     = 2
      
      instance_types = ["c5.large"]
      
      k8s_labels = {
        Environment = "production"
        NodeGroup   = "compute"
      }
      
      taints = [
        {
          key    = "compute-optimized"
          value  = "true"
          effect = "NO_SCHEDULE"
        }
      ]
    }
  }
  
  tags = {
    Environment = "production"
    Project     = "funlynk"
  }
}

# RDS Database
module "database" {
  source = "../../modules/database"
  
  identifier = "funlynk-production"
  
  engine         = "mysql"
  engine_version = "8.0"
  instance_class = "db.t3.medium"
  
  allocated_storage     = 100
  max_allocated_storage = 1000
  storage_encrypted     = true
  
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password
  
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnet_ids
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  monitoring_interval = 60
  
  tags = {
    Environment = "production"
    Project     = "funlynk"
  }
}

# ElastiCache Redis
module "redis" {
  source = "../../modules/storage"
  
  cluster_id = "funlynk-production-redis"
  
  engine         = "redis"
  engine_version = "7.0"
  node_type      = "cache.t3.micro"
  
  num_cache_nodes = 1
  
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnet_ids
  
  tags = {
    Environment = "production"
    Project     = "funlynk"
  }
}

# S3 Buckets
module "storage" {
  source = "../../modules/storage"
  
  environment = "production"
  
  buckets = {
    assets = {
      name = "funlynk-production-assets"
      versioning = true
      public_read = true
    }
    
    backups = {
      name = "funlynk-production-backups"
      versioning = true
      public_read = false
    }
    
    logs = {
      name = "funlynk-production-logs"
      versioning = false
      public_read = false
    }
  }
  
  tags = {
    Environment = "production"
    Project     = "funlynk"
  }
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "admin_dashboard" {
  origin {
    domain_name = module.storage.bucket_domain_names["assets"]
    origin_id   = "S3-funlynk-production-assets"
    
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.admin_dashboard.cloudfront_access_identity_path
    }
  }
  
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  
  aliases = ["admin.funlynk.com"]
  
  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-funlynk-production-assets"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
    
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
    
    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
  }
  
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  viewer_certificate {
    acm_certificate_arn = var.ssl_certificate_arn
    ssl_support_method  = "sni-only"
  }
  
  tags = {
    Environment = "production"
    Project     = "funlynk"
  }
}

resource "aws_cloudfront_origin_access_identity" "admin_dashboard" {
  comment = "OAI for Funlynk Admin Dashboard"
}
