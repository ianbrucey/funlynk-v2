# Task 001: CI/CD Pipeline Setup
**Agent**: Deployment & DevOps Engineer  
**Estimated Time**: 8-9 hours  
**Priority**: High  
**Dependencies**: All backend and frontend code complete  

## Overview
Set up comprehensive CI/CD pipeline for Funlynk platform using GitHub Actions, including automated testing, building, security scanning, and deployment to staging and production environments with proper rollback capabilities.

## Prerequisites
- All application code repositories ready
- GitHub repositories configured
- Cloud infrastructure accounts set up (AWS/GCP/Azure)
- Docker Hub or container registry access
- Environment secrets and configurations prepared

## Step-by-Step Implementation

### Step 1: Repository Structure and Branch Strategy (1.5 hours)

**Set up Git repository structure:**
```
funlynk-v2/
├── .github/
│   ├── workflows/           # GitHub Actions workflows
│   ├── ISSUE_TEMPLATE/      # Issue templates
│   └── PULL_REQUEST_TEMPLATE.md
├── backend/                 # Node.js/Express backend
├── mobile/                  # React Native mobile app
├── admin-dashboard/         # React admin web app
├── docker/                  # Docker configurations
├── infrastructure/          # Infrastructure as Code
├── scripts/                 # Deployment and utility scripts
└── docs/                    # Documentation
```

**Configure branch protection rules:**
```yaml
# .github/branch-protection.yml
protection_rules:
  main:
    required_status_checks:
      strict: true
      contexts:
        - "ci/backend-tests"
        - "ci/frontend-tests"
        - "ci/mobile-tests"
        - "ci/security-scan"
        - "ci/lint-check"
    enforce_admins: true
    required_pull_request_reviews:
      required_approving_review_count: 2
      dismiss_stale_reviews: true
      require_code_owner_reviews: true
    restrictions:
      users: []
      teams: ["core-developers"]
```

**Create CODEOWNERS file:**
```
# .github/CODEOWNERS
# Global owners
* @funlynk/core-team

# Backend specific
/backend/ @funlynk/backend-team
/infrastructure/ @funlynk/devops-team

# Frontend specific
/admin-dashboard/ @funlynk/frontend-team
/mobile/ @funlynk/mobile-team

# DevOps and deployment
/.github/workflows/ @funlynk/devops-team
/docker/ @funlynk/devops-team
/scripts/ @funlynk/devops-team
```

### Step 2: Backend CI/CD Pipeline (2.5 hours)

**Create backend workflow (.github/workflows/backend-ci.yml):**
```yaml
name: Backend CI/CD

on:
  push:
    branches: [main, develop]
    paths: ['backend/**']
  pull_request:
    branches: [main, develop]
    paths: ['backend/**']

env:
  NODE_VERSION: '18.x'
  REGISTRY: ghcr.io
  IMAGE_NAME: funlynk/backend

jobs:
  test:
    name: Test Backend
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: funlynk_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        working-directory: ./backend
        run: npm ci

      - name: Run linting
        working-directory: ./backend
        run: npm run lint

      - name: Run type checking
        working-directory: ./backend
        run: npm run type-check

      - name: Run unit tests
        working-directory: ./backend
        run: npm run test:unit
        env:
          NODE_ENV: test
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/funlynk_test
          REDIS_URL: redis://localhost:6379

      - name: Run integration tests
        working-directory: ./backend
        run: npm run test:integration
        env:
          NODE_ENV: test
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/funlynk_test
          REDIS_URL: redis://localhost:6379

      - name: Generate test coverage
        working-directory: ./backend
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./backend/coverage/lcov.info
          flags: backend
          name: backend-coverage

  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --file=backend/package.json

      - name: Run npm audit
        working-directory: ./backend
        run: npm audit --audit-level=high

  build:
    name: Build and Push Docker Image
    runs-on: ubuntu-latest
    needs: [test, security-scan]
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          file: ./backend/Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop'
    environment: staging
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to staging
        run: |
          echo "Deploying to staging environment"
          # Add actual deployment commands here
        env:
          STAGING_SERVER: ${{ secrets.STAGING_SERVER }}
          STAGING_SSH_KEY: ${{ secrets.STAGING_SSH_KEY }}

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to production
        run: |
          echo "Deploying to production environment"
          # Add actual deployment commands here
        env:
          PRODUCTION_SERVER: ${{ secrets.PRODUCTION_SERVER }}
          PRODUCTION_SSH_KEY: ${{ secrets.PRODUCTION_SSH_KEY }}

      - name: Run smoke tests
        run: |
          echo "Running post-deployment smoke tests"
          # Add smoke test commands here

      - name: Notify deployment success
        uses: 8398a7/action-slack@v3
        with:
          status: success
          text: "Backend deployment to production successful! 🚀"
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Step 3: Frontend CI/CD Pipelines (2.5 hours)

**Create admin dashboard workflow (.github/workflows/admin-dashboard-ci.yml):**
```yaml
name: Admin Dashboard CI/CD

