# Chatbot Testing Guide

## Overview
This guide provides testing instructions for the chatbot with markdown formatting and structured data display.

## Development Server

### Starting the Server
```bash
npm run dev
```

The development server should start on `http://localhost:3000`

## Testing Checklist

### 1. Basic Functionality
- [ ] Chatbot toggle button appears in bottom-right corner
- [ ] Chatbot opens/closes when clicking toggle button
- [ ] Chatbot displays welcome message with suggestions
- [ ] Input field is accessible and functional
- [ ] Send button works
- [ ] Messages appear in chat window
- [ ] Scroll to bottom on new messages

### 2. Markdown Rendering
- [ ] **Bold text** renders correctly
- [ ] `Inline code` renders with styling
- [ ] Headings render with proper styling
- [ ] Lists (bullet and numbered) render correctly
- [ ] Icons (🏆, ✅, ⚠️) display correctly
- [ ] Links render with proper styling
- [ ] Tables render correctly (if applicable)
- [ ] Code blocks render correctly (if applicable)

### 3. Structured Data Display
- [ ] Driver badges display with team colors
- [ ] Corner badges display with type indicators
- [ ] Time displays format correctly (lap, corner, sector)
- [ ] Speed displays format correctly (km/h)
- [ ] Delta badges show color coding (green=faster, red=slower)
- [ ] Metric cards display properly
- [ ] Track, year, session information displays

### 4. Query Types

#### Corner Performance Queries
- [ ] "Who was fastest at corner 8 at Monaco 2025?"
- [ ] "Show me corner 3 performance"
- [ ] Verify markdown formatting in response
- [ ] Verify structured data display

#### Driver Performance Queries
- [ ] "Which corner is VER strongest at?"
- [ ] "Show me HAM's performance"
- [ ] Verify markdown formatting in response
- [ ] Verify structured data display

#### Comparison Queries
- [ ] "Compare VER and HAM at corner 3"
- [ ] "Compare VER and HAM"
- [ ] Verify markdown formatting in response
- [ ] Verify structured data display

### 5. Loading States
- [ ] Loading indicator appears while waiting for response
- [ ] Plain text fallback displays during SSR (if applicable)
- [ ] Markdown renders after loading
- [ ] No flash of unstyled content

### 6. Error Handling
- [ ] Error messages display correctly
- [ ] Error messages are user-friendly
- [ ] Chatbot continues to work after errors
- [ ] Network errors are handled gracefully

### 7. Follow-up Suggestions
- [ ] Follow-up suggestions appear after responses
- [ ] Follow-up suggestions are clickable
- [ ] Follow-up suggestions trigger new queries

### 8. Context Handling
- [ ] Track context is passed correctly
- [ ] Year context is passed correctly
- [ ] Session context is passed correctly
- [ ] Driver context is passed correctly

## Test Queries

### Corner Performance
```
Who was fastest at corner 8 at Monaco 2025?
Show me corner 3 performance
Which driver was fastest at corner 5?
```

### Driver Performance
```
Which corner is VER strongest at?
Show me HAM's performance
What are VER's best corners?
```

### Comparisons
```
Compare VER and HAM at corner 3
Compare VER and HAM
Who is faster at corner 8, VER or HAM?
```

### General
```
What sessions are available for Monaco 2025?
Show me track information
```

## Expected Markdown Format

### Headers
```markdown
**Corner 8 - Monaco Q**
```

### Bullet Points
```markdown
- 🏆 **Max Verstappen (VER)** fastest: `1.234s`
- **Lando Norris (NOR)** +`0.053s`
- **Lewis Hamilton (HAM)** +`0.067s`
```

### Inline Code
```markdown
**VER** faster by `0.123s` overall
```

### Icons
- 🏆 for fastest/best
- ✅ for strongest/positive
- ⚠️ for weakest/negative

## Expected Structured Data

### Driver Badges
- Team-colored badges
- Driver code displayed
- Optional full name

### Corner Badges
- Color-coded by type (slow=red, medium=yellow, fast=green)
- Corner number displayed
- Type label displayed

### Time Displays
- Formatted as `M:SS.mmm` or `SS.mmm`
- Consistent formatting
- Units displayed

### Speed Displays
- Formatted as `XXX km/h`
- Rounded values
- Units displayed

### Delta Badges
- Green for faster (negative delta)
- Red for slower (positive delta)
- Formatted as `+X.XXXs` or `-X.XXXs`

## Browser Testing

### Chrome
- [ ] Test all functionality
- [ ] Verify markdown rendering
- [ ] Check console for errors

### Firefox
- [ ] Test all functionality
- [ ] Verify markdown rendering
- [ ] Check console for errors

### Safari
- [ ] Test all functionality
- [ ] Verify markdown rendering
- [ ] Check console for errors

### Edge
- [ ] Test all functionality
- [ ] Verify markdown rendering
- [ ] Check console for errors

## Performance Testing

### Load Time
- [ ] Chatbot loads quickly
- [ ] Markdown library loads efficiently
- [ ] No noticeable delays

### Rendering
- [ ] Markdown renders smoothly
- [ ] No layout shifts
- [ ] Smooth transitions

### Memory
- [ ] No memory leaks
- [ ] Efficient re-rendering
- [ ] Proper cleanup

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab navigation works
- [ ] Enter key sends message
- [ ] Escape key closes chatbot
- [ ] Arrow keys navigate messages

### Screen Readers
- [ ] Proper ARIA labels
- [ ] Content is readable
- [ ] Interactive elements are accessible

### Color Contrast
- [ ] Sufficient color contrast
- [ ] Text is readable
- [ ] Badges are distinguishable

## Mobile Testing

### Responsive Design
- [ ] Chatbot adapts to screen size
- [ ] Touch interactions work
- [ ] Scrolling works properly
- [ ] Input field is accessible

### Performance
- [ ] Fast loading on mobile
- [ ] Smooth scrolling
- [ ] No lag or stuttering

## Known Issues

### SSR Fallback
- Markdown renders as plain text during SSR
- Upgrades to formatted markdown on client
- This is expected behavior

### Loading Delay
- Small delay while markdown library loads
- Mitigated by loading state
- Should be minimal

## Troubleshooting

### Markdown Not Rendering
1. Check browser console for errors
2. Verify markdown library loaded
3. Check network tab for failed requests
4. Verify client-side rendering

### Structured Data Not Displaying
1. Check API response format
2. Verify data structure
3. Check component props
4. Verify formatting components

### Build Errors
1. Clear `.next` directory
2. Run `npm install`
3. Run `npm run build`
4. Check TypeScript errors

## Success Criteria

### Functional
- ✅ All query types work
- ✅ Markdown renders correctly
- ✅ Structured data displays
- ✅ Error handling works
- ✅ Loading states work

### Visual
- ✅ Consistent formatting
- ✅ Proper styling
- ✅ Color coding works
- ✅ Icons display correctly
- ✅ Responsive design

### Performance
- ✅ Fast loading
- ✅ Smooth rendering
- ✅ No lag or stuttering
- ✅ Efficient memory usage

## Next Steps

1. **User Testing**: Test with real users
2. **Performance Optimization**: Optimize loading and rendering
3. **Additional Features**: Add more query types
4. **Error Handling**: Improve error messages
5. **Accessibility**: Enhance accessibility features

---

**Status**: ✅ Ready for Testing
**Last Updated**: 2025-01-08
