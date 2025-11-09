# FIXME - Known Bugs & Issues

This file tracks known bugs, broken functionality, and issues that need to be fixed.

## 🐛 Critical Bugs

### 1. Component Deletions - Verification Needed
**Status**: ⚠️ NEEDS VERIFICATION
**Files**: 
- `components/GlobeTrackSelector.tsx` - DELETED
- `lib/cornerPositionCalculator.ts` - DELETED

**Issue**: These components were deleted but may still be referenced or needed.
**Action Required**: 
- [ ] Verify GlobeTrackSelector functionality was replaced or is no longer needed
- [ ] Check if cornerPositionCalculator logic was moved elsewhere
- [ ] Update README if 3D globe selector is no longer a feature
- [ ] Remove any remaining references to deleted components

### 2. Legacy Files Deleted
**Status**: ✅ Likely Safe
**Files**:
- `f1_corners.py` - DELETED (legacy)
- `f1_test.py` - DELETED (legacy)

**Issue**: Legacy Python files removed, functionality moved to `scripts/fastf1_pipeline/`
**Action Required**: 
- [ ] Verify no scripts reference these files
- [ ] Ensure all functionality is in the new pipeline

## 🔧 Functional Issues

### 3. Corner Coordinate Validation
**Status**: ⚠️ NEEDS TESTING
**Priority**: High

**Issue**: Corner coordinates may be inaccurate for some tracks
**Action Required**:
- [ ] Validate corner coordinates for all tracks
- [ ] Test corner hover on all tracks
- [ ] Fix coordinates that are outside viewBox bounds
- [ ] Add coordinate validation script

### 4. Analysis Panel Integration
**Status**: ⚠️ NEEDS TESTING
**Priority**: Medium

**Issue**: New AnalysisPanel component needs thorough testing
**Action Required**:
- [ ] Test all analysis types (corner difficulty, entry/exit, stint, export)
- [ ] Verify data flows correctly from session data
- [ ] Test with different session types
- [ ] Verify corner filter integration works

### 5. Table of Contents Component
**Status**: ⚠️ NEEDS TESTING
**Priority**: Medium

**Issue**: New TableOfContents component needs testing
**Action Required**:
- [ ] Test navigation functionality
- [ ] Verify all sections are linked correctly
- [ ] Test scroll behavior
- [ ] Verify mobile responsiveness

## 📊 Data Quality Issues

### 6. Corner Detection Accuracy
**Status**: ⚠️ NEEDS IMPROVEMENT
**Priority**: Medium

**Issue**: Corner detection may miss some corners or detect false positives
**Action Required**:
- [ ] Review corner detection algorithm
- [ ] Test with various track types
- [ ] Improve throttle/brake signal detection
- [ ] Add validation for detected corners

### 7. Corner Matching
**Status**: ⚠️ NEEDS VERIFICATION
**Priority**: High

**Issue**: Detected corners need to match track corner definitions accurately
**Action Required**:
- [ ] Verify corner matching logic
- [ ] Test matching accuracy across all tracks
- [ ] Handle edge cases (complex corners, chicanes)
- [ ] Add matching validation

## 🎨 UI/UX Issues

### 8. Race Event Label Overlaps
**Status**: ✅ Mostly Fixed
**Priority**: Low

**Issue**: Event labels may still overlap in dense areas
**Action Required**:
- [ ] Fine-tune collision detection algorithm
- [ ] Test with races with many events
- [ ] Consider alternative layouts for very dense areas

### 9. Chart Performance
**Status**: ⚠️ NEEDS OPTIMIZATION
**Priority**: Medium

**Issue**: Charts may be slow with large datasets
**Action Required**:
- [ ] Optimize chart rendering
- [ ] Add data pagination
- [ ] Implement virtual scrolling
- [ ] Add performance monitoring

## 🔍 Testing Gaps

### 10. Missing Test Coverage
**Status**: ⚠️ NEEDS ATTENTION
**Priority**: High

**Issue**: Many components lack unit tests
**Action Required**:
- [ ] Add tests for corner detection logic
- [ ] Add tests for corner matching
- [ ] Add tests for data aggregation
- [ ] Add E2E tests for key workflows

### 11. Browser Compatibility
**Status**: ⚠️ UNTESTED
**Priority**: Medium

**Issue**: Application may not work correctly in all browsers
**Action Required**:
- [ ] Test in Chrome, Firefox, Safari, Edge
- [ ] Test on different screen sizes
- [ ] Test on mobile devices
- [ ] Fix any compatibility issues

## 📝 Documentation Issues

### 12. Outdated Documentation
**Status**: ⚠️ NEEDS UPDATE
**Priority**: Medium

**Issue**: README and docs may not reflect current state
**Action Required**:
- [ ] Update README with latest features
- [ ] Remove references to deleted components
- [ ] Update project structure
- [ ] Document new analysis features

## 🚨 Blockers

### None Currently

## ✅ Recently Fixed

- Corner hover detection (TrackPanel.tsx)
- Event label overlap prevention
- Pit stop detection using in-lap flag
- API route error handling

## 📌 How to Report Bugs

1. Check if the bug is already listed here
2. If not, add it to the appropriate section
3. Include:
   - Description of the issue
   - Steps to reproduce
   - Expected vs actual behavior
   - Priority level
   - Files affected

## 🔄 Status Legend

- 🚨 **Critical**: Blocks functionality, fix immediately
- ⚠️ **Needs Attention**: Should be fixed soon
- ✅ **Fixed**: Issue has been resolved
- 🔍 **Investigating**: Currently being looked into
- ⏸️ **Blocked**: Cannot be fixed until dependency is resolved

---

**Last Updated**: 2025-01-08

