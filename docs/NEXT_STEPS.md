# Next Steps - Corner Telemetry Implementation

## Current Status

### ✅ Completed
1. **Backend Implementation**
   - Corner detection algorithm (`scripts/fastf1_pipeline/corners.py`)
   - Data pipeline integration (`transforms.py`)
   - Telemetry loading enabled
   - Track corner matching

2. **Infrastructure**
   - Build fixes for Vercel
   - Dependencies installed
   - Documentation complete

3. **UI Components**
   - GlobeTrackSelector implemented
   - Basic CornerTable structure exists

### ⏳ Pending (Priority Order)

## Phase 1: TypeScript Types & Data Integration (IMMEDIATE)

### 1.1 Update TypeScript Types
**File**: `lib/sessionDataClient.ts`

**Action**: Add `CornerMetrics` type and update `SessionPayload`

```typescript
export type CornerMetrics = {
  cornerNumber: number
  detectedCornerIndex?: number
  lapNumber: number
  entrySpeed: number
  apexSpeed: number
  exitSpeed: number
  cornerTime: number | null
  brakingDistance: number
  accelerationDistance: number
  entryDistance: number
  apexDistance: number
  exitDistance: number
  minSpeed: number
  cornerType?: 'slow' | 'medium' | 'fast' | 'unknown'
}

// Update SessionPayload
export type SessionPayload = {
  // ... existing fields
  corners: Record<string, CornerMetrics[]>  // Change from unknown[]
}
```

### 1.2 Test Data Generation
**Action**: Generate test session with corner data

```bash
python scripts/fetch_fastf1_data.py --year 2025 --round monaco --session Q --drivers VER NOR
```

Verify corner data exists in generated JSON:
- Check `public/data/sessions/2025/monaco/Q/session.json`
- Verify `corners` field contains data for each driver

---

## Phase 2: UI Component Updates (HIGH PRIORITY)

### 2.1 Update CornerTable Component
**File**: `components/CornerTable.tsx`

**Action**: 
1. Import `CornerMetrics` type
2. Update props type
3. Implement data aggregation (average speeds, best times per corner)
4. Display real corner metrics in table

**Key Features to Implement**:
- Aggregate corner data by corner number
- Calculate averages (entry/apex/exit speeds, corner time)
- Show best corner time per driver
- Display lap count per corner
- Handle missing data gracefully

### 2.2 Add Corner Delta Visualization
**Action**: Create component to show time deltas between drivers per corner

**File**: `components/CornerDeltaChart.tsx` (NEW)

- Bar chart showing corner time differences
- Positive = first driver slower
- Negative = first driver faster
- Color-coded by delta magnitude

---

## Phase 3: Testing & Validation (MEDIUM PRIORITY)

### 3.1 Test Corner Detection
**Action**: Test with multiple sessions and tracks

- Test with different track types (street circuits, permanent tracks)
- Verify corner matching accuracy
- Check edge cases (few corners, many corners)

### 3.2 Validate Data Quality
**Action**: Compare detected corners with known track data

- Manually verify corner counts match track definitions
- Check corner matching accuracy
- Validate metrics make sense (speeds, times)

---

## Phase 4: Enhancements (LOWER PRIORITY)

### 4.1 Track Panel Enhancements
**File**: `components/TrackPanel.tsx`

**Actions**:
- Overlay corner performance on track SVG
- Color-code corners by driver performance
- Click corner to see detailed metrics
- Show speed traces on track

### 4.2 Sector Time Analysis
**Action**: Add sector-by-sector breakdown

- Sector time comparison charts
- Sector delta visualization
- Best sector identification

### 4.3 Performance Optimization
**Actions**:
- Add option to process only fastest lap per driver
- Implement background processing for large sessions
- Add progress indicators
- Cache processed corner data

---

## Immediate Action Items

### This Week
1. ✅ Update TypeScript types (`sessionDataClient.ts`)
2. ✅ Update CornerTable component to display real data
3. ✅ Test with generated session data
4. ✅ Verify corner data appears correctly in UI

### Next Week
5. Add corner delta visualization
6. Enhance track panel with corner overlays
7. Add sector time analysis
8. Performance testing and optimization

---

## Testing Checklist

- [ ] Generate test session with corner data
- [ ] Verify corner data in JSON file
- [ ] Test TypeScript types compile correctly
- [ ] Verify CornerTable displays data
- [ ] Test with multiple drivers
- [ ] Test with multiple tracks
- [ ] Verify corner matching accuracy
- [ ] Test edge cases (no data, missing corners)
- [ ] Performance test with large sessions

---

## Known Issues & Considerations

### Performance
- Corner processing is CPU-intensive
- Full session processing can take 2-10 minutes
- Consider processing only fastest lap initially

### Data Quality
- Corner detection may miss some corners
- Corner matching may not be 100% accurate
- Some tracks may not have corner definitions in tracks.json

### UI/UX
- Corner table may be large for tracks with many corners
- Need to handle missing data gracefully
- Consider pagination or filtering for large datasets

---

## Success Criteria

1. ✅ Corner data appears in CornerTable for valid laps
2. ✅ Corner metrics are displayed accurately
3. ✅ Data aggregation works correctly
4. ✅ UI is responsive and intuitive
5. ✅ Performance is acceptable (< 5 min for full session)
6. ✅ Edge cases handled gracefully

---

## Resources

- Implementation Plan: `docs/corner-telemetry-implementation-plan.md`
- Quick Start: `docs/corner-telemetry-quick-start.md`
- Feature Analysis: `docs/feature-analysis-and-suggestions.md`


