# Funlynk Deployment Guide

This document provides comprehensive instructions for deploying the Funlynk platform using our CI/CD pipeline and infrastructure as code.

## 🏗️ Architecture Overview

The Funlynk platform uses a modern containerized architecture deployed on Kubernetes:

- **Backend**: Laravel API running in Docker containers
- **Admin Dashboard**: React SPA served via Nginx
- **Mobile App**: React Native app deployed to app stores
- **Infrastructure**: AWS EKS, RDS, ElastiCache, S3
- **Monitoring**: Prometheus, Grafana, AlertManager
- **Service Mesh**: Istio for traffic management and security

## 🚀 Quick Start

### Prerequisites

1. **Tools Required**:
   - Docker Desktop
   - kubectl
   - AWS CLI
   - Terraform (for infrastructure)
   - Node.js 18+
   - PHP 8.1+
   - Composer

2. **Access Required**:
   - AWS account with appropriate permissions
   - GitHub repository access
   - Container registry access (GitHub Container Registry)

### Local Development

```bash
# Clone the repository
git clone https://github.com/your-org/funlynk-v2.git
cd funlynk-v2

# Start local development environment
docker-compose up -d

# Check services are running
docker-compose ps
```

## 📋 Environment Setup

### GitHub Secrets Configuration

Configure the following secrets in your GitHub repository:

#### AWS Configuration
```
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_DEFAULT_REGION=us-east-1
```

#### Database Configuration
```
DB_PASSWORD=your-secure-database-password
```

#### Application Secrets
```
APP_KEY=base64:your-laravel-app-key
JWT_SECRET=your-jwt-secret
```

#### External Services
```
SNYK_TOKEN=your-snyk-token
SONAR_TOKEN=your-sonarcloud-token
CODECOV_TOKEN=your-codecov-token
SLACK_WEBHOOK_URL=your-slack-webhook
```

#### Environment URLs
```
STAGING_API_URL=https://staging-api.funlynk.com
STAGING_ADMIN_URL=https://staging-admin.funlynk.com
PRODUCTION_API_URL=https://api.funlynk.com
PRODUCTION_ADMIN_URL=https://admin.funlynk.com
```

### Infrastructure Deployment

1. **Initialize Terraform**:
```bash
cd infrastructure/environments/production
terraform init
```

2. **Plan Infrastructure**:
```bash
terraform plan -var-file="terraform.tfvars"
```

3. **Deploy Infrastructure**:
```bash
terraform apply -var-file="terraform.tfvars"
```

## 🔄 CI/CD Pipeline

### Pipeline Triggers

- **Pull Requests**: Run tests and quality gates
- **Push to `develop`**: Deploy to staging environment
- **Push to `main`**: Deploy to production environment

### Pipeline Stages

1. **Test Stage**:
   - Unit tests
   - Integration tests
   - Code quality analysis
   - Security scanning

2. **Build Stage**:
   - Docker image building
   - Container security scanning
   - Artifact storage

3. **Deploy Stage**:
   - Kubernetes deployment
   - Health checks
   - Smoke tests
   - Notifications

### Manual Deployment

Use the deployment script for manual deployments:

```bash
# Deploy to staging
./scripts/deploy.sh -e staging -c all

# Deploy only backend to production
./scripts/deploy.sh -e production -c backend

# Dry run deployment
./scripts/deploy.sh -e production -c all --dry-run
```

## 🔧 Configuration Management

### Environment Variables

#### Backend (Laravel)
```env
APP_ENV=production
APP_DEBUG=false
DB_CONNECTION=mysql
DB_HOST=your-rds-endpoint
REDIS_HOST=your-elasticache-endpoint
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
```

#### Admin Dashboard (React)
```env
REACT_APP_API_URL=https://api.funlynk.com
REACT_APP_ENV=production
```

### Kubernetes Secrets

Create secrets for sensitive configuration:

