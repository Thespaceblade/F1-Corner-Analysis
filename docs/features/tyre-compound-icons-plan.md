# Plan: Tyre Compound Icons in Chart Tooltip

## Overview
Add tyre compound icons to the chart tooltip on hover, similar to F1-Tempo.com's implementation. The icon should be a colored circle with a black letter indicating the compound type (S=Soft, M=Medium, H=Hard, I=Intermediate, W=Wet).

## Current State

### Data Available
- ✅ `SessionLap` type already includes `compound?: string | null` (line 38 in `lib/sessionDataClient.ts`)
- ✅ FastF1 provides compound data per lap (verified)
- ✅ Data is already being extracted in `scripts/fastf1_pipeline/transforms.py` (line 206)

### Current Chart Implementation
- Using **Recharts** library (`recharts` v2.6.2)
- `ChartPanel.tsx` uses a basic `Tooltip` component from Recharts
- Current tooltip shows: `Lap {number}` and `{driver}: {lapTime}`
- Chart data structure (`ChartDatum`) only includes lap times per driver, not compound info

## Implementation Plan

### Step 1: Create Tyre Compound Icon Component
**File:** `components/TyreCompoundIcon.tsx`

Create a reusable component that renders a colored circle with a black letter:
- **Props:**
  - `compound: string | null` - The compound code (SOFT, MEDIUM, HARD, INTERMEDIATE, WET)
  - `size?: number` - Optional size override (default: ~16-20px)
- **Styling:**
  - Circle background color based on compound type:
    - SOFT: Red (#ef4444 or #dc2626)
    - MEDIUM: Yellow (#facc15 or #eab308)
    - HARD: White/Grey (#ffffff or #d1d5db)
    - INTERMEDIATE: Green (#10b981 or #059669)
    - WET: Blue (#3b82f6 or #2563eb)
  - Black border (1-2px)
  - Black letter in center (S, M, H, I, W)
  - Rounded circle shape

### Step 2: Update Chart Data Structure
**File:** `components/ChartPanel.tsx`

Modify `buildChartData` function to include compound information:
- Change `ChartDatum` type to include compound data per driver:
  ```typescript
  type ChartDatum = {
    lapNumber: number
    [driverCode: string]: number | null | number[] | { time: number; compound: string | null }
  }
  ```
- Alternative approach (simpler): Store compound in a separate map:
  ```typescript
  type ChartDatum = {
    lapNumber: number
    [driverCode: string]: number | null
  }
  // Separate map: Map<lapNumber, Map<driverCode, compound>>
  ```
- Update `buildChartData` to extract compound from `sessionData.laps` and associate it with each data point

### Step 3: Create Custom Tooltip Component
**File:** `components/ChartTooltip.tsx`

Create a custom Recharts Tooltip component:
- Use Recharts' `TooltipProps` type
- Display format:
  - Label: `Lap {lapNumber}`
  - For each driver:
    - Driver code (e.g., "NOR")
    - Lap time (e.g., "1:21.531")
    - Tyre compound icon (using `TyreCompoundIcon` component)
- Layout: Horizontal flex layout with icon next to lap time
- Styling: Match existing tooltip styling (dark background, light text)

### Step 4: Integrate Custom Tooltip
**File:** `components/ChartPanel.tsx`

- Import `ChartTooltip` component
- Replace default `<Tooltip>` with `<ChartTooltip>` 
- Pass compound data to the tooltip (via `content` prop or custom props)
- Ensure compound data is available in the tooltip's payload

### Step 5: Handle Edge Cases
- **Missing compound data:** Show a placeholder or skip the icon
- **Unknown compound codes:** Default to a grey icon with "?"
- **Multiple drivers:** Show compound icon for each driver in the tooltip
- **Null/undefined compounds:** Gracefully handle missing data

## Technical Details

### Compound Code Mapping
FastF1 provides compound codes like:
- `"SOFT"` → Red circle with "S"
- `"MEDIUM"` → Yellow circle with "M"  
- `"HARD"` → White/Grey circle with "H"
- `"INTERMEDIATE"` → Green circle with "I"
- `"WET"` → Blue circle with "W"

### Recharts Tooltip Customization
Recharts allows custom tooltip content via:
```tsx
<Tooltip content={<CustomTooltip />} />
```

The `CustomTooltip` receives props:
- `active?: boolean`
- `payload?: Array<{ name: string; value: number; ... }>`
- `label?: string | number`

We'll need to extend the payload to include compound data.

## File Changes Summary

### New Files
1. `components/TyreCompoundIcon.tsx` - Icon component
2. `components/ChartTooltip.tsx` - Custom tooltip component

### Modified Files
1. `components/ChartPanel.tsx` - Update data structure and integrate custom tooltip

## Testing Checklist
- [ ] Icon displays correctly for each compound type
- [ ] Icon appears next to lap time in tooltip
- [ ] Multiple drivers show correct compound icons
- [ ] Missing compound data handled gracefully
- [ ] Tooltip styling matches existing design
- [ ] Works with outlier laps toggle
- [ ] Works with different session types (Q, R, FP1, etc.)

## Future Enhancements (Optional)
- Add tyre life indicator (e.g., "M (5)" for Medium with 5 laps)
- Add stint number to tooltip
- Color-code the line segments by compound
- Add compound legend to chart

