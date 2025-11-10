#!/bin/bash

# Test script for chatbot queries
# Tests various queries to verify the new concise insight-based responses

BASE_URL="http://localhost:3000/api/chat"

echo "Testing Chatbot Queries..."
echo "=========================="
echo ""

# Test 1: Comparison query
echo "Test 1: Compare VER and NOR"
echo "Query: Compare VER and NOR at Monaco 2025"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Compare VER and NOR at Monaco 2025",
    "context": {}
  }' | jq -r '.answer' | head -20
echo ""
echo "---"
echo ""

# Test 2: Corner performance query
echo "Test 2: Corner Performance"
echo "Query: Who was fastest at corner 8 at Monaco 2025?"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Who was fastest at corner 8 at Monaco 2025?",
    "context": {}
  }' | jq -r '.answer' | head -20
echo ""
echo "---"
echo ""

# Test 3: Driver performance query
echo "Test 3: Driver Performance"
echo "Query: Which corner is VER strongest at Monaco 2025?"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Which corner is VER strongest at Monaco 2025?",
    "context": {}
  }' | jq -r '.answer' | head -20
echo ""
echo "---"
echo ""

# Test 4: Australia comparison
echo "Test 4: Australia Comparison"
echo "Query: Compare VER and NOR Q3 laps Australia"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Compare VER and NOR Q3 laps Australia",
    "context": {}
  }' | jq -r '.answer' | head -20
echo ""
echo "---"
echo ""

# Test 5: Session info
echo "Test 5: Session Info"
echo "Query: What sessions are available for Monaco 2025?"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What sessions are available for Monaco 2025?",
    "context": {}
  }' | jq -r '.answer' | head -20
echo ""
echo "=========================="
echo "Testing complete!"

