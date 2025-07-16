#!/bin/bash

# Funlynk Deployment Script
# This script handles deployment to different environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="staging"
COMPONENT="all"
SKIP_TESTS=false
DRY_RUN=false
VERBOSE=false

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Deploy Funlynk application to specified environment

OPTIONS:
    -e, --environment ENV    Target environment (staging|production) [default: staging]
    -c, --component COMP     Component to deploy (backend|admin-dashboard|mobile|all) [default: all]
    -s, --skip-tests         Skip running tests before deployment
    -d, --dry-run           Show what would be deployed without actually deploying
    -v, --verbose           Enable verbose output
    -h, --help              Show this help message

EXAMPLES:
    $0 -e production -c backend
    $0 --environment staging --component all
    $0 -e production --skip-tests --dry-run

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -c|--component)
            COMPONENT="$2"
            shift 2
            ;;
        -s|--skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
    print_error "Invalid environment: $ENVIRONMENT. Must be 'staging' or 'production'"
    exit 1
fi

# Validate component
if [[ ! "$COMPONENT" =~ ^(backend|admin-dashboard|mobile|all)$ ]]; then
    print_error "Invalid component: $COMPONENT. Must be 'backend', 'admin-dashboard', 'mobile', or 'all'"
    exit 1
fi

# Set verbose mode
if [[ "$VERBOSE" == "true" ]]; then
    set -x
fi

print_status "Starting deployment to $ENVIRONMENT environment"
print_status "Component: $COMPONENT"
print_status "Skip tests: $SKIP_TESTS"
print_status "Dry run: $DRY_RUN"

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if kubectl is installed and configured
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    # Check if docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "docker is not installed or not in PATH"
        exit 1
    fi
    
    # Check if we can connect to the cluster
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    # Check if we're connected to the right cluster
    CURRENT_CONTEXT=$(kubectl config current-context)
    if [[ "$ENVIRONMENT" == "production" && ! "$CURRENT_CONTEXT" =~ production ]]; then
        print_error "Not connected to production cluster. Current context: $CURRENT_CONTEXT"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Run tests
run_tests() {
    if [[ "$SKIP_TESTS" == "true" ]]; then
        print_warning "Skipping tests as requested"
        return
    fi
    
    print_status "Running tests..."
    
    if [[ "$COMPONENT" == "backend" || "$COMPONENT" == "all" ]]; then
        print_status "Running backend tests..."
        cd backend
        composer test
        cd ..
    fi
    
    if [[ "$COMPONENT" == "admin-dashboard" || "$COMPONENT" == "all" ]]; then
        if [[ -d "admin-dashboard" ]]; then
            print_status "Running admin dashboard tests..."
            cd admin-dashboard
            npm test -- --coverage --watchAll=false
            cd ..
        fi
    fi
    
    if [[ "$COMPONENT" == "mobile" || "$COMPONENT" == "all" ]]; then
        if [[ -d "mobile" ]]; then
            print_status "Running mobile tests..."
            cd mobile
            npm test -- --coverage --watchAll=false
            cd ..
        fi
    fi
    
    print_success "All tests passed"
}

# Deploy backend
deploy_backend() {
    print_status "Deploying backend..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        print_status "DRY RUN: Would deploy backend to $ENVIRONMENT"
        return
    fi
    
    # Apply Kubernetes manifests
    kubectl apply -f k8s/namespace.yaml
    kubectl apply -f k8s/backend-deployment.yaml
    kubectl apply -f k8s/backend-hpa.yaml
    
    # Wait for deployment to be ready
    kubectl rollout status deployment/backend -n funlynk --timeout=600s
    
    print_success "Backend deployed successfully"
}

# Deploy admin dashboard
deploy_admin_dashboard() {
    print_status "Deploying admin dashboard..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        print_status "DRY RUN: Would deploy admin dashboard to $ENVIRONMENT"
        return
    fi
    
    # Apply Kubernetes manifests
    kubectl apply -f k8s/admin-dashboard-deployment.yaml
    
    # Wait for deployment to be ready
    kubectl rollout status deployment/admin-dashboard -n funlynk --timeout=300s
    
    print_success "Admin dashboard deployed successfully"
}

# Deploy mobile (placeholder for future implementation)
deploy_mobile() {
    print_status "Mobile deployment not yet implemented"
    print_warning "Mobile apps are deployed through app stores"
}

# Main deployment function
deploy() {
    case $COMPONENT in
        backend)
            deploy_backend
            ;;
        admin-dashboard)
            deploy_admin_dashboard
            ;;
        mobile)
            deploy_mobile
            ;;
        all)
            deploy_backend
            deploy_admin_dashboard
            deploy_mobile
            ;;
    esac
}

# Post-deployment checks
post_deployment_checks() {
    if [[ "$DRY_RUN" == "true" ]]; then
        return
    fi
    
    print_status "Running post-deployment checks..."
    
    # Check if pods are running
    kubectl get pods -n funlynk
    
    # Check service health
    if [[ "$COMPONENT" == "backend" || "$COMPONENT" == "all" ]]; then
        print_status "Checking backend health..."
        # Add health check logic here
    fi
    
    if [[ "$COMPONENT" == "admin-dashboard" || "$COMPONENT" == "all" ]]; then
        print_status "Checking admin dashboard health..."
        # Add health check logic here
    fi
    
    print_success "Post-deployment checks completed"
}

# Main execution
main() {
    check_prerequisites
    run_tests
    deploy
    post_deployment_checks
    
    print_success "Deployment to $ENVIRONMENT completed successfully!"
}

# Run main function
main
