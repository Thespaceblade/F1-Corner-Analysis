#!/bin/bash
# Fix known FastF1 data errors for 2025 season
# These corrections align with official FIA standings

echo "🔧 Fixing known FastF1 2025 data errors..."

BASE_DIR="/Users/jasoncharwin/Personal Code Projects/F1-Corner-Analysis/public/data/sessions/2025"

# Fix 1: Great Britain - Verstappen finished 5th, not retired
echo "Fixing Great Britain - Verstappen (5th, 10 pts)..."
jq '(.raceResults[] | select(.driverCode == "VER")) |= {
  position: 5,
  driverCode: "VER",
  driverNumber: 1,
  teamName: "Red Bull Racing",
  gridPosition: .gridPosition,
  status: "Finished",
  points: 10.0,
  classifiedPosition: "5",
  time: .time,
  lapsCompleted: 52
}' "$BASE_DIR/great-britain/R/session.json" > /tmp/gb_fixed.json && \
mv /tmp/gb_fixed.json "$BASE_DIR/great-britain/R/session.json"

echo "✅ Fixes applied!"
echo ""
echo "Summary of corrections:"
echo "- Great Britain: VER 5th place (10 pts) - was incorrectly marked as Retired"
echo ""
echo "⚠️  Note: Other discrepancies remain due to FastF1 source data issues."
echo "   System standings will be approximately correct but may differ by a few points."
echo ""
echo "Please restart your dev server: npm run dev"
