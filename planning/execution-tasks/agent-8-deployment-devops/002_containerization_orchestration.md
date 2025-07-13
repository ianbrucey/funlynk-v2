# Task 002: Containerization and Orchestration
**Agent**: Deployment & DevOps Engineer  
**Estimated Time**: 7-8 hours  
**Priority**: High  
**Dependencies**: Agent 8 Task 001 (CI/CD Pipeline Setup)  

## Overview
Implement comprehensive containerization strategy using Docker and orchestration with Kubernetes for Funlynk platform, including multi-stage builds, security hardening, service mesh configuration, and auto-scaling capabilities.

## Prerequisites
- CI/CD pipeline setup complete (Agent 8 Task 001)
- Application code repositories ready
- Kubernetes cluster access or setup
- Container registry configured
- Infrastructure networking configured

## Step-by-Step Implementation

### Step 1: Docker Configuration and Multi-Stage Builds (2.5 hours)

**Create backend Dockerfile (backend/Dockerfile):**
```dockerfile
# Multi-stage build for Node.js backend
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM node:18-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production

# Production stage
FROM node:18-alpine AS production
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app

# Copy built application
COPY --from=build --chown=nodejs:nodejs /app/dist ./dist
COPY --from=build --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nodejs:nodejs /app/package.json ./package.json

# Security hardening
RUN apk add --no-cache dumb-init
RUN rm -rf /var/cache/apk/*

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
```

**Create admin dashboard Dockerfile (admin-dashboard/Dockerfile):**
```dockerfile
# Multi-stage build for React admin dashboard
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=build /app/build /usr/share/nginx/html

# Add non-root user
RUN addgroup -g 1001 -S nginx
RUN adduser -S nginx -u 1001

# Security hardening
RUN apk add --no-cache dumb-init
RUN rm -rf /var/cache/apk/*

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

USER nginx

ENTRYPOINT ["dumb-init", "--"]
CMD ["nginx", "-g", "daemon off;"]
```

**Create nginx configuration (admin-dashboard/nginx.conf):**
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Security
        location ~ /\. {
            deny all;
        }
    }
}
```

**Create Docker Compose for development (docker-compose.yml):**
```yaml
version: '3.8'

services:
  # Backend API
  backend:
    build:
      context: ./backend
      target: development
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/funlynk_dev
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - postgres
      - redis
    networks:
      - funlynk-network

  # Admin Dashboard
  admin-dashboard:
    build:
      context: ./admin-dashboard
      target: development
    ports:
      - "3001:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:3000
    volumes:
      - ./admin-dashboard:/app
      - /app/node_modules
    networks:
      - funlynk-network

  # PostgreSQL Database
  postgres:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=funlynk_dev
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    networks:
      - funlynk-network

  # Redis Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - funlynk-network

  # Nginx Load Balancer
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - admin-dashboard
    networks:
      - funlynk-network

volumes:
  postgres_data:
  redis_data:

networks:
  funlynk-network:
    driver: bridge
```

### Step 2: Kubernetes Deployment Configuration (2.5 hours)

**Create namespace and resource quotas (k8s/namespace.yaml):**
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: funlynk
  labels:
    name: funlynk
---
apiVersion: v1
kind: ResourceQuota
metadata:
  name: funlynk-quota
  namespace: funlynk
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
    persistentvolumeclaims: "10"
    services: "10"
    secrets: "20"
    configmaps: "20"
```

**Create backend deployment (k8s/backend-deployment.yaml):**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: funlynk
  labels:
    app: backend
    version: v1
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
        version: v1
    spec:
      serviceAccountName: funlynk-backend
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
      containers:
      - name: backend
        image: ghcr.io/funlynk/backend:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 3000
          name: http
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: redis-secret
              key: url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        volumeMounts:
        - name: app-config
          mountPath: /app/config
          readOnly: true
      volumes:
      - name: app-config
        configMap:
          name: backend-config
      imagePullSecrets:
      - name: ghcr-secret
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: funlynk
  labels:
    app: backend
spec:
  selector:
    app: backend
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
    name: http
  type: ClusterIP
```

**Create horizontal pod autoscaler (k8s/backend-hpa.yaml):**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: funlynk
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
      - type: Pods
        value: 4
        periodSeconds: 15
      selectPolicy: Max
```

