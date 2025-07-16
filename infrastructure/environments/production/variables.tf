variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.20.0/24", "10.0.30.0/24"]
}

variable "kubernetes_version" {
  description = "Kubernetes version for EKS cluster"
  type        = string
  default     = "1.27"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "funlynk_production"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "funlynk"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "ssl_certificate_arn" {
  description = "ARN of SSL certificate for CloudFront"
  type        = string
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "funlynk.com"
}

variable "admin_domain_name" {
  description = "Domain name for admin dashboard"
  type        = string
  default     = "admin.funlynk.com"
}

variable "api_domain_name" {
  description = "Domain name for API"
  type        = string
  default     = "api.funlynk.com"
}

variable "enable_monitoring" {
  description = "Enable monitoring stack"
  type        = bool
  default     = true
}

variable "enable_logging" {
  description = "Enable centralized logging"
  type        = bool
  default     = true
}

variable "backup_retention_days" {
  description = "Number of days to retain backups"
  type        = number
  default     = 30
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project     = "funlynk"
    Environment = "production"
    ManagedBy   = "terraform"
  }
}
