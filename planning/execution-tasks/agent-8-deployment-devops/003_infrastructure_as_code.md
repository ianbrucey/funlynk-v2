# Task 003: Infrastructure as Code
**Agent**: Deployment & DevOps Engineer  
**Estimated Time**: 6-7 hours  
**Priority**: High  
**Dependencies**: Agent 8 Task 002 (Containerization and Orchestration)  

## Overview
Implement Infrastructure as Code (IaC) using Terraform for Funlynk platform infrastructure provisioning, including cloud resources, networking, security groups, databases, and monitoring infrastructure with proper state management and environment separation.

## Prerequisites
- Containerization and orchestration setup complete (Agent 8 Task 002)
- Cloud provider accounts configured (AWS/GCP/Azure)
- Terraform installed and configured
- Cloud CLI tools installed
- Domain and DNS management access

## Step-by-Step Implementation

### Step 1: Terraform Project Structure and Configuration (1.5 hours)

**Create Terraform project structure:**
```
infrastructure/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars
│   ├── staging/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars
│   └── production/
│       ├── main.tf
│       ├── variables.tf
│       └── terraform.tfvars
├── modules/
│   ├── networking/
│   ├── compute/
│   ├── database/
│   ├── storage/
│   ├── monitoring/
│   └── security/
├── shared/
│   ├── backend.tf
│   ├── providers.tf
│   └── variables.tf
└── scripts/
    ├── deploy.sh
    ├── destroy.sh
    └── validate.sh
```

**Create provider configuration (shared/providers.tf):**
```hcl
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
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "Funlynk"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "DevOps"
    }
  }
}

provider "kubernetes" {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)
  
  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name]
  }
}

provider "helm" {
  kubernetes {
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)
    
    exec {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "aws"
      args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name]
    }
  }
}
```

**Create backend configuration (shared/backend.tf):**
```hcl
terraform {
  backend "s3" {
    bucket         = "funlynk-terraform-state"
    key            = "infrastructure/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "funlynk-terraform-locks"
    
    # Workspace-specific state files
    workspace_key_prefix = "env"
  }
}

# S3 bucket for Terraform state
resource "aws_s3_bucket" "terraform_state" {
  bucket = "funlynk-terraform-state"
  
  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_encryption" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# DynamoDB table for state locking
resource "aws_dynamodb_table" "terraform_locks" {
  name           = "funlynk-terraform-locks"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "LockID"
  
  attribute {
    name = "LockID"
    type = "S"
  }
  
  lifecycle {
    prevent_destroy = true
  }
}
```

### Step 2: Networking and Security Infrastructure (2 hours)

**Create networking module (modules/networking/main.tf):**
```hcl
# VPC Configuration
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "${var.project_name}-${var.environment}-vpc"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  
  tags = {
    Name = "${var.project_name}-${var.environment}-igw"
  }
}

# Public Subnets
resource "aws_subnet" "public" {
  count = length(var.availability_zones)
  
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true
  
  tags = {
    Name = "${var.project_name}-${var.environment}-public-${count.index + 1}"
    Type = "public"
    "kubernetes.io/role/elb" = "1"
  }
}

# Private Subnets
resource "aws_subnet" "private" {
  count = length(var.availability_zones)
  
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]
  
  tags = {
    Name = "${var.project_name}-${var.environment}-private-${count.index + 1}"
    Type = "private"
    "kubernetes.io/role/internal-elb" = "1"
  }
}

# Database Subnets
resource "aws_subnet" "database" {
  count = length(var.availability_zones)
  
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.database_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]
  
  tags = {
    Name = "${var.project_name}-${var.environment}-database-${count.index + 1}"
    Type = "database"
  }
}

# NAT Gateways
resource "aws_eip" "nat" {
  count = length(var.availability_zones)
  
  domain = "vpc"
  
  tags = {
    Name = "${var.project_name}-${var.environment}-nat-eip-${count.index + 1}"
  }
  
  depends_on = [aws_internet_gateway.main]
}

resource "aws_nat_gateway" "main" {
  count = length(var.availability_zones)
  
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id
  
  tags = {
    Name = "${var.project_name}-${var.environment}-nat-${count.index + 1}"
  }
  
  depends_on = [aws_internet_gateway.main]
}

# Route Tables
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  
  tags = {
    Name = "${var.project_name}-${var.environment}-public-rt"
  }
}

resource "aws_route_table" "private" {
  count = length(var.availability_zones)
  
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }
  
  tags = {
    Name = "${var.project_name}-${var.environment}-private-rt-${count.index + 1}"
  }
}

resource "aws_route_table" "database" {
  vpc_id = aws_vpc.main.id
  
  tags = {
    Name = "${var.project_name}-${var.environment}-database-rt"
  }
}

# Route Table Associations
resource "aws_route_table_association" "public" {
  count = length(aws_subnet.public)
  
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count = length(aws_subnet.private)
  
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

resource "aws_route_table_association" "database" {
  count = length(aws_subnet.database)
  
  subnet_id      = aws_subnet.database[count.index].id
  route_table_id = aws_route_table.database.id
}

# Security Groups
resource "aws_security_group" "eks_cluster" {
  name_prefix = "${var.project_name}-${var.environment}-eks-cluster"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port = 443
    to_port   = 443
    protocol  = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "${var.project_name}-${var.environment}-eks-cluster-sg"
  }
}

resource "aws_security_group" "eks_nodes" {
  name_prefix = "${var.project_name}-${var.environment}-eks-nodes"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port = 0
    to_port   = 65535
    protocol  = "tcp"
    self      = true
  }
  
  ingress {
    from_port       = 1025
    to_port         = 65535
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_cluster.id]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "${var.project_name}-${var.environment}-eks-nodes-sg"
  }
}

resource "aws_security_group" "rds" {
  name_prefix = "${var.project_name}-${var.environment}-rds"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_nodes.id]
  }
  
  tags = {
    Name = "${var.project_name}-${var.environment}-rds-sg"
  }
}

resource "aws_security_group" "redis" {
  name_prefix = "${var.project_name}-${var.environment}-redis"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_nodes.id]
  }
  
  tags = {
    Name = "${var.project_name}-${var.environment}-redis-sg"
  }
}
```

