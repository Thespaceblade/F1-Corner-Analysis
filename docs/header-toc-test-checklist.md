# Header TOC Test Checklist

## Implementation Status: ✅ Complete

### Component Integration
- [x] TableOfContents component has `variant` prop support
- [x] Header variant implemented in TableOfContents
- [x] ClientPage uses header variant correctly
- [x] Conditional rendering: `currentTrack && tocSections.length > 0`
- [x] Sections defined correctly in useMemo

### Section IDs
- [x] `track-visualization` - Section element (line 577)
- [x] `track-information` - Div inside track-visualization (line 586)
- [x] `lap-time-comparison` - Section element (line 656)
- [x] `analysis-panel` - Section element (line 669)

### CSS Styling
- [x] Header TOC styles defined in globals.css
- [x] Responsive display (hidden on mobile, visible on lg+)
- [x] Collapsed state: 40px circular icon button
- [x] Expanded state: Dropdown menu
- [x] Smooth animations and transitions
- [x] Hover effects on icon

### Functionality
- [x] Smooth scroll to sections
- [x] Active section highlighting
- [x] Intersection Observer for active section tracking
- [x] Mobile drawer support
- [x] Click to navigate

## Manual Testing Steps

### Desktop (≥1024px)
1. **Initial State**
   - [ ] Load page without track selected
   - [ ] Verify: TOC icon should NOT be visible in header
   - [ ] Select a track
   - [ ] Verify: TOC icon appears in header (right side)
   - [ ] Verify: Icon is circular, 40px, with hamburger menu icon
   - [ ] Verify: Icon has semi-transparent dark background

2. **Hover Interaction**
   - [ ] Hover over TOC icon
   - [ ] Verify: Icon scales up slightly (1.05x)
   - [ ] Verify: Border color changes to accent color
   - [ ] Verify: Dropdown menu appears below icon
   - [ ] Verify: Menu shows 4 sections:
     - Track Visualization
     - Track Information
     - Lap Time Comparison
     - Analysis Panel
   - [ ] Verify: Menu has smooth fade-in animation
   - [ ] Move mouse away from icon
   - [ ] Verify: Menu fades out smoothly

3. **Navigation**
   - [ ] Click on "Track Visualization" in dropdown
   - [ ] Verify: Page scrolls smoothly to track visualization section
   - [ ] Verify: Section is highlighted in dropdown
   - [ ] Scroll page manually
   - [ ] Verify: Active section updates as you scroll
   - [ ] Test all 4 navigation links
   - [ ] Verify: All links scroll to correct sections

4. **Active Section Highlighting**
   - [ ] Scroll to track visualization section
   - [ ] Verify: "Track Visualization" is highlighted in dropdown
   - [ ] Scroll to lap time comparison
   - [ ] Verify: "Lap Time Comparison" is highlighted
   - [ ] Verify: Only one section is active at a time

### Mobile (<1024px)
1. **Mobile Toggle**
   - [ ] Verify: Header TOC icon is hidden
   - [ ] Verify: Mobile hamburger button is visible
   - [ ] Click mobile toggle button
   - [ ] Verify: Drawer opens from side
   - [ ] Verify: Drawer shows all 4 sections
   - [ ] Click a section
   - [ ] Verify: Page scrolls and drawer closes
   - [ ] Click backdrop
   - [ ] Verify: Drawer closes

### Edge Cases
1. **No Track Selected**
   - [ ] Verify: TOC does not render
   - [ ] Select track
   - [ ] Verify: TOC appears

2. **Track Switching**
   - [ ] Select track A
   - [ ] Verify: TOC appears
   - [ ] Switch to track B
   - [ ] Verify: TOC remains visible
   - [ ] Verify: Sections update correctly

3. **Scroll Position**
   - [ ] Navigate to middle section
   - [ ] Refresh page
   - [ ] Verify: Active section is correctly highlighted

## Expected Behavior

### Visual
- Icon: 40px circular button, dark semi-transparent background
- Icon Color: Accent blue (rgba(124, 199, 255, 0.9))
- Dropdown: 220px wide, dark panel with border and shadow
- Hover: Icon scales 1.05x, border glows with accent color
- Active Item: Accent color text, left border accent, subtle background

### Interaction
- Hover to expand (desktop)
- Click to navigate
- Smooth scroll with 100px header offset
- Active section tracking via Intersection Observer
- Mobile drawer for small screens

### Responsive
- Hidden on mobile (<1024px)
- Visible on desktop (≥1024px)
- Dropdown width: 220px (default), 240px (xl screens)

## Known Issues
- None currently

## Build Status
✅ Build successful - No TypeScript errors
✅ No linter errors
✅ All components compile correctly