```bash
# Database secret
kubectl create secret generic database-secret \
  --from-literal=host=your-rds-endpoint \
  --from-literal=port=3306 \
  --from-literal=database=funlynk_production \
  --from-literal=username=funlynk \
  --from-literal=password=your-password \
  -n funlynk

# Redis secret
kubectl create secret generic redis-secret \
  --from-literal=host=your-elasticache-endpoint \
  --from-literal=port=6379 \
  --from-literal=password=your-redis-password \
  -n funlynk

# Application secrets
kubectl create secret generic app-secrets \
  --from-literal=app-key=your-laravel-key \
  --from-literal=jwt-secret=your-jwt-secret \
  -n funlynk
```

## 📊 Monitoring and Observability

### Metrics Collection

- **Application Metrics**: Custom Laravel metrics
- **Infrastructure Metrics**: Kubernetes and AWS metrics
- **Business Metrics**: User engagement and performance

### Dashboards

Access monitoring dashboards:
- **Grafana**: https://grafana.funlynk.com
- **Prometheus**: https://prometheus.funlynk.com
- **Kibana**: https://kibana.funlynk.com

### Alerting

Critical alerts are configured for:
- High error rates (>5%)
- High response times (>2s)
- Pod crashes and restarts
- Resource exhaustion
- Database connectivity issues

## 🔒 Security

### Container Security

- Non-root user execution
- Minimal base images (Alpine Linux)
- Regular vulnerability scanning
- Image signing and verification

### Network Security

- Network policies for pod-to-pod communication
- Istio service mesh with mTLS
- WAF protection via AWS ALB
- DDoS protection via CloudFlare

### Access Control

- RBAC for Kubernetes resources
- IAM roles for AWS resources
- Service accounts with minimal permissions
- Regular access reviews

## 🚨 Troubleshooting

### Common Issues

1. **Pod Startup Failures**:
```bash
kubectl describe pod <pod-name> -n funlynk
kubectl logs <pod-name> -n funlynk
```

2. **Database Connection Issues**:
```bash
kubectl exec -it <backend-pod> -n funlynk -- php artisan tinker
```

3. **Image Pull Errors**:
```bash
kubectl describe pod <pod-name> -n funlynk
# Check image registry credentials
```

### Health Checks

```bash
# Check all pods
kubectl get pods -n funlynk

# Check services
kubectl get svc -n funlynk

# Check ingress
kubectl get ingress -n funlynk

# Check HPA status
kubectl get hpa -n funlynk
```

## 📞 Support

For deployment issues:
1. Check the troubleshooting section above
2. Review logs in Grafana/Kibana
3. Contact the DevOps team via Slack
4. Create an issue in the repository

## 🔄 Rollback Procedures

### Automatic Rollback

The deployment pipeline includes automatic rollback on:
- Failed health checks
- High error rates post-deployment
- Resource exhaustion

### Manual Rollback

```bash
# Rollback to previous version
kubectl rollout undo deployment/backend -n funlynk

# Rollback to specific revision
kubectl rollout undo deployment/backend --to-revision=2 -n funlynk

# Check rollout status
kubectl rollout status deployment/backend -n funlynk
```

## 📈 Scaling

### Horizontal Pod Autoscaling

HPA is configured to scale based on:
- CPU utilization (70% threshold)
- Memory utilization (80% threshold)
- Custom metrics (request rate, response time)

### Manual Scaling

```bash
# Scale backend deployment
kubectl scale deployment backend --replicas=5 -n funlynk

# Scale admin dashboard
kubectl scale deployment admin-dashboard --replicas=3 -n funlynk
```

## 🔄 Updates and Maintenance

### Regular Maintenance

- **Weekly**: Security updates and patches
- **Monthly**: Dependency updates
- **Quarterly**: Infrastructure reviews and optimizations

### Update Procedures

1. Test updates in staging environment
2. Schedule maintenance windows for production
3. Follow blue-green deployment strategy
4. Monitor post-deployment metrics
5. Have rollback plan ready
