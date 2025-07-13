# Task 004: Monitoring and Observability
**Agent**: Deployment & DevOps Engineer  
**Estimated Time**: 6-7 hours  
**Priority**: Medium  
**Dependencies**: Agent 8 Task 003 (Infrastructure as Code)  

## Overview
Implement comprehensive monitoring and observability stack for Funlynk platform using Prometheus, Grafana, ELK Stack, and distributed tracing with Jaeger, including alerting, log aggregation, performance monitoring, and SLA tracking.

## Prerequisites
- Infrastructure as Code setup complete (Agent 8 Task 003)
- Kubernetes cluster running and accessible
- Helm package manager installed
- Application metrics endpoints configured
- Log forwarding configured in applications

## Step-by-Step Implementation

### Step 1: Prometheus and Grafana Setup (2.5 hours)

**Create monitoring namespace and RBAC (k8s/monitoring/namespace.yaml):**
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: monitoring
  labels:
    name: monitoring
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: prometheus
  namespace: monitoring
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: prometheus
rules:
- apiGroups: [""]
  resources:
  - nodes
  - nodes/proxy
  - services
  - endpoints
  - pods
  verbs: ["get", "list", "watch"]
- apiGroups:
  - extensions
  resources:
  - ingresses
  verbs: ["get", "list", "watch"]