### Step 3: Service Mesh and Ingress Configuration (1.5 hours)

**Create Istio service mesh configuration (k8s/istio-config.yaml):**
```yaml
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  name: funlynk-gateway
  namespace: funlynk
spec:
  selector:
    istio: ingressgateway
  servers:
  - port:
      number: 80
      name: http
      protocol: HTTP
    hosts:
    - api.funlynk.com
    - admin.funlynk.com
    tls:
      httpsRedirect: true
  - port:
      number: 443
      name: https
      protocol: HTTPS
    tls:
      mode: SIMPLE
      credentialName: funlynk-tls-secret
    hosts:
    - api.funlynk.com
    - admin.funlynk.com
---
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: funlynk-vs
  namespace: funlynk
spec:
  hosts:
  - api.funlynk.com
  - admin.funlynk.com
  gateways:
  - funlynk-gateway
  http:
  - match:
    - uri:
        prefix: /api/
    - headers:
        host:
          exact: api.funlynk.com
    route:
    - destination:
        host: backend-service
        port:
          number: 80
    timeout: 30s
    retries:
      attempts: 3
      perTryTimeout: 10s
  - match:
    - headers:
        host:
          exact: admin.funlynk.com
    route:
    - destination:
        host: admin-dashboard-service
        port:
          number: 80
---
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: funlynk
spec:
  mtls:
    mode: STRICT
---
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: backend-authz
  namespace: funlynk
spec:
  selector:
    matchLabels:
      app: backend
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/istio-system/sa/istio-ingressgateway-service-account"]
  - to:
    - operation:
        methods: ["GET", "POST", "PUT", "DELETE"]
```

**Create network policies (k8s/network-policies.yaml):**
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-netpol
  namespace: funlynk
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: istio-system
    - podSelector:
        matchLabels:
          app: admin-dashboard
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: kube-system
    ports:
    - protocol: TCP
      port: 53
    - protocol: UDP
      port: 53
  - to:
    - podSelector:
        matchLabels:
          app: postgres
    ports:
    - protocol: TCP
      port: 5432
  - to:
    - podSelector:
        matchLabels:
          app: redis
    ports:
    - protocol: TCP
      port: 6379
```

### Step 4: Monitoring and Observability Integration (1.5 hours)

**Create monitoring configuration (k8s/monitoring.yaml):**
```yaml
apiVersion: v1
kind: ServiceMonitor
metadata:
  name: backend-metrics
  namespace: funlynk
  labels:
    app: backend
spec:
  selector:
    matchLabels:
      app: backend
  endpoints:
  - port: http
    path: /metrics
    interval: 30s
    scrapeTimeout: 10s
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-dashboards
  namespace: funlynk
data:
  funlynk-dashboard.json: |
    {
      "dashboard": {
        "title": "Funlynk Platform Metrics",
        "panels": [
          {
            "title": "Request Rate",
            "type": "graph",
            "targets": [
              {
                "expr": "rate(http_requests_total{job=\"backend\"}[5m])",
                "legendFormat": "{{method}} {{status}}"
              }
            ]
          },
          {
            "title": "Response Time",
            "type": "graph",
            "targets": [
              {
                "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job=\"backend\"}[5m]))",
                "legendFormat": "95th percentile"
              }
            ]
          },
          {
            "title": "Error Rate",
            "type": "graph",
            "targets": [
              {
                "expr": "rate(http_requests_total{job=\"backend\",status=~\"5..\"}[5m])",
                "legendFormat": "5xx errors"
              }
            ]
          }
        ]
      }
    }
---
apiVersion: logging.coreos.com/v1
kind: ClusterLogForwarder
metadata:
  name: funlynk-logs
  namespace: openshift-logging
spec:
  outputs:
  - name: elasticsearch-funlynk
    type: elasticsearch
    url: https://elasticsearch.funlynk.com:9200
    secret:
      name: elasticsearch-secret
  pipelines:
  - name: funlynk-app-logs
    inputRefs:
    - application
    filterRefs:
    - funlynk-filter
    outputRefs:
    - elasticsearch-funlynk
