# Future Steps Plan - Corner Detection & Analysis

## Current Status

### ✅ Completed
1. **Enhanced Corner Detection Algorithm**
   - Implemented speed-gradient-based detection for fast corners
   - Added throttle/brake signal support (though not actively used for corners 11-14)
   - Reduced sensitivity thresholds (`min_drop_kmh=10.0`, `min_recovery_kmh=8.0`)
   - Integrated into `transforms.py` pipeline

2. **UI Improvements**
   - Simplified corner tooltip (shows only corner type and driver deltas)
   - Fixed overlay/z-index issues using React Portals
   - Improved tooltip positioning and styling
   - Added corner filtering for qualifying segments and race laps

3. **Track Configuration**
   - Updated Australia track corner coordinates (turns 5-14)
   - Corrected corner types based on F1 specifications
   - Adjusted `expectedDistanceRange` values for accurate matching

### 🔄 In Progress
- Testing enhanced detection method on qualifying data
- Validation of corners 12-14 detection

### ⏳ Pending
- Regenerate all Australia sessions with improved detection
- Verify data completeness across all drivers

---

## Immediate Next Steps (Priority Order)

### 1. Complete Detection Testing & Validation
**Goal**: Verify that enhanced detection successfully identifies corners 12-14

**Tasks**:
- [ ] Run detection test on multiple driver laps (not just one)
- [ ] Check detection rate for corners 11-14 across all drivers
- [ ] Validate that detected corners match expected distance ranges
- [ ] Analyze false positives/negatives
- [ ] Document detection success rate

**Success Criteria**:
- Corners 12-14 detected in >80% of valid qualifying laps
- Detected apex distances within ±30m of expected ranges
- No significant false positives in straight sections

**Estimated Time**: 30-60 minutes

---

### 2. Fine-Tune Detection Parameters (If Needed)
**Goal**: Optimize detection sensitivity if current approach has issues

**Potential Adjustments**:
- [ ] Adjust `min_drop_kmh` threshold (currently 10.0)
- [ ] Adjust `min_recovery_kmh` threshold (currently 8.0)
- [ ] Tune speed gradient smoothing window (currently 5 points)
- [ ] Adjust overlap detection thresholds
- [ ] Modify speed variation requirement (currently >1.0 km/h)

**If Current Method Still Fails**:
- [ ] Consider lateral acceleration (G-force) data if available
- [ ] Implement steering angle-based detection
- [ ] Use track geometry data to predict corner locations
- [ ] Hybrid approach: combine multiple detection methods

**Estimated Time**: 1-2 hours (if needed)

---

### 3. Regenerate All Australia Sessions
**Goal**: Populate corner data for all sessions with improved detection

**Sessions to Regenerate**:
- [ ] Qualifying (Q) - **Priority 1** (corners 12-14 issue was here)
- [ ] Race (R) - **Priority 2**
- [ ] Free Practice 1 (FP1) - Optional
- [ ] Free Practice 2 (FP2) - Optional
- [ ] Free Practice 3 (FP3) - Optional

**Process**:
```bash
# Regenerate each session
python scripts/fetch_fastf1_data.py --year 2025 --round australia --session Q
python scripts/fetch_fastf1_data.py --year 2025 --round australia --session R
# ... etc
```

**Validation After Regeneration**:
- [ ] Check that all 14 corners have data for majority of drivers
- [ ] Verify corner metrics are reasonable (speeds, times)
- [ ] Confirm no regression in previously working corners (1-11)
- [ ] Test UI with new data (hover tooltips, deltas, etc.)

**Estimated Time**: 15-30 minutes per session

---

### 4. Data Quality Analysis
**Goal**: Ensure corner data is accurate and complete

**Checks**:
- [ ] Corner detection coverage: % of laps with all 14 corners detected
- [ ] Corner matching accuracy: % of detected corners matched to track definitions
- [ ] Speed/time metrics reasonableness (no outliers)
- [ ] Consistency across drivers (similar corner counts per lap)
- [ ] Distance range validation (all corners within expected ranges)

**Tools to Create**:
- [ ] Data quality report script
- [ ] Visualization of detection coverage
- [ ] Corner matching success rate metrics

**Estimated Time**: 1-2 hours

---

## Medium-Term Enhancements

### 5. Expand to Other Tracks
**Goal**: Apply corner detection to additional F1 tracks

**Tracks to Prioritize**:
- [ ] High-speed tracks with similar fast corner challenges
- [ ] Popular tracks (Monaco, Silverstone, Monza, etc.)
- [ ] Tracks with unique corner characteristics