on:
  push:
    branches: [main, develop]
    paths: ['admin-dashboard/**']
  pull_request:
    branches: [main, develop]
    paths: ['admin-dashboard/**']

env:
  NODE_VERSION: '18.x'

jobs:
  test:
    name: Test Admin Dashboard
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: admin-dashboard/package-lock.json

      - name: Install dependencies
        working-directory: ./admin-dashboard
        run: npm ci

      - name: Run linting
        working-directory: ./admin-dashboard
        run: npm run lint

      - name: Run type checking
        working-directory: ./admin-dashboard
        run: npm run type-check

      - name: Run unit tests
        working-directory: ./admin-dashboard
        run: npm run test -- --coverage --watchAll=false

      - name: Run accessibility tests
        working-directory: ./admin-dashboard
        run: npm run test:a11y

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./admin-dashboard/coverage/lcov.info
          flags: admin-dashboard

  build:
    name: Build Admin Dashboard
    runs-on: ubuntu-latest
    needs: test
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: admin-dashboard/package-lock.json

      - name: Install dependencies
        working-directory: ./admin-dashboard
        run: npm ci

      - name: Build application
        working-directory: ./admin-dashboard
        run: npm run build
        env:
          REACT_APP_API_URL: ${{ secrets.REACT_APP_API_URL }}
          REACT_APP_ENV: ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: admin-dashboard-build
          path: admin-dashboard/build/

  deploy:
    name: Deploy Admin Dashboard
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
    
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: admin-dashboard-build
          path: ./build

      - name: Deploy to S3 and CloudFront
        run: |
          # Deploy to AWS S3 and invalidate CloudFront
          aws s3 sync ./build s3://${{ secrets.S3_BUCKET_NAME }} --delete
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_DEFAULT_REGION: ${{ secrets.AWS_DEFAULT_REGION }}
```

**Create mobile app workflow (.github/workflows/mobile-ci.yml):**
```yaml
name: Mobile App CI/CD

on:
  push:
    branches: [main, develop]
    paths: ['mobile/**']
  pull_request:
    branches: [main, develop]
    paths: ['mobile/**']

env:
  NODE_VERSION: '18.x'

jobs:
  test:
    name: Test Mobile App
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: mobile/package-lock.json

      - name: Install dependencies
        working-directory: ./mobile
        run: npm ci

      - name: Run linting
        working-directory: ./mobile
        run: npm run lint

      - name: Run type checking
        working-directory: ./mobile
        run: npm run type-check

      - name: Run unit tests
        working-directory: ./mobile
        run: npm run test -- --coverage --watchAll=false

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./mobile/coverage/lcov.info
          flags: mobile

  build-ios:
    name: Build iOS App
    runs-on: macos-latest
    needs: test
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Install dependencies
        working-directory: ./mobile
        run: npm ci

      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.0'
          bundler-cache: true
          working-directory: mobile/ios

      - name: Install CocoaPods
        working-directory: ./mobile/ios
        run: pod install

      - name: Build iOS app
        working-directory: ./mobile
        run: npx react-native build-ios --mode=Release

  build-android:
    name: Build Android App
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: '11'

      - name: Install dependencies
        working-directory: ./mobile
        run: npm ci

      - name: Build Android app
        working-directory: ./mobile
        run: |
          cd android
          ./gradlew assembleRelease

      - name: Upload Android APK
        uses: actions/upload-artifact@v3
        with:
          name: android-apk
          path: mobile/android/app/build/outputs/apk/release/
```

### Step 4: Quality Gates and Security Integration (1.5 hours)

**Create quality gates workflow (.github/workflows/quality-gates.yml):**
```yaml
name: Quality Gates

on:
  pull_request:
    branches: [main, develop]

jobs:
  code-quality:
    name: Code Quality Analysis
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

      - name: Run CodeQL Analysis
        uses: github/codeql-action/init@v2
        with:
          languages: javascript, typescript

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2

  dependency-check:
    name: Dependency Security Check
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

      - name: OWASP Dependency Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'Funlynk'
          path: '.'
          format: 'HTML'

  license-check:
    name: License Compliance Check
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: License Check
        uses: fossa-contrib/fossa-action@v2
        with:
          api-key: ${{ secrets.FOSSA_API_KEY }}