- nonResourceURLs: ["/metrics"]
  verbs: ["get"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: prometheus
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: prometheus
subjects:
- kind: ServiceAccount
  name: prometheus
  namespace: monitoring
```

**Create Prometheus configuration (k8s/monitoring/prometheus-config.yaml):**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s
    
    rule_files:
      - "/etc/prometheus/rules/*.yml"
    
    alerting:
      alertmanagers:
        - static_configs:
            - targets:
              - alertmanager:9093
    
    scrape_configs:
      # Kubernetes API Server
      - job_name: 'kubernetes-apiservers'
        kubernetes_sd_configs:
        - role: endpoints
        scheme: https
        tls_config:
          ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
        bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
        relabel_configs:
        - source_labels: [__meta_kubernetes_namespace, __meta_kubernetes_service_name, __meta_kubernetes_endpoint_port_name]
          action: keep
          regex: default;kubernetes;https
      
      # Kubernetes Nodes
      - job_name: 'kubernetes-nodes'
        kubernetes_sd_configs:
        - role: node
        scheme: https
        tls_config:
          ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
        bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
        relabel_configs:
        - action: labelmap
          regex: __meta_kubernetes_node_label_(.+)
        - target_label: __address__
          replacement: kubernetes.default.svc:443
        - source_labels: [__meta_kubernetes_node_name]
          regex: (.+)
          target_label: __metrics_path__
          replacement: /api/v1/nodes/${1}/proxy/metrics
      
      # Kubernetes Pods
      - job_name: 'kubernetes-pods'
        kubernetes_sd_configs:
        - role: pod
        relabel_configs:
        - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
          action: keep
          regex: true
        - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
          action: replace
          target_label: __metrics_path__
          regex: (.+)
        - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
          action: replace
          regex: ([^:]+)(?::\d+)?;(\d+)
          replacement: $1:$2
          target_label: __address__
        - action: labelmap
          regex: __meta_kubernetes_pod_label_(.+)
        - source_labels: [__meta_kubernetes_namespace]
          action: replace
          target_label: kubernetes_namespace
        - source_labels: [__meta_kubernetes_pod_name]
          action: replace
          target_label: kubernetes_pod_name
      
      # Funlynk Backend
      - job_name: 'funlynk-backend'
        kubernetes_sd_configs:
        - role: endpoints
          namespaces:
            names:
            - funlynk
        relabel_configs:
        - source_labels: [__meta_kubernetes_service_name]
          action: keep
          regex: backend-service
        - source_labels: [__meta_kubernetes_endpoint_port_name]
          action: keep
          regex: http
        metrics_path: /metrics
        scrape_interval: 30s
      
      # Node Exporter
      - job_name: 'node-exporter'
        kubernetes_sd_configs:
        - role: endpoints
        relabel_configs:
        - source_labels: [__meta_kubernetes_endpoints_name]
          regex: 'node-exporter'
          action: keep
  
  alerting_rules.yml: |
    groups:
    - name: funlynk.rules
      rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"
      
      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency detected"
          description: "95th percentile latency is {{ $value }} seconds"
      
      - alert: PodCrashLooping
        expr: rate(kube_pod_container_status_restarts_total[15m]) > 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Pod is crash looping"
          description: "Pod {{ $labels.pod }} in namespace {{ $labels.namespace }} is crash looping"
      
      - alert: NodeDown
        expr: up{job="kubernetes-nodes"} == 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Node is down"
          description: "Node {{ $labels.instance }} has been down for more than 5 minutes"
      
      - alert: DatabaseConnectionHigh
        expr: pg_stat_activity_count > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High database connections"
          description: "Database has {{ $value }} active connections"
```

**Create Prometheus deployment (k8s/monitoring/prometheus-deployment.yaml):**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
  namespace: monitoring
  labels:
    app: prometheus
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      serviceAccountName: prometheus
      containers:
      - name: prometheus
        image: prom/prometheus:v2.45.0
        args:
          - '--config.file=/etc/prometheus/prometheus.yml'
          - '--storage.tsdb.path=/prometheus/'
          - '--web.console.libraries=/etc/prometheus/console_libraries'
          - '--web.console.templates=/etc/prometheus/consoles'
          - '--storage.tsdb.retention.time=30d'
          - '--web.enable-lifecycle'
          - '--web.enable-admin-api'
        ports:
        - containerPort: 9090
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        volumeMounts:
        - name: prometheus-config-volume
          mountPath: /etc/prometheus/
        - name: prometheus-storage-volume
          mountPath: /prometheus/
        livenessProbe:
          httpGet:
            path: /-/healthy
            port: 9090
          initialDelaySeconds: 30
          timeoutSeconds: 30
        readinessProbe:
          httpGet:
            path: /-/ready
            port: 9090
          initialDelaySeconds: 30
          timeoutSeconds: 30
      volumes:
      - name: prometheus-config-volume
        configMap:
          defaultMode: 420
          name: prometheus-config
      - name: prometheus-storage-volume
        persistentVolumeClaim:
          claimName: prometheus-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: prometheus
  namespace: monitoring
  labels:
    app: prometheus
spec:
  selector:
    app: prometheus
  ports:
  - port: 9090
    targetPort: 9090
    protocol: TCP
  type: ClusterIP
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: prometheus-pvc
  namespace: monitoring
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 50Gi
  storageClassName: gp3
```

**Install Grafana using Helm:**
```bash
# Add Grafana Helm repository
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Create Grafana values file
cat > grafana-values.yaml << EOF
persistence:
  enabled: true
  size: 10Gi
  storageClassName: gp3

adminPassword: "admin123"

datasources:
  datasources.yaml:
    apiVersion: 1
    datasources:
    - name: Prometheus
      type: prometheus
      url: http://prometheus:9090
      access: proxy
      isDefault: true

dashboardProviders:
  dashboardproviders.yaml:
    apiVersion: 1
    providers:
    - name: 'default'
      orgId: 1
      folder: ''
      type: file
      disableDeletion: false
      editable: true
      options:
        path: /var/lib/grafana/dashboards/default

dashboards:
  default:
    kubernetes-cluster:
      gnetId: 7249
      revision: 1
      datasource: Prometheus
    node-exporter:
      gnetId: 1860
      revision: 27
      datasource: Prometheus
    funlynk-backend:
      file: dashboards/funlynk-backend.json

service:
  type: LoadBalancer
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: nlb

resources:
  requests:
    memory: "256Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "200m"
EOF

# Install Grafana
helm install grafana grafana/grafana -n monitoring -f grafana-values.yaml
```

### Step 2: ELK Stack for Log Aggregation (2 hours)

**Create Elasticsearch cluster (k8s/logging/elasticsearch.yaml):**
```yaml
apiVersion: elasticsearch.k8s.elastic.co/v1
kind: Elasticsearch
metadata:
  name: funlynk-logs
  namespace: logging
spec:
  version: 8.8.0
  nodeSets:
  - name: default
    count: 3
    config:
      node.store.allow_mmap: false
      xpack.security.enabled: true
      xpack.security.transport.ssl.enabled: true
      xpack.security.http.ssl.enabled: true
    podTemplate:
      spec:
        containers:
        - name: elasticsearch
          resources:
            requests:
              memory: 2Gi
              cpu: 1
            limits:
              memory: 4Gi
              cpu: 2
          env:
          - name: ES_JAVA_OPTS
            value: "-Xms2g -Xmx2g"
    volumeClaimTemplates:
    - metadata:
        name: elasticsearch-data
      spec:
        accessModes:
        - ReadWriteOnce
        resources:
          requests:
            storage: 100Gi
        storageClassName: gp3
---
apiVersion: kibana.k8s.elastic.co/v1
kind: Kibana
metadata:
  name: funlynk-kibana
  namespace: logging
spec:
  version: 8.8.0
  count: 1
  elasticsearchRef:
    name: funlynk-logs
  config:
    server.publicBaseUrl: "https://kibana.funlynk.com"
  http:
    service:
      spec:
        type: LoadBalancer
        ports:
        - port: 5601
          targetPort: 5601
  podTemplate:
    spec:
      containers:
      - name: kibana
        resources:
          requests:
            memory: 1Gi
            cpu: 500m
          limits:
            memory: 2Gi
            cpu: 1
```

**Create Filebeat configuration (k8s/logging/filebeat.yaml):**
```yaml
apiVersion: beat.k8s.elastic.co/v1beta1
kind: Beat
metadata:
  name: funlynk-filebeat
  namespace: logging
spec:
  type: filebeat
  version: 8.8.0
  elasticsearchRef:
    name: funlynk-logs
  config:
    filebeat.inputs:
    - type: container
      paths:
      - /var/log/containers/*.log
      processors:
      - add_kubernetes_metadata:
          host: ${NODE_NAME}
          matchers:
          - logs_path:
              logs_path: "/var/log/containers/"
      - drop_event:
          when:
            or:
            - contains:
                kubernetes.container.name: "filebeat"
            - contains:
                kubernetes.container.name: "metricbeat"

    processors:
    - add_host_metadata: {}
    - add_docker_metadata: {}
    - decode_json_fields:
        fields: ["message"]
        target: "json"
        overwrite_keys: true

    output.elasticsearch:
      hosts: ["funlynk-logs-es-http:9200"]
      username: "elastic"
      password: "${ELASTICSEARCH_PASSWORD}"
      ssl.certificate_authorities: ["/mnt/elastic/tls.crt"]
      index: "funlynk-logs-%{+yyyy.MM.dd}"

    setup.template.name: "funlynk-logs"
    setup.template.pattern: "funlynk-logs-*"
    setup.ilm.enabled: true
    setup.ilm.rollover_alias: "funlynk-logs"
    setup.ilm.pattern: "{now/d}-000001"
    setup.ilm.policy: |
      {
        "policy": {
          "phases": {
            "hot": {
              "actions": {
                "rollover": {
                  "max_size": "5GB",
                  "max_age": "1d"
                }
              }
            },
            "warm": {
              "min_age": "7d",
              "actions": {
                "allocate": {
                  "number_of_replicas": 0
                }
              }
            },
            "delete": {
              "min_age": "30d"
            }
          }
        }
      }

  daemonSet:
    podTemplate:
      spec:
        serviceAccountName: filebeat
        terminationGracePeriodSeconds: 30
        hostNetwork: true
        dnsPolicy: ClusterFirstWithHostNet
        containers:
        - name: filebeat
          securityContext:
            runAsUser: 0
          volumeMounts:
          - name: varlogcontainers
            mountPath: /var/log/containers
            readOnly: true
          - name: varlogpods
            mountPath: /var/log/pods
            readOnly: true
          - name: varlibdockercontainers
            mountPath: /var/lib/docker/containers
            readOnly: true
          env:
          - name: NODE_NAME
            valueFrom:
              fieldRef:
                fieldPath: spec.nodeName
          - name: ELASTICSEARCH_PASSWORD
            valueFrom:
              secretKeyRef:
                name: funlynk-logs-es-elastic-user
                key: elastic
        volumes:
        - name: varlogcontainers
          hostPath:
            path: /var/log/containers
        - name: varlogpods
          hostPath:
            path: /var/log/pods
        - name: varlibdockercontainers
          hostPath:
            path: /var/lib/docker/containers
```

### Step 3: Distributed Tracing with Jaeger (1 hour)

**Install Jaeger using Helm:**
```bash
# Add Jaeger Helm repository
helm repo add jaegertracing https://jaegertracing.github.io/helm-charts
helm repo update

# Create Jaeger values file
cat > jaeger-values.yaml << EOF
provisionDataStore:
  cassandra: false
  elasticsearch: true

storage:
  type: elasticsearch
  elasticsearch:
    host: funlynk-logs-es-http.logging.svc.cluster.local
    port: 9200
    scheme: https
    user: elastic
    password: "elasticsearch-password"
    tls:
      ca: /etc/ssl/certs/tls.crt

agent:
  enabled: true
  daemonset:
    useHostPort: true

collector:
  enabled: true
  replicaCount: 2
  resources:
    requests:
      memory: "256Mi"
      cpu: "100m"
    limits:
      memory: "512Mi"
      cpu: "200m"

query:
  enabled: true
  replicaCount: 2
  service:
    type: LoadBalancer
  resources:
    requests:
      memory: "256Mi"
      cpu: "100m"
    limits:
      memory: "512Mi"
      cpu: "200m"

hotrod:
  enabled: false
EOF

# Install Jaeger
helm install jaeger jaegertracing/jaeger -n monitoring -f jaeger-values.yaml
```

### Step 4: Alerting and Notification Setup (0.5 hours)

**Create AlertManager configuration (k8s/monitoring/alertmanager.yaml):**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: alertmanager-config
  namespace: monitoring
data:
  alertmanager.yml: |
    global:
      smtp_smarthost: 'smtp.gmail.com:587'
      smtp_from: 'alerts@funlynk.com'
      smtp_auth_username: 'alerts@funlynk.com'
      smtp_auth_password: 'app-password'

    route:
      group_by: ['alertname']
      group_wait: 10s
      group_interval: 10s
      repeat_interval: 1h
      receiver: 'web.hook'
      routes:
      - match:
          severity: critical
        receiver: 'critical-alerts'
      - match:
          severity: warning
        receiver: 'warning-alerts'

    receivers:
    - name: 'web.hook'
      webhook_configs:
      - url: 'http://localhost:5001/'

    - name: 'critical-alerts'
      email_configs:
      - to: 'devops@funlynk.com'
        subject: 'CRITICAL: {{ .GroupLabels.alertname }}'
        body: |
          {{ range .Alerts }}
          Alert: {{ .Annotations.summary }}
          Description: {{ .Annotations.description }}
          {{ end }}
      slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
        channel: '#alerts-critical'
        title: 'CRITICAL Alert'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'

    - name: 'warning-alerts'
      email_configs:
      - to: 'team@funlynk.com'
        subject: 'WARNING: {{ .GroupLabels.alertname }}'
        body: |
          {{ range .Alerts }}
          Alert: {{ .Annotations.summary }}
          Description: {{ .Annotations.description }}
          {{ end }}
      slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
        channel: '#alerts-warning'
        title: 'Warning Alert'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: alertmanager
  namespace: monitoring
spec:
  replicas: 1
  selector:
    matchLabels:
      app: alertmanager
  template:
    metadata:
      labels:
        app: alertmanager
    spec:
      containers:
      - name: alertmanager
        image: prom/alertmanager:v0.25.0
        args:
          - '--config.file=/etc/alertmanager/alertmanager.yml'
          - '--storage.path=/alertmanager'
          - '--web.external-url=http://alertmanager.funlynk.com'
        ports:
        - containerPort: 9093
        resources:
          requests:
            memory: "128Mi"
            cpu: "50m"
          limits:
            memory: "256Mi"
            cpu: "100m"
        volumeMounts:
        - name: alertmanager-config
          mountPath: /etc/alertmanager
        - name: alertmanager-storage
          mountPath: /alertmanager
      volumes:
      - name: alertmanager-config
        configMap:
          name: alertmanager-config
      - name: alertmanager-storage
        emptyDir: {}
---
apiVersion: v1
kind: Service
metadata:
  name: alertmanager
  namespace: monitoring
spec:
  selector:
    app: alertmanager
  ports:
  - port: 9093
    targetPort: 9093
  type: ClusterIP
```

## Acceptance Criteria

### Functional Requirements
- [ ] Prometheus collects metrics from all application components
- [ ] Grafana displays comprehensive dashboards and visualizations
- [ ] ELK stack aggregates and indexes logs from all services
- [ ] Jaeger provides distributed tracing across microservices
- [ ] AlertManager sends notifications for critical issues
- [ ] Monitoring data is retained according to policy
- [ ] Dashboards provide real-time and historical views
- [ ] Alerting rules cover all critical system metrics

### Technical Requirements
- [ ] Monitoring stack is highly available and scalable
- [ ] Data retention policies are properly configured
- [ ] Security is implemented for all monitoring components
- [ ] Performance impact on applications is minimal
- [ ] Storage requirements are optimized
- [ ] Backup and recovery procedures are in place
- [ ] Integration with cloud provider monitoring services
- [ ] Cost optimization strategies are implemented

### Operational Requirements
- [ ] Runbooks are created for common issues
- [ ] SLA monitoring and reporting are configured
- [ ] Capacity planning metrics are available
- [ ] Performance baselines are established
- [ ] Incident response procedures are defined
- [ ] Documentation is comprehensive and up-to-date
- [ ] Team training on monitoring tools is completed
- [ ] On-call procedures and escalation paths are defined

## Manual Testing Instructions

### Test Case 1: Metrics Collection and Visualization
1. Verify Prometheus is collecting metrics from all targets
2. Test Grafana dashboards display correct data
3. Verify custom application metrics are available
4. Test dashboard responsiveness and performance
5. Verify data retention and storage policies

### Test Case 2: Log Aggregation and Search
1. Verify logs are being collected from all applications
2. Test log search and filtering in Kibana
3. Verify log parsing and field extraction
4. Test log retention and archival policies
5. Verify log-based alerting functionality

### Test Case 3: Distributed Tracing
1. Generate application traffic and verify traces
2. Test trace visualization in Jaeger UI
3. Verify trace sampling and retention
4. Test performance impact of tracing
5. Verify trace correlation with logs and metrics

### Test Case 4: Alerting and Notifications
1. Trigger test alerts and verify notifications
2. Test alert routing and escalation
3. Verify alert suppression and grouping
4. Test notification channels (email, Slack)
5. Verify alert resolution and acknowledgment

## Dependencies and Integration Points

### Required Infrastructure (from Task 003)
- Kubernetes cluster with sufficient resources
- Persistent storage for metrics and logs
- Load balancers for external access
- Network policies for security
- DNS configuration for service discovery

### Application Integration Requirements
- Metrics endpoints in all applications
- Structured logging with proper formats
- Distributed tracing instrumentation
- Health check endpoints
- Error handling and reporting

### External Service Integration
- SMTP server for email notifications
- Slack workspace for chat notifications
- DNS provider for external access
- SSL certificate management
- Cloud provider monitoring services

## Completion Checklist

- [ ] Prometheus deployed and configured
- [ ] Grafana installed with dashboards
- [ ] ELK stack deployed and configured
- [ ] Jaeger tracing system operational
- [ ] AlertManager configured with notification channels
- [ ] Custom dashboards created for Funlynk metrics
- [ ] Log parsing and indexing configured
- [ ] Alerting rules defined and tested
- [ ] Data retention policies implemented
- [ ] Security configurations applied
- [ ] Performance testing completed
- [ ] Documentation and runbooks created
- [ ] Team training completed
- [ ] Monitoring validation completed

## Notes for Next Tasks
- Monitoring and observability complete the DevOps infrastructure
- Comprehensive visibility into system health and performance
- Proactive alerting enables rapid incident response
- Log aggregation supports debugging and troubleshooting
- Distributed tracing helps identify performance bottlenecks
- Metrics and dashboards support capacity planning and optimization
