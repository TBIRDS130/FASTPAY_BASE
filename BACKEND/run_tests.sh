#!/bin/bash
# Unified Backend Test Runner
# Runs Django tests with coverage reporting and optional Docker setup

set -e

COVERAGE=false
DOCKER=false
VERBOSE=false
PARALLEL=false
KEEP_DB=false
TEST_PATTERN=""
FAILFAST=false

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --coverage          Generate coverage report"
    echo "  --docker            Run tests in Docker"
    echo "  --verbose           Verbose output"
    echo "  --parallel          Run tests in parallel"
    echo "  --keep-db           Keep test database"
    echo "  --pattern PATTERN   Run tests matching pattern"
    echo "  --failfast          Stop on first failure"
    echo "  --help              Show this help"
    exit 1
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --coverage)
            COVERAGE=true
            shift
            ;;
        --docker)
            DOCKER=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --parallel)
            PARALLEL=true
            shift
            ;;
        --keep-db)
            KEEP_DB=true
            shift
            ;;
        --pattern)
            TEST_PATTERN="$2"
            shift 2
            ;;
        --failfast)
            FAILFAST=true
            shift
            ;;
        --help)
            usage
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            usage
            ;;
    esac
done

echo ""
echo -e "${BLUE}🧪 Backend Test Runner${NC}"
echo "=========================="
echo ""

# Check if we're in Docker or should use Docker
if [ "$DOCKER" = true ]; then
    echo -e "${BLUE}🐳 Running tests in Docker...${NC}"
    
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ docker-compose not found!${NC}"
        exit 1
    fi
    
    # Build test command
    TEST_CMD="python manage.py test"
    
    if [ "$COVERAGE" = true ]; then
        TEST_CMD="coverage run --source='.' manage.py test"
    fi
    
    if [ -n "$TEST_PATTERN" ]; then
        TEST_CMD="$TEST_CMD $TEST_PATTERN"
    fi
    
    if [ "$FAILFAST" = true ]; then
        TEST_CMD="$TEST_CMD --failfast"
    fi
    
    if [ "$KEEP_DB" = true ]; then
        TEST_CMD="$TEST_CMD --keepdb"
    fi
    
    if [ "$VERBOSE" = true ]; then
        TEST_CMD="$TEST_CMD --verbosity=2"
    fi
    
    # Run in Docker
    docker-compose exec -T web bash -c "$TEST_CMD"
    
    # Generate coverage if requested
    if [ "$COVERAGE" = true ]; then
        echo ""
        echo -e "${BLUE}📊 Generating coverage report...${NC}"
        docker-compose exec -T web bash -c "coverage report && coverage html"
        echo -e "${GREEN}✅ Coverage report generated in htmlcov/index.html${NC}"
    fi
    
    exit 0
fi

# Check if Django is available
if ! python manage.py --version &> /dev/null; then
    echo -e "${RED}❌ Django not found!${NC}"
    echo "Please activate virtual environment or install dependencies"
    exit 1
fi

# Check for coverage
if [ "$COVERAGE" = true ]; then
    if ! command -v coverage &> /dev/null; then
        echo -e "${YELLOW}⚠️  coverage not installed, installing...${NC}"
        pip install coverage
    fi
fi

# Build test command
TEST_CMD="python manage.py test"

if [ "$COVERAGE" = true ]; then
    TEST_CMD="coverage run --source='api' --omit='*/migrations/*,*/tests/*,*/venv/*' manage.py test"
fi

if [ -n "$TEST_PATTERN" ]; then
    TEST_CMD="$TEST_CMD $TEST_PATTERN"
fi

if [ "$FAILFAST" = true ]; then
    TEST_CMD="$TEST_CMD --failfast"
fi

if [ "$KEEP_DB" = true ]; then
    TEST_CMD="$TEST_CMD --keepdb"
fi

if [ "$VERBOSE" = true ]; then
    TEST_CMD="$TEST_CMD --verbosity=2"
else
    TEST_CMD="$TEST_CMD --verbosity=1"
fi

# Run tests
echo -e "${BLUE}🧪 Running tests...${NC}"
START_TIME=$(date +%s)

if eval $TEST_CMD; then
    TEST_TIME=$(($(date +%s) - START_TIME))
    echo ""
    echo -e "${GREEN}✅ Tests passed! (${TEST_TIME}s)${NC}"
    
    # Generate coverage if requested
    if [ "$COVERAGE" = true ]; then
        echo ""
        echo -e "${BLUE}📊 Generating coverage report...${NC}"
        coverage report
        coverage html
        echo ""
        COVERAGE_HTML="htmlcov/index.html"
        if [ -f "$COVERAGE_HTML" ]; then
            echo -e "${GREEN}✅ Coverage report generated!${NC}"
            echo -e "${GREEN}   📄 Report: $COVERAGE_HTML${NC}"
            # Try to open in browser
            if command -v xdg-open &> /dev/null; then
                echo -e "${BLUE}   Opening coverage report in browser...${NC}"
                xdg-open "$COVERAGE_HTML" 2>/dev/null || true
            fi
        fi
    fi
    
    echo ""
    echo -e "${GREEN}=================================="
    echo "✅ All tests passed!"
    echo "==================================${NC}"
    exit 0
else
    TEST_TIME=$(($(date +%s) - START_TIME))
    echo ""
    echo -e "${RED}❌ Tests failed! (${TEST_TIME}s)${NC}"
    exit 1
fi
