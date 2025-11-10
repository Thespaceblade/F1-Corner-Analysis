# Australia Corner Data Missing Issue

## Problem Summary

Corner data for certain corners in Australia is not loading, specifically:
- **Corner 14**: Completely missing (0% coverage)
- **Corners 11, 12, 13**: Very low coverage (1.1% each)
- **Corners 6, 7, 8, 10**: Low coverage (4-23%)

## Root Cause Analysis

### 1. Corner Cluster Issue
Corners 7-14 are clustered in a very tight distance range (4570-4655m = only 85 meters):
- Corner 7: 4570-4620m (fast)
- Corner 8: 4600-4625m (fast) - **Overlaps with 7**
- Corner 9: 4540-4630m (slow) - **Overlaps with 7, 8**
- Corner 10: 4605-4625m (slow) - **Overlaps with 7, 8, 9**
- Corner 11: 4606-4620m (fast) - **Overlaps with 7, 8, 9, 10**
- Corner 12: 4620-4635m (fast) - **Overlaps with 9, 10, 11**
- Corner 13: 4630-4645m (slow) - **Overlaps with 12**
- Corner 14: 4635-4655m (medium) - **Overlaps with 13**

### 2. Detection Algorithm Limitations
The corner detection algorithm:
- Uses speed drop heuristic (min 18 km/h drop)
- May not detect fast corners with minimal speed drops
- Filters out corners that are too close together (< 10 points = 20m)
- May merge multiple corners in tight clusters into a single detection

### 3. Matching Algorithm Issues
The corner matching algorithm:
- Uses 50m tolerance (too large for 5-25m spaced corners)
- May assign multiple detected corners to the same track corner
- May miss corners when distance ranges overlap significantly
- Corner 14 is at the end, so it might be getting merged with corner 13

## Solutions

### Option 1: Improve Corner Detection (Recommended)
1. **Reduce minimum spacing for corner clusters**
   - Detect corners within 100m of each other with smaller spacing (5 points = 10m)
   - This is already partially implemented but may need tuning

2. **Improve fast corner detection**
   - Use throttle/brake signals more effectively
   - Detect corners from lateral acceleration changes
   - Lower speed drop threshold for corner clusters

3. **Better handling of corner sequences**
   - Detect corner sequences (multiple corners in quick succession)
   - Use corner type information (fast corners need different detection)

### Option 2: Improve Corner Matching
1. **Reduce tolerance for corner clusters**
   - Use smaller tolerance (10-15m) for corners in clusters
   - Use sequential matching within clusters

2. **Improve matching algorithm**
   - Consider corner type when matching (fast vs slow)
   - Use strict ordering within clusters
   - Handle overlapping ranges better

### Option 3: Adjust Track Definition
1. **Review corner definitions**
   - Verify corner 14 distance range is correct
   - Check if corners 7-14 are correctly defined
   - Consider if some corners should be combined

## Immediate Fix

The quickest fix is to improve the corner matching algorithm for corner clusters:

1. **Detect corner clusters** (corners within 100m of each other)
2. **Use sequential matching** within clusters (strict order)
3. **Reduce tolerance** for clustered corners (10-15m instead of 50m)
4. **Handle overlaps** by using corner type and strict ordering

## Testing

After fixing, test with:
- Australia Q session
- All drivers
- Verify corners 7-14 all have data
- Check corner 14 specifically

## Files to Modify

1. `scripts/fastf1_pipeline/corners.py`
   - Improve `detect_corners()` for corner clusters
   - Improve `match_corners_to_track()` for overlapping ranges

2. `scripts/fastf1_pipeline/transforms.py`
   - Adjust tolerance for Australia track
   - Add corner cluster detection

## Status

- [ ] Issue identified
- [ ] Root cause analyzed
- [ ] Solution designed
- [ ] Code changes implemented
- [ ] Testing completed
- [ ] Data regenerated

