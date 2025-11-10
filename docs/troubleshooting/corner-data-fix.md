# Corner Data Loading Fix

## Issue Identified

When loading all drivers (empty `selectedDrivers` array), corner data was not being processed because of a bug in `ClientPage.tsx`.

### Root Cause

In `components/ClientPage.tsx` line 339, the code had:
```typescript
if (!sessionData?.corners || !selectedDrivers.length) return undefined
```

This condition returned `undefined` when `selectedDrivers` was empty (which means "load all drivers"), preventing corner data from being processed.

## Fix Applied

### 1. ClientPage.tsx - Corner Performance Aggregation
**File**: `components/ClientPage.tsx`
**Change**: Modified the corner performance aggregation logic to handle empty `selectedDrivers` array correctly.

**Before**:
```typescript
const cornerPerformance = useMemo(() => {
  if (!sessionData?.corners || !selectedDrivers.length) return undefined
  return aggregateCornerPerformance(sessionData.corners, selectedDrivers)
}, [sessionData?.corners, selectedDrivers])
```

**After**:
```typescript
const cornerPerformance = useMemo(() => {
  if (!sessionData?.corners) return undefined
  // If selectedDrivers is empty, process all drivers (pass undefined)
  // Otherwise, pass the selected drivers
  const driversToUse = selectedDrivers.length > 0 ? selectedDrivers : undefined
  return aggregateCornerPerformance(sessionData.corners, driversToUse)
}, [sessionData?.corners, selectedDrivers])
```

### 2. API Route - Database Mode Corner Loading
**File**: `app/api/sessions/[year]/[round]/[session]/route.ts`
**Change**: Improved corner loading logic in database mode to properly handle driver filtering.

**Before**:
```typescript
const corners = await loadCornersFromFile(sessionPath, driverCodes)
```

**After**:
```typescript
// If no driver filter was requested, load ALL corners from the file
// If a driver filter was requested, filter corners to match the requested drivers
const cornersToLoad = driversFilter.length > 0 ? driversFilter : []
const allCorners = await loadCornersFromFile(sessionPath, cornersToLoad)

// If we have a driver filter, we already filtered in loadCornersFromFile
// If no filter, we have all corners, but we should still filter to only drivers that have laps
// (to maintain consistency between laps and corners)
const corners = driversFilter.length > 0
  ? allCorners
  : Object.fromEntries(
      Object.entries(allCorners).filter(([driverCode]) => driverCodes.includes(driverCode))
    )
```

## How It Works Now

### Scenario 1: Load All Drivers (Empty selectedDrivers)
1. Client sends request with `drivers: undefined` (no filter)
2. API loads all laps and all corners from file
3. API filters corners to only drivers that have laps (for consistency)
4. Client receives all drivers, all laps, and all corners
5. Client processes all corners (passes `undefined` to aggregator)
6. ✅ All corner data is displayed

### Scenario 2: Load Specific Drivers
1. Client sends request with `drivers: ['VER', 'NOR']`
2. API loads only VER and NOR laps and corners
3. Client receives only VER and NOR data
4. Client processes only VER and NOR corners
5. ✅ Only selected drivers' corner data is displayed

## Test Results

### Australia Q Session Test
- **Total Drivers**: 20
- **Drivers with Laps**: 20
- **Drivers with Corners**: 19 (BEA has no corner data)
- **Total Corner Entries**: 775

### Test Cases
1. ✅ Empty selectedDrivers → All corners processed
2. ✅ Specific drivers → Only selected drivers' corners processed
3. ✅ File-based loading → All corners loaded correctly
4. ✅ Database mode → All corners loaded from file correctly

## Verification

To verify the fix works:

1. **Start the dev server**:
   ```bash
   npm run dev
   ```

2. **Test in browser**:
   - Navigate to `http://localhost:3000`
   - Select Australia track
   - Select Q session
   - Deselect all drivers (empty selection = all drivers)
   - Verify corner data is displayed on the track visualization
   - Verify corner table shows all drivers' corner data

3. **Check console logs**:
   - Look for: `[ClientPage] Session data loaded in Xms: 20 drivers, 297 laps`
   - Verify corner performance is calculated for all 19 drivers with corner data

## Files Modified

1. `components/ClientPage.tsx` - Fixed corner performance aggregation
2. `app/api/sessions/[year]/[round]/[session]/route.ts` - Improved corner loading in database mode

## Status

✅ **FIXED** - All corner data now loads correctly when loading all drivers.