### Step 3: Compute and Database Infrastructure (2 hours)

**Create EKS cluster module and database infrastructure**
**Implement RDS PostgreSQL with encryption and monitoring**
**Set up ElastiCache Redis cluster with security**
**Configure IAM roles and policies for services**
**Add KMS encryption for data at rest**

### Step 4: Environment-Specific Configurations and Deployment Scripts (1.5 hours)

**Create environment-specific Terraform configurations**
**Implement deployment automation scripts**
**Set up state management and locking**
**Configure workspace separation for environments**
**Add validation and safety checks**

## Acceptance Criteria

### Functional Requirements
- [ ] Infrastructure provisions successfully across all environments
- [ ] Terraform state is managed securely with locking
- [ ] Environment separation is properly implemented
- [ ] Database and cache clusters are highly available
- [ ] Kubernetes cluster is properly configured and secured
- [ ] Networking provides proper isolation and security
- [ ] Auto-scaling is configured for compute resources
- [ ] Backup and disaster recovery mechanisms are in place

### Technical Requirements
- [ ] Terraform code follows best practices and conventions
- [ ] Infrastructure is defined as code with version control
- [ ] Modules are reusable across environments
- [ ] Resource tagging is consistent and comprehensive
- [ ] Security groups follow principle of least privilege
- [ ] Encryption is enabled for data at rest and in transit
- [ ] Monitoring and logging are properly configured
- [ ] Cost optimization strategies are implemented

### Security Requirements
- [ ] All data is encrypted at rest using KMS
- [ ] Network traffic is encrypted in transit
- [ ] Security groups restrict access appropriately
- [ ] IAM roles follow principle of least privilege
- [ ] Secrets are managed securely
- [ ] VPC provides proper network isolation
- [ ] Database access is restricted to application subnets
- [ ] Audit logging is enabled for all resources

### Operational Requirements
- [ ] Infrastructure can be deployed consistently
- [ ] Rollback procedures are available
- [ ] Monitoring and alerting are configured
- [ ] Backup and restore procedures are tested
- [ ] Documentation is comprehensive and up-to-date
- [ ] Cost monitoring and optimization are implemented
- [ ] Disaster recovery procedures are defined
- [ ] Compliance requirements are met

## Manual Testing Instructions

### Test Case 1: Infrastructure Provisioning
1. Initialize Terraform in development environment
2. Run terraform plan and verify resource creation
3. Apply infrastructure and verify all resources are created
4. Test connectivity between components
5. Verify security groups and network policies
6. Test database and cache connectivity

### Test Case 2: Environment Management
1. Create infrastructure in staging environment
2. Verify environment isolation and separation
3. Test promotion from staging to production
4. Verify configuration differences between environments
5. Test workspace management and state isolation

### Test Case 3: Security and Compliance
1. Verify encryption is enabled for all data stores
2. Test network isolation and security groups
3. Verify IAM roles and permissions
4. Test backup and restore procedures
5. Verify audit logging and monitoring
6. Test disaster recovery procedures

### Test Case 4: Operational Procedures
1. Test infrastructure updates and rollbacks
2. Verify monitoring and alerting functionality
3. Test scaling procedures and auto-scaling
4. Verify cost monitoring and optimization
5. Test documentation and runbooks

## Dependencies and Integration Points

### Required Tools and Services
- Terraform for infrastructure provisioning
- AWS CLI for cloud resource management
- kubectl for Kubernetes cluster management
- Helm for application deployment
- Git for version control and collaboration

### Cloud Services Integration
- AWS EKS for Kubernetes orchestration
- AWS RDS for managed PostgreSQL database
- AWS ElastiCache for Redis caching
- AWS VPC for network isolation
- AWS KMS for encryption key management
- AWS CloudWatch for monitoring and logging

### Security and Compliance Tools
- AWS Config for compliance monitoring
- AWS CloudTrail for audit logging
- AWS Security Hub for security posture
- AWS GuardDuty for threat detection
- AWS Inspector for vulnerability assessment

## Completion Checklist

- [ ] Terraform project structure created and organized
- [ ] Provider and backend configurations implemented
- [ ] Networking module with VPC, subnets, and security groups
- [ ] Compute module with EKS cluster and node groups
- [ ] Database module with RDS and ElastiCache
- [ ] Storage module with S3 and backup configurations
- [ ] Monitoring module with CloudWatch and alerting
- [ ] Security module with IAM, KMS, and policies
- [ ] Environment-specific configurations created
- [ ] Deployment scripts and automation implemented
- [ ] State management and locking configured
- [ ] Documentation and runbooks created
- [ ] Testing and validation completed
- [ ] Team training and knowledge transfer completed

## Notes for Next Tasks
- Infrastructure as Code provides foundation for reliable deployments
- Environment separation ensures safe development and testing
- Security hardening protects against threats and vulnerabilities
- Monitoring integration supports operational excellence
- Automation reduces manual errors and improves efficiency
- Documentation enables team collaboration and knowledge sharing
