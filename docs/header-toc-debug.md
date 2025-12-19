# Header TOC Debugging Guide

## Current Implementation Status

### Component Structure
- ✅ Header variant implemented in `TableOfContents.tsx`
- ✅ Conditional rendering: `sections.length > 0 && isVisible`
- ✅ Hover state management: `isHovered` state
- ✅ Icon always visible
- ✅ Content expands on hover

### CSS Implementation
- ✅ Container transitions: `max-width` from 40px to 700px
- ✅ Content transitions: `max-width` from 0 to 600px
- ✅ Opacity transitions for fade-in/out
- ✅ Smooth animations with cubic-bezier easing

### Expected Behavior

#### Collapsed State
- Width: 40px (fixed)
- Shows: Icon only (hamburger menu)
- Background: Semi-transparent dark
- Border: Subtle gray

#### Expanded State (on hover)
- Width: Expands to fit content (up to 700px)
- Shows: Icon + navigation items horizontally
- Background: More opaque dark
- Border: Accent blue glow
- Content: Fades in with smooth transition

### Potential Issues

1. **Container not expanding**
   - Check if `max-width` transition is working
   - Verify `width: fit-content` is applied
   - Check if parent container allows expansion

2. **Content not showing**
   - Verify `max-width: 600px` on `.toc-header-content.expanded`
   - Check opacity transition timing
   - Verify content is not hidden by overflow

3. **Hover not triggering**
   - Check `onMouseEnter` and `onMouseLeave` handlers
   - Verify `isHovered` state updates
   - Check if z-index is blocking hover events

4. **Animation not smooth**
   - Verify transition timings match
   - Check if `will-change` is set
   - Verify no conflicting CSS rules

### Debugging Steps

1. **Check Console**
   - Look for React errors
   - Check for CSS warnings
   - Verify component renders

2. **Inspect Element**
   - Check if `.expanded` class is applied on hover
   - Verify `max-width` values change
   - Check computed styles

3. **Test Hover**
   - Hover over icon
   - Check if `isHovered` state changes
   - Verify container expands
   - Check if content becomes visible

4. **Check CSS**
   - Verify no conflicting rules
   - Check media queries
   - Verify transitions are applied

### CSS Key Properties

```css
/* Container */
.toc-header-nav.collapsed {
  max-width: 40px;
}

.toc-header-nav.expanded {
  width: fit-content;
  max-width: min(700px, calc(100vw - 200px));
}

/* Content */
.toc-header-content {
  max-width: 0;
  opacity: 0;
}

.toc-header-nav.expanded .toc-header-content {
  max-width: 600px;
  opacity: 1;
}
```

### Testing Checklist

- [ ] Icon appears when track is selected
- [ ] Icon is visible and properly styled
- [ ] Hovering over icon triggers expansion
- [ ] Container expands horizontally
- [ ] Navigation items appear
- [ ] Items are displayed horizontally
- [ ] Animation is smooth
- [ ] Content fades in properly
- [ ] Moving mouse away collapses menu
- [ ] Active section is highlighted
- [ ] Clicking section navigates correctly

### Known Issues

- Build error: `@/lib/formatting` module not found (unrelated to TOC)
- Need to verify expansion works in all browsers
- Need to test on different screen sizes

### Next Steps

1. Fix build error (if blocking)
2. Test in browser
3. Verify expansion works
4. Check responsive behavior
5. Test on different screen sizes







