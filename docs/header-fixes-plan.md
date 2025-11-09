# Header Fixes Plan

## Issues Identified

1. **Gradient doesn't blend with page** - Too pronounced, visible edges
2. **Title text cut off** - "Analysis" text is truncated

## Solutions

### Issue 1: Gradient Blending
**Problem**: The radial gradient has too high opacity and transitions too abruptly to transparent, creating visible edges.

**Solutions**:
- Reduce overall opacity values (from 0.25 → 0.12 max)
- Extend the fade gradient to be more gradual (transparent at 80-90% instead of 60-65%)
- Add a smoother transition with more gradient stops
- Optionally: Add a mask or overlay to blend edges better

### Issue 2: Text Cutoff
**Problem**: Text is being clipped, likely due to:
- Container overflow settings
- Insufficient padding
- Text size too large for container
- bg-clip-text causing clipping issues

**Solutions**:
- Remove or adjust `overflow-hidden` on header
- Add more horizontal padding to text container
- Ensure text container has proper width
- Add `overflow-visible` to text container
- Consider reducing text size slightly if needed
- Add `whitespace-nowrap` prevention or adjust container width

## Implementation Plan

1. Update gradient CSS - reduce opacity, extend fade
2. Fix header container - adjust overflow and padding
3. Fix text container - ensure proper width and padding
4. Test on different screen sizes
5. Verify text is fully visible





