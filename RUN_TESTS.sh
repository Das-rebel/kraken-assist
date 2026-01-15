#!/bin/bash

echo "═══════════════════════════════════════════════════════════════"
echo "  EIGENT EXTENSION - PLAYWRIGHT TEST SUITE"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Check if Playwright is installed
if ! command -v npx &> /dev/null; then
  echo "❌ npx not found. Please install Node.js"
  exit 1
fi

echo "📋 Running Extension Tests..."
echo ""

# Run tests
npx playwright test "$@"

# Check exit code
if [ $? -eq 0 ]; then
  echo ""
  echo "✅ ALL TESTS PASSED!"
  echo ""
  echo "Test Report: test-results/index.html"
  echo ""
  echo "To view report:"
  echo "  open test-results/index.html"
else
  echo ""
  echo "❌ SOME TESTS FAILED"
  echo ""
  echo "Check test-results/index.html for details"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
