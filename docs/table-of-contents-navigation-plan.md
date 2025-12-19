# Table of Contents Navigation - Implementation Plan

## Overview

Implement a Google Docs-style table of contents (TOC) sidebar that allows users to quickly navigate the vertically growing page. The TOC will display all major sections with clickable links that smoothly scroll to the target section, and automatically highlight the currently viewed section.

---

## Design Goals

1. **Quick Navigation**: Enable instant navigation to any section of the page
2. **Visual Feedback**: Highlight the active section in the TOC based on scroll position
3. **Non-Intrusive**: Sidebar should be accessible but not block content
4. **Responsive**: Work seamlessly on desktop and mobile devices
5. **Smooth UX**: Smooth scrolling animations and visual transitions
6. **Performance**: Efficient scroll tracking with minimal performance impact

---

## Current Page Structure

Based on `ClientPage.tsx`, the page has the following sections (when a track is selected):

1. **Track Visualization** - TrackPanel component (no heading, but can use "Track Visualization")
2. **Track Information** - Track info panel (no heading, can use "Track Information")
3. **Lap Time Comparison** - ChartPanel component (has heading: "Lap Time Comparison")
4. **Corner Analysis** - CornerTable component (has heading: "Corner Analysis")
5. **Corner Delta Comparison** - CornerDeltaChart component (has heading: "Corner Delta Comparison")
6. **Analysis Panel** - AnalysisPanel component (has tabs: Corner Performance, Corner Entry/Exit, Stint Analysis, Corner Difficulty, Export & Share)

---

## Technical Approach

### 1. Component Architecture

**New Components:**
- `TableOfContents.tsx` - Main TOC component
- `TOCItem.tsx` - Individual TOC link item (optional, can be inline)

**Integration:**
- Add section IDs to each major section in `ClientPage.tsx`
- Wrap sections with semantic HTML elements and IDs
- Integrate TOC component into the page layout

### 2. Section Identification Strategy

**Option A: Add IDs to existing sections (Recommended)**
- Add `id` attributes to each section container
- Use semantic HTML5 `<section>` elements where appropriate
- Create consistent ID naming: `section-track-visualization`, `section-lap-times`, etc.

**Option B: Use data attributes**
- Add `data-section` attributes to sections
- Query sections using `querySelectorAll('[data-section]')`

**Recommended: Option A** - More semantic and accessible

### 3. Intersection Observer API

Use Intersection Observer to track which section is currently in view:

```typescript
// Track active section based on viewport intersection
const observerOptions = {
  root: null, // viewport
  rootMargin: '-20% 0px -70% 0px', // Trigger when section is in upper portion of viewport
  threshold: 0.1
}

// Observer callback updates active section state
const handleIntersection = (entries: IntersectionObserverEntry[]) => {
  // Find the most visible section
  // Update active section in TOC
}
```

**Benefits:**
- Efficient scroll tracking
- Automatic active section detection
- Minimal performance impact
- Works with dynamic content

### 4. Smooth Scrolling

Implement smooth scrolling when clicking TOC links:

```typescript
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    const headerOffset = 80 // Account for fixed header/toolbar
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }
}
```

### 5. TOC Data Structure

Define sections with metadata:

```typescript
type TOCSection = {
  id: string
  label: string
  level: number // For nested sections (h2, h3, etc.)
  icon?: string // Optional icon for visual distinction
}

const sections: TOCSection[] = [
  { id: 'track-visualization', label: 'Track Visualization', level: 1 },
  { id: 'track-information', label: 'Track Information', level: 1 },
  { id: 'lap-time-comparison', label: 'Lap Time Comparison', level: 1 },
  { id: 'corner-analysis', label: 'Corner Analysis', level: 1 },
  { id: 'corner-delta', label: 'Corner Delta Comparison', level: 1 },
  { id: 'analysis-panel', label: 'Analysis Panel', level: 1 },
]
```

---

## UI/UX Design

### Desktop Layout

