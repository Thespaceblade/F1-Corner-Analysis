# Testing & Validation Plan

## Overview
This document outlines the testing and validation plan for the F1 Corner Analysis application, focusing on corner hover functionality, event markers, and data quality.

## Test Categories

### 1. Corner Coordinate Validation

#### 1.1 Automated Validation
**Script**: `scripts/validate_corner_coordinates.ts`

**Tests**:
- [ ] All corner coordinates are within SVG viewBox bounds
- [ ] Corner coordinates are valid numbers
- [ ] Corner numbers are sequential (1, 2, 3, ...)
- [ ] All tracks have corner data
- [ ] Corner coordinates are not too close to viewBox edges

**Run**: `npx ts-node scripts/validate_corner_coordinates.ts`

**Expected Output**:
- List of tracks with validation status
- Errors for out-of-bounds coordinates
- Warnings for edge cases
- Summary statistics

#### 1.2 Manual Testing
**Focus Tracks**: Australia (corners 12-14), Monaco (many corners), Monza (few corners)

**Test Steps**:
1. Load each track in the application
2. Hover over each corner (especially 12-14 on Australia)
3. Verify tooltip appears correctly
4. Verify corner markers are visible and clickable
5. Check corner coordinates visually match track layout

**Expected Results**:
- All corners are hoverable
- Tooltips show correct corner information
- Corner markers are positioned correctly
- No corners are blocked or unresponsive

### 2. Event Marker Testing

#### 2.1 Race Session Event Markers
**Test Cases**:
- [ ] Safety car periods display as highlighted areas
- [ ] VSC periods display as highlighted areas
- [ ] Pit stops show correct driver codes
- [ ] Race start marker appears on lap 1
- [ ] Yellow flags display correctly
- [ ] Red flags display correctly
- [ ] Event labels don't overlap
- [ ] Event legend displays correctly

**Test Sessions**:
- Race with safety car periods
- Race with VSC periods
- Race with multiple pit stops
- Race with flags (yellow/red)
- Race with overlapping events

#### 2.2 Event Detection Accuracy
**Test Cases**:
- [ ] Pit stops detected using in-lap flag
- [ ] Safety car periods detected correctly
- [ ] VSC periods detected correctly
- [ ] Event detection works with outliers shown
- [ ] Event detection works with outliers hidden
- [ ] Events only show for selected drivers (pit stops)
- [ ] SC/VSC periods show for all drivers

**Validation**:
- Compare detected events with official race data
- Verify event timing matches race footage
- Check event labels are accurate

### 3. Corner Hover Functionality

#### 3.1 Basic Hover Testing
**Test Cases**:
- [ ] Corner hover works on all tracks
- [ ] Tooltip appears on hover
- [ ] Tooltip shows correct corner information
- [ ] Tooltip disappears on mouse leave
- [ ] Multiple corners can be hovered sequentially
- [ ] Corner hover works with different driver selections

#### 3.2 Edge Cases
**Test Cases**:
- [ ] Corners 12-14 on Australia track (previously broken)
- [ ] Corners near track edges
- [ ] Overlapping corners (if any)
- [ ] Tracks with many corners (Monaco, Singapore)
- [ ] Tracks with few corners (Monza, Austria)
- [ ] Corner hover with no performance data
- [ ] Corner hover with single driver selected
- [ ] Corner hover with multiple drivers selected

#### 3.3 Pointer Events
**Test Cases**:
- [ ] Track SVG doesn't block corner hover
- [ ] Corner markers receive pointer events
- [ ] Overlay SVG is interactive
- [ ] Track SVG has pointer-events: none
- [ ] Corner markers have pointer-events: auto

### 4. Data Quality Validation

#### 4.1 Corner Data
**Test Cases**:
- [ ] All tracks have corner definitions
- [ ] Corner coordinates are accurate
- [ ] Corner types are correct (slow/medium/fast)
- [ ] Corner numbers are sequential
- [ ] Expected distance ranges are valid

#### 4.2 Session Data
**Test Cases**:
- [ ] Session data loads correctly
- [ ] Corner performance data is available
- [ ] Event data is accurate
- [ ] Lap time data is complete
- [ ] Driver data is correct

### 5. Edge Cases & Error Handling

#### 5.1 Missing Data
**Test Cases**:
- [ ] Application handles missing corner data gracefully
- [ ] Application handles missing session data gracefully
- [ ] Application handles missing SVG files gracefully
- [ ] Error messages are user-friendly
- [ ] Loading states display correctly

#### 5.2 Invalid Data
**Test Cases**:
- [ ] Application handles invalid corner coordinates
- [ ] Application handles invalid session data
- [ ] Application handles malformed JSON
- [ ] Application handles network errors

#### 5.3 Performance
**Test Cases**:
- [ ] Application loads quickly
- [ ] Corner hover is responsive
- [ ] Chart rendering is smooth
- [ ] No memory leaks
- [ ] Large datasets don't cause slowdowns

## Test Execution

### Phase 1: Automated Validation (Day 1)
1. Run corner coordinate validation script
2. Fix any coordinate issues
3. Verify all tracks pass validation

### Phase 2: Manual Testing (Day 2-3)
1. Test corner hover on all tracks
2. Test event markers on multiple sessions
3. Verify data quality
4. Test edge cases

### Phase 3: Bug Fixes (Day 4)
1. Fix any issues found during testing
2. Re-test fixed functionality
3. Document any remaining issues

### Phase 4: Final Validation (Day 5)
1. Run full test suite
2. Verify all tests pass
3. Document test results
4. Create test report

## Test Checklist

### Corner Hover
- [ ] Australia - All corners (especially 12-14)
- [ ] Monaco - All corners
- [ ] Monza - All corners
- [ ] Singapore - All corners
- [ ] All other tracks - Sample corners

### Event Markers
- [ ] Safety car periods
- [ ] VSC periods
- [ ] Pit stops
- [ ] Race start
- [ ] Yellow flags
- [ ] Red flags
- [ ] Event legend
- [ ] Label positioning

### Data Quality
- [ ] Corner coordinates validated
- [ ] Session data validated
- [ ] Event data validated
- [ ] Performance data validated

## Test Results Template

### Track: [Track Name]
- **Corner Count**: [Number]
- **ViewBox**: [Dimensions]
- **Out of Bounds**: [Count]
- **Hoverable**: [Yes/No]
- **Issues**: [List]

### Session: [Session Name]
- **Event Markers**: [Count]
- **Safety Car Periods**: [Count]
- [ ] VSC Periods**: [Count]
- **Pit Stops**: [Count]
- **Issues**: [List]

## Success Criteria

### Corner Hover
- ✅ All corners are hoverable on all tracks
- ✅ Tooltips appear correctly
- ✅ No corners are blocked
- ✅ Corner markers are visible

### Event Markers
- ✅ All event types display correctly
- ✅ Event labels don't overlap
- ✅ Event detection is accurate
- ✅ Event legend displays correctly

### Data Quality
- ✅ All corner coordinates are valid
- ✅ All tracks have corner data
- ✅ Session data is complete
- ✅ Event data is accurate

## Known Issues

### Fixed
- ✅ Corner hover issue (corners 12-14 on Australia)
- ✅ Pointer events blocking corner hover

### To Fix
- [ ] (Add any new issues found during testing)

## Next Steps

1. Run automated validation script
2. Test corner hover on all tracks
3. Test event markers on multiple sessions
4. Document test results
5. Fix any issues found
6. Re-test fixed functionality

---

**Last Updated**: [Date]
**Status**: In Progress


