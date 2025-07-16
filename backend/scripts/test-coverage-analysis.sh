#!/bin/bash

# Test Coverage Analysis Script for FunLynk Backend
# This script runs comprehensive test coverage analysis and generates reports

set -e

echo "🧪 FunLynk Backend Test Coverage Analysis"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create coverage directory if it doesn't exist
mkdir -p build/coverage

echo -e "${BLUE}📊 Running PHPUnit with coverage...${NC}"

# Run PHPUnit with coverage
vendor/bin/phpunit \
    --coverage-html build/coverage/html \
    --coverage-text \
    --coverage-clover build/coverage/clover.xml \
    --log-junit build/coverage/junit.xml \
    --testdox-html build/coverage/testdox.html \
    --testdox-text build/coverage/testdox.txt

echo -e "${GREEN}✅ Coverage reports generated!${NC}"

# Check if coverage meets minimum threshold
echo -e "${BLUE}📈 Analyzing coverage results...${NC}"

# Extract coverage percentage from clover.xml
if [ -f "build/coverage/clover.xml" ]; then
    COVERAGE=$(php -r "
        \$xml = simplexml_load_file('build/coverage/clover.xml');
        \$metrics = \$xml->project->metrics;
        \$statements = (int)\$metrics['statements'];
        \$coveredstatements = (int)\$metrics['coveredstatements'];
        if (\$statements > 0) {
            echo round((\$coveredstatements / \$statements) * 100, 2);
        } else {
            echo '0';
        }
    ")
    
    echo -e "${BLUE}Current Coverage: ${COVERAGE}%${NC}"
    
    # Check if coverage meets 90% threshold
    if (( $(echo "$COVERAGE >= 90" | bc -l) )); then
        echo -e "${GREEN}✅ Coverage meets 90% threshold!${NC}"
    else
        echo -e "${YELLOW}⚠️  Coverage is below 90% threshold${NC}"
        echo -e "${YELLOW}   Target: 90%, Current: ${COVERAGE}%${NC}"
    fi
else
    echo -e "${RED}❌ Could not find coverage report${NC}"
fi

# Generate coverage summary
echo -e "${BLUE}📋 Coverage Summary:${NC}"
echo "==================="

if [ -f "build/coverage/testdox.txt" ]; then
    echo -e "${BLUE}Test Documentation:${NC}"
    head -20 build/coverage/testdox.txt
    echo ""
fi

# List coverage files generated
echo -e "${BLUE}📁 Generated Files:${NC}"
echo "- HTML Report: build/coverage/html/index.html"
echo "- Clover XML: build/coverage/clover.xml"
echo "- JUnit XML: build/coverage/junit.xml"
echo "- Test Documentation: build/coverage/testdox.html"

# Check for missing test coverage
echo -e "${BLUE}🔍 Checking for missing coverage...${NC}"

# Find PHP files that might need tests
echo -e "${YELLOW}Controllers without tests:${NC}"
find app/Http/Controllers -name "*.php" -type f | while read -r file; do
    controller_name=$(basename "$file" .php)
    test_file="tests/Feature/*/${controller_name}Test.php"
    if ! ls $test_file 1> /dev/null 2>&1; then
        echo "  - $file"
    fi
done

echo -e "${YELLOW}Models without tests:${NC}"
find app/Models -name "*.php" -type f | while read -r file; do
    model_name=$(basename "$file" .php)
    test_file="tests/Unit/Models/${model_name}Test.php"
    if [ ! -f "$test_file" ]; then
        echo "  - $file"
    fi
done

echo -e "${YELLOW}Services without tests:${NC}"
find app/Services -name "*.php" -type f 2>/dev/null | while read -r file; do
    service_name=$(basename "$file" .php)
    test_file="tests/Unit/Services/${service_name}Test.php"
    if [ ! -f "$test_file" ]; then
        echo "  - $file"
    fi
done || echo "  No services directory found"

echo ""
echo -e "${GREEN}🎉 Coverage analysis complete!${NC}"
echo -e "${BLUE}Open build/coverage/html/index.html in your browser to view detailed coverage report${NC}"