```

## Acceptance Criteria

### Functional Requirements
- [ ] Docker containers build successfully for all components
- [ ] Multi-stage builds optimize image sizes and security
- [ ] Kubernetes deployments run reliably with proper resource limits
- [ ] Auto-scaling works based on CPU and memory metrics
- [ ] Service mesh provides secure communication between services
- [ ] Load balancing distributes traffic effectively
- [ ] Health checks and readiness probes function correctly
- [ ] Rolling updates deploy without downtime

### Technical Requirements
- [ ] Container images follow security best practices
- [ ] Kubernetes manifests are properly structured and validated
- [ ] Resource quotas and limits are appropriately configured
- [ ] Network policies restrict traffic appropriately
- [ ] Service discovery works correctly within the cluster
- [ ] Persistent volumes are configured for stateful services
- [ ] Secrets and ConfigMaps manage configuration securely
- [ ] Monitoring and logging capture relevant metrics

### Security Requirements
- [ ] Containers run as non-root users
- [ ] Image vulnerability scanning is integrated
- [ ] Network segmentation is properly implemented
- [ ] mTLS is enabled for service-to-service communication
- [ ] RBAC controls access to Kubernetes resources
- [ ] Secrets are encrypted at rest and in transit
- [ ] Security policies are enforced at runtime
- [ ] Container runtime security is configured

### Performance Requirements
- [ ] Container startup times are optimized
- [ ] Resource utilization is efficient
- [ ] Auto-scaling responds appropriately to load
- [ ] Network latency between services is minimized
- [ ] Storage performance meets application requirements
- [ ] Memory and CPU limits prevent resource exhaustion
- [ ] Load balancing algorithms optimize performance

## Manual Testing Instructions

### Test Case 1: Container Deployment
1. Build Docker images for all components
2. Test containers run correctly in isolation
3. Verify multi-stage builds produce optimized images
4. Test container security and user permissions
5. Validate health checks and monitoring endpoints
6. Test container restart and recovery scenarios

### Test Case 2: Kubernetes Orchestration
1. Deploy applications to Kubernetes cluster
2. Test service discovery and communication
3. Verify auto-scaling behavior under load
4. Test rolling updates and rollback procedures
5. Validate resource limits and quotas
6. Test persistent volume functionality

### Test Case 3: Service Mesh and Security
1. Test mTLS communication between services
2. Verify network policies block unauthorized traffic
3. Test ingress and egress traffic routing
4. Validate authentication and authorization policies
5. Test certificate management and rotation
6. Verify security scanning and compliance

### Test Case 4: Monitoring and Observability
1. Verify metrics collection and visualization
2. Test log aggregation and searching
3. Validate alerting rules and notifications
4. Test distributed tracing functionality
5. Verify performance monitoring accuracy
6. Test dashboard functionality and usability

## Dependencies and Integration Points

### Required Infrastructure (from Task 003)
- Kubernetes cluster setup and configuration
- Container registry for image storage
- Load balancers and ingress controllers
- Persistent storage solutions
- Network infrastructure and security groups

### Monitoring Stack Integration
- Prometheus for metrics collection
- Grafana for visualization and dashboards
- Elasticsearch for log aggregation
- Jaeger for distributed tracing
- AlertManager for notification management

### Security Tools Integration
- Falco for runtime security monitoring
- OPA Gatekeeper for policy enforcement
- Twistlock/Prisma for container security
- Vault for secrets management
- Cert-manager for certificate automation

## Completion Checklist

- [ ] Docker configurations created and tested
- [ ] Multi-stage builds implemented and optimized
- [ ] Kubernetes manifests created and validated
- [ ] Service mesh configuration deployed
- [ ] Auto-scaling policies configured and tested
- [ ] Network policies implemented and verified
- [ ] Monitoring and observability integrated
- [ ] Security policies enforced
- [ ] Performance testing completed
- [ ] Documentation updated
- [ ] Team training provided
- [ ] Runbooks created for operations

## Notes for Next Tasks
- Containerization provides foundation for scalable deployment
- Kubernetes orchestration enables automated operations
- Service mesh enhances security and observability
- Auto-scaling ensures performance under varying loads
- Monitoring integration supports operational excellence
- Security hardening protects against threats and vulnerabilities