**Position:**
- Fixed position on the right side of the viewport
- Sticky within viewport (scrolls with page until top/bottom reached)
- Width: ~240px (compact, doesn't obstruct content)
- Top offset: ~100px (below header/toolbar)
- Right offset: ~20px from viewport edge

**Styling:**
- Dark theme matching existing design system
- Panel styling (similar to existing `.panel` class)
- Scrollable if content exceeds viewport height
- Smooth transitions for active state
- Hover effects on items

**Visual Indicators:**
- Active section: Accent color highlight, bold text, left border indicator
- Inactive sections: Subtle gray text
- Hover state: Slight background color change

### Mobile Layout

**Position:**
- Collapsible/expandable button (hamburger menu style)
- Overlay sidebar that slides in from the right
- Full height overlay with backdrop
- Close button in top-right corner

**Alternative:**
- Bottom sheet/drawer that slides up
- Compact horizontal scrollable bar at top (less recommended)

### TOC Item Design

```
┌─────────────────────────┐
│ 📍 Track Visualization  │ ← Active (accent color, bold, left border)
├─────────────────────────┤
│    Track Information    │ ← Inactive (gray, normal weight)
├─────────────────────────┤
│    Lap Time Comparison  │ ← Inactive
├─────────────────────────┤
│    Corner Analysis      │ ← Inactive
└─────────────────────────┘
```

---

## Implementation Steps

### Phase 1: Setup Section IDs

1. **Modify ClientPage.tsx**
   - Add `id` attributes to each major section
   - Wrap sections in semantic `<section>` elements where appropriate
   - Ensure consistent ID naming convention

   **Sections to modify:**
   - TrackPanel container → `id="track-visualization"`
   - Track info panel → `id="track-information"`
   - ChartPanel → `id="lap-time-comparison"`
   - CornerTable → `id="corner-analysis"`
   - CornerDeltaChart → `id="corner-delta"`
   - AnalysisPanel → `id="analysis-panel"`

### Phase 2: Create TOC Component

1. **Create `components/TableOfContents.tsx`**
   - Define section data structure
   - Implement Intersection Observer
   - Handle scroll tracking
   - Render TOC items with active state

2. **Features to implement:**
   - Section detection via Intersection Observer
   - Active section highlighting
   - Smooth scroll navigation
   - Responsive design (desktop sidebar, mobile drawer)

### Phase 3: Styling & Polish

1. **Apply design system styling**
   - Use existing color variables and panel styles
   - Match existing UI patterns
   - Add smooth transitions
   - Implement hover states

2. **Responsive behavior**
   - Desktop: Fixed right sidebar
   - Mobile: Collapsible drawer/overlay
   - Tablet: Adaptive layout

### Phase 4: Integration & Testing

1. **Integrate into ClientPage.tsx**
   - Add TOC component to layout
   - Conditionally render (only when track is selected)
   - Test scroll behavior
   - Verify active section detection

2. **Edge cases:**
   - Handle sections that don't exist (no track selected)
   - Handle dynamic content (AnalysisPanel tabs)
   - Handle very long pages
   - Handle rapid scrolling

---

## Component Structure

### TableOfContents.tsx

```typescript
'use client'

import React, { useEffect, useState, useRef } from 'react'

type TOCSection = {
  id: string
  label: string
  level: number
  icon?: string
}

type TableOfContentsProps = {
  sections: TOCSection[]
  isVisible?: boolean // Only show when track is selected
}

export default function TableOfContents({ 
  sections, 
  isVisible = true 
}: TableOfContentsProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  
  // Intersection Observer setup
  useEffect(() => {
    if (!isVisible) return
    
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0.1
    }
    
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      // Find the most visible section
      // Update activeSection state
    }
    
    observerRef.current = new IntersectionObserver(handleIntersection, observerOptions)
    
    // Observe all sections
    sections.forEach(section => {
      const element = document.getElementById(section.id)
      if (element && observerRef.current) {
        observerRef.current.observe(element)
      }
    })
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [sections, isVisible])
  
  const scrollToSection = (sectionId: string) => {
    // Smooth scroll implementation
  }
  
  if (!isVisible || sections.length === 0) return null
  
  return (
    <aside className="toc-sidebar">
      {/* TOC items */}
    </aside>
  )
}
```

---

## Styling Details

### Desktop Sidebar Styles

```css
.toc-sidebar {
  position: fixed;
  top: 100px;
  right: 20px;
  width: 240px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  background: var(--panel-bg);
  border: 1px solid var(--border-clr);
  border-radius: 14px;
  padding: 16px;
  z-index: 100;
  box-shadow: 0 6px 18px rgba(0,0,0,0.6);
}

.toc-item {
  padding: 8px 12px;
  margin: 4px 0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--subtext-clr);
  font-size: 14px;
}

.toc-item:hover {
  background: var(--surface-bg);
  color: var(--text-clr);
}

.toc-item.active {
  color: var(--accent-clr);
  font-weight: 600;
  border-left: 3px solid var(--accent-clr);
  padding-left: 9px; /* Adjust for border */
  background: rgba(124, 199, 255, 0.08);
}
```

### Mobile Drawer Styles

```css
.toc-mobile-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--accent-clr);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  z-index: 1000;
  cursor: pointer;
}

.toc-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 280px;
  height: 100vh;
  background: var(--panel-bg);
  border-left: 1px solid var(--border-clr);
  padding: 20px;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  z-index: 999;
  overflow-y: auto;
}

.toc-drawer.open {
  transform: translateX(0);
}

.toc-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.toc-backdrop.open {
  opacity: 1;
  pointer-events: all;
}
```

---

## Advanced Features (Future Enhancements)

1. **Nested Sections**: Support for h2, h3 headings within sections
2. **Progress Indicator**: Show scroll progress through the page
3. **Search/Filter**: Filter TOC items by search query
4. **Collapsible Groups**: Group related sections (e.g., Analysis Panel sub-sections)
5. **Keyboard Navigation**: Arrow keys to navigate TOC, Enter to select
6. **Auto-hide**: Hide TOC when not scrolling (with show on hover)
7. **Custom Scroll Offset**: User preference for scroll offset

---

## Performance Considerations

1. **Intersection Observer**: More efficient than scroll event listeners
2. **Throttling**: Throttle active section updates if needed
3. **Lazy Initialization**: Only initialize observer when TOC is visible
4. **Cleanup**: Properly disconnect observer on unmount
5. **Debouncing**: Debounce scroll-to-section clicks to prevent rapid navigation

---

## Accessibility

1. **ARIA Labels**: Add proper ARIA labels to TOC and items
2. **Keyboard Navigation**: Support arrow keys and Enter key
3. **Focus Management**: Manage focus when opening/closing mobile drawer
4. **Screen Reader Support**: Announce active section changes
5. **Skip Links**: Provide skip link to main content

---

## Testing Checklist

- [ ] TOC appears when track is selected
- [ ] TOC hides when no track is selected
- [ ] All sections are listed correctly
- [ ] Clicking TOC item scrolls to correct section
- [ ] Active section highlights correctly during scroll
- [ ] Smooth scrolling works on all browsers
- [ ] Mobile drawer opens/closes correctly
- [ ] Backdrop closes drawer on mobile
- [ ] Intersection Observer works correctly
- [ ] TOC scrolls independently on desktop
- [ ] Styling matches design system
- [ ] Performance is acceptable (no lag during scroll)

---

## Implementation Priority

**High Priority:**
1. Basic TOC component with section IDs
2. Intersection Observer for active section
3. Smooth scroll navigation
4. Desktop sidebar styling

**Medium Priority:**
1. Mobile drawer implementation
2. Responsive design
3. Polish and animations

**Low Priority:**
1. Advanced features (nested sections, progress indicator)
2. Keyboard navigation
3. Custom scroll offset preferences

---

## Notes

- Consider adding section IDs to components themselves (ChartPanel, CornerTable, etc.) for better modularity
- May need to adjust scroll offset based on fixed header/toolbar height
- Consider adding a "Back to top" button in the TOC
- TOC should be hidden on very small screens or converted to a bottom navigation bar










