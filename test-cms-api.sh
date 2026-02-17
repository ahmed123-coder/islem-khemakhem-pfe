#!/bin/bash

# CMS API Test Script
# This script demonstrates the CMS functionality

echo "🧪 Testing CMS API Endpoints"
echo "================================"
echo ""

BASE_URL="http://localhost:3000"

# Test 1: GET Navbar Content (Public)
echo "📋 Test 1: GET /api/content/navbar (Public)"
echo "-------------------------------------------"
curl -s "$BASE_URL/api/content/navbar" | jq '.'
echo ""
echo ""

# Test 2: GET Hero Content (Public)
echo "🦸 Test 2: GET /api/content/hero (Public)"
echo "-------------------------------------------"
curl -s "$BASE_URL/api/content/hero" | jq '.'
echo ""
echo ""

# Test 3: GET Footer Content (Public)
echo "👣 Test 3: GET /api/content/footer (Public)"
echo "-------------------------------------------"
curl -s "$BASE_URL/api/content/footer" | jq '.'
echo ""
echo ""

# Test 4: GET Non-existent Content (Should return 404)
echo "❌ Test 4: GET /api/content/nonexistent (Should fail)"
echo "-------------------------------------------"
curl -s -w "\nHTTP Status: %{http_code}\n" "$BASE_URL/api/content/nonexistent"
echo ""
echo ""

# Test 5: PUT without auth (Should return 401)
echo "🔒 Test 5: PUT /api/content/hero without auth (Should fail)"
echo "-------------------------------------------"
curl -s -X PUT \
  -H "Content-Type: application/json" \
  -d '{"value":{"title":"Unauthorized Update"}}' \
  -w "\nHTTP Status: %{http_code}\n" \
  "$BASE_URL/api/content/hero"
echo ""
echo ""

echo "✅ Tests Complete!"
echo ""
echo "📝 Notes:"
echo "- Tests 1-3 should return content successfully"
echo "- Test 4 should return 404 (not found)"
echo "- Test 5 should return 401 (unauthorized)"
echo ""
echo "🔐 To test authenticated PUT requests:"
echo "1. Login at $BASE_URL/login"
echo "2. Use admin@consultpro.com / admin123"
echo "3. Access admin panel at $BASE_URL/admin/content"