```

## Acceptance Criteria

### Functional Requirements
- [ ] CI/CD pipeline triggers on code changes and pull requests
- [ ] Automated testing runs for all components (backend, frontend, mobile)
- [ ] Security scanning identifies vulnerabilities before deployment
- [ ] Build artifacts are created and stored properly
- [ ] Deployment to staging and production environments works
- [ ] Rollback capabilities are available for failed deployments
- [ ] Quality gates prevent low-quality code from merging
- [ ] Notifications are sent for build and deployment status

### Technical Requirements
- [ ] GitHub Actions workflows are properly configured
- [ ] Branch protection rules enforce code review and testing
- [ ] Docker images are built and pushed to registry
- [ ] Environment-specific configurations are managed securely
- [ ] Test coverage reporting is integrated
- [ ] Security scanning tools are integrated (Snyk, CodeQL)
- [ ] Code quality analysis is automated (SonarCloud)
- [ ] Dependency vulnerability checking is enabled

### Security Requirements
- [ ] Secrets are properly managed and not exposed in logs
- [ ] Container images are scanned for vulnerabilities
- [ ] Code is analyzed for security issues before deployment
- [ ] Access controls are enforced for deployment environments
- [ ] Audit logs are maintained for all deployments
- [ ] License compliance is checked for all dependencies

### Testing Requirements
- [ ] Unit tests run automatically on all code changes
- [ ] Integration tests validate component interactions
- [ ] End-to-end tests verify complete user workflows
- [ ] Performance tests ensure acceptable response times
- [ ] Security tests validate authentication and authorization
- [ ] Accessibility tests ensure WCAG compliance

## Manual Testing Instructions

### Test Case 1: Pull Request Workflow
1. Create a feature branch and make code changes
2. Open a pull request to develop branch
3. Verify all CI checks run and pass
4. Test that merge is blocked if checks fail
5. Verify code review requirements are enforced
6. Test successful merge after approval

### Test Case 2: Deployment Pipeline
1. Merge changes to develop branch
2. Verify staging deployment triggers automatically
3. Test application functionality in staging environment
4. Merge to main branch for production deployment
5. Verify production deployment and smoke tests
6. Test rollback procedure if needed

### Test Case 3: Security and Quality Gates
1. Introduce a security vulnerability in code
2. Verify security scanning catches the issue
3. Test that deployment is blocked
4. Fix the vulnerability and verify pipeline continues
5. Test code quality thresholds and enforcement

## Environment Configuration

### Required Secrets
```yaml
# GitHub Repository Secrets
SNYK_TOKEN: "snyk-api-token"
SONAR_TOKEN: "sonarcloud-token"
FOSSA_API_KEY: "fossa-license-check-key"
CODECOV_TOKEN: "codecov-upload-token"

# AWS Deployment
AWS_ACCESS_KEY_ID: "aws-access-key"
AWS_SECRET_ACCESS_KEY: "aws-secret-key"
AWS_DEFAULT_REGION: "us-east-1"
S3_BUCKET_NAME: "funlynk-admin-dashboard"
CLOUDFRONT_DISTRIBUTION_ID: "cloudfront-id"

# Server Deployment
STAGING_SERVER: "staging.funlynk.com"
PRODUCTION_SERVER: "api.funlynk.com"
STAGING_SSH_KEY: "staging-server-ssh-key"
PRODUCTION_SSH_KEY: "production-server-ssh-key"

# Notifications
SLACK_WEBHOOK_URL: "slack-webhook-for-notifications"

# Application Configuration
REACT_APP_API_URL: "https://api.funlynk.com"
DATABASE_URL: "postgresql://user:pass@host:port/db"
REDIS_URL: "redis://host:port"
```

### Environment Variables
```bash
# Development
NODE_ENV=development
LOG_LEVEL=debug
ENABLE_CORS=true

# Staging
NODE_ENV=staging
LOG_LEVEL=info
ENABLE_CORS=true

# Production
NODE_ENV=production
LOG_LEVEL=warn
ENABLE_CORS=false
```

## Dependencies and Integration Points

### Required Tools and Services
- GitHub Actions for CI/CD automation
- Docker Hub or GitHub Container Registry
- SonarCloud for code quality analysis
- Snyk for security vulnerability scanning
- Codecov for test coverage reporting
- AWS S3 and CloudFront for frontend hosting
- Slack for deployment notifications

### Infrastructure Dependencies
- Cloud infrastructure setup (Task 003)
- Container orchestration platform
- Database and Redis instances
- Load balancers and CDN configuration
- SSL certificates and domain management

## Completion Checklist

- [ ] Repository structure and branch strategy configured
- [ ] Backend CI/CD pipeline implemented
- [ ] Frontend CI/CD pipelines created
- [ ] Mobile app build pipelines set up
- [ ] Quality gates and security scanning integrated
- [ ] Environment configurations managed
- [ ] Secrets and credentials secured
- [ ] Deployment automation working
- [ ] Rollback procedures tested
- [ ] Monitoring and notifications configured
- [ ] Documentation updated
- [ ] Team training completed

## Notes for Next Tasks
- CI/CD pipeline provides foundation for automated deployment
- Security scanning ensures code quality and vulnerability management
- Quality gates maintain code standards and prevent regressions
- Automated testing reduces manual testing overhead
- Deployment automation enables rapid and reliable releases
- Monitoring integration supports operational excellence