**Process**:
- [ ] Define corner coordinates and types in `tracks.json`
- [ ] Set appropriate `expectedDistanceRange` values
- [ ] Regenerate session data for new tracks
- [ ] Validate detection quality

**Estimated Time**: 2-4 hours per track

---

### 6. Improve Detection Robustness
**Goal**: Make detection more reliable across different conditions

**Enhancements**:
- [ ] Handle edge cases (incomplete telemetry, data gaps)
- [ ] Improve detection for wet conditions (different speed profiles)
- [ ] Better handling of safety car/VSC periods
- [ ] Adaptive thresholds based on track characteristics
- [ ] Machine learning approach (future consideration)

**Estimated Time**: 4-8 hours

---

### 7. Enhanced UI Features
**Goal**: Improve user experience and analysis capabilities

**Potential Features**:
- [ ] Corner-by-corner comparison charts
- [ ] Heat maps showing corner performance
- [ ] Export corner data to CSV/Excel
- [ ] Historical corner performance trends
- [ ] Corner difficulty ranking
- [ ] Driver-specific corner strengths/weaknesses

**Estimated Time**: Variable (2-20 hours depending on feature)

---

## Long-Term Considerations

### 8. Performance Optimization
**Goal**: Improve data processing speed

**Areas**:
- [ ] Parallel processing of multiple laps
- [ ] Caching of intermediate results
- [ ] Optimize corner matching algorithm
- [ ] Reduce memory usage for large sessions

**Estimated Time**: 4-8 hours

---

### 9. Advanced Analytics
**Goal**: Deeper insights into corner performance

**Features**:
- [ ] Corner entry/exit optimization analysis
- [ ] Trajectory analysis (racing line comparison)
- [ ] Tire degradation impact on corner performance
- [ ] Weather impact on corner times
- [ ] Setup changes impact (qualifying vs race)

**Estimated Time**: 10-20 hours

---

### 10. Documentation & Testing
**Goal**: Ensure maintainability and reliability

**Tasks**:
- [ ] Document corner detection algorithm in detail
- [ ] Create unit tests for detection functions
- [ ] Add integration tests for full pipeline
- [ ] Write user guide for corner analysis features
- [ ] Document data format and API

**Estimated Time**: 4-6 hours

---

## Risk Assessment

### High Priority Risks
1. **Detection Still Fails for Corners 12-14**
   - **Mitigation**: Implement alternative detection methods (steering angle, lateral G)
   - **Fallback**: Manual corner definition or semi-automated approach

2. **Performance Degradation**
   - **Mitigation**: Profile and optimize detection algorithm
   - **Fallback**: Process only fastest laps per driver

3. **Data Quality Issues**
   - **Mitigation**: Implement validation checks and quality metrics
   - **Fallback**: Manual review and correction process

### Medium Priority Risks
1. **Inconsistent Detection Across Drivers**
   - **Mitigation**: Normalize detection parameters, validate consistency
   
2. **False Positives in Straight Sections**
   - **Mitigation**: Improve overlap detection, add straight-line filtering

---

## Success Metrics

### Short-Term (Next 1-2 Weeks)
- ✅ Corners 12-14 detected in >80% of qualifying laps
- ✅ All Australia sessions regenerated with complete corner data
- ✅ UI displays corner data correctly for all 14 corners
- ✅ No regression in previously working features

### Medium-Term (Next 1-2 Months)
- ✅ 3-5 additional tracks fully populated
- ✅ Detection success rate >90% across all tracks
- ✅ User feedback incorporated into UI improvements

### Long-Term (Next 3-6 Months)
- ✅ Comprehensive corner analysis features implemented
- ✅ Performance optimized for large datasets
- ✅ Full documentation and testing coverage

---

## Notes

- **Current Challenge**: Corners 11-14 in Australia are taken flat-out with minimal speed changes, making them difficult to detect with traditional methods
- **Current Solution**: Speed gradient analysis to detect subtle acceleration/deceleration changes
- **Future Consideration**: If gradient-based approach still struggles, may need to use track geometry data or manual corner definitions for these specific cases

---

## Quick Reference: Command Cheat Sheet

```bash
# Test detection on single lap
python -c "import sys; sys.path.insert(0, 'scripts'); ..."

# Regenerate session
python scripts/fetch_fastf1_data.py --year 2025 --round australia --session Q

# Check data quality
# (Script to be created)

# View generated data
cat public/data/sessions/2025/australia/Q.json | jq '.corners | keys'
```



