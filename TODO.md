# TODO - Unfinished Work & Future Improvements

This file tracks unfinished work, known issues, and planned improvements that need to be addressed in future edits.

## 🚨 Critical Issues (Fix Soon)

### 1. Missing Components/Features
- [ ] **GlobeTrackSelector.tsx was deleted** - Need to verify if 3D globe track selector is still needed or replaced
- [ ] **cornerPositionCalculator.ts was deleted** - Verify if functionality was moved elsewhere
- [ ] **f1_corners.py and f1_test.py deleted** - Check if these were legacy files or still needed

### 2. Code Cleanup Needed
- [ ] Remove unused imports and dead code
- [ ] Consolidate duplicate functionality
- [ ] Update type definitions for removed components

## 🔧 High Priority Fixes

### 3. Corner Coordinates & Validation
- [ ] Verify corner coordinates for all tracks are accurate
- [ ] Add corner coordinate validation script
- [ ] Test hover functionality on all tracks
- [ ] Fix any corner coordinates that are outside viewBox bounds

### 4. Data Quality
- [ ] Improve corner detection accuracy
- [ ] Add missing corner data detection
- [ ] Validate corner matching logic
- [ ] Add data quality checks in pipeline

### 5. Error Handling
- [ ] Add comprehensive error handling for missing data
- [ ] Add loading states for all async operations
- [ ] Improve error messages for users
- [ ] Add fallback UI for error states

## 🎨 UI/UX Improvements

### 6. Output Formatting & Visual Clarity ⭐ NEW
- [ ] Create formatting utilities library (formatTime, formatDelta, formatSpeed)
- [ ] Build reusable component library (MetricCard, DeltaBadge, CornerBadge, DriverBadge)
- [ ] Add markdown support to chatbot responses
- [ ] Enhance table formatting with visual indicators and highlighting
- [ ] Implement color-coded deltas (green=faster, red=slower)
- [ ] Add icon indicators for best times, trends, and status
- [ ] Create comparison cards for driver comparisons
- [ ] Enhance chart tooltips with formatted data and context
- [ ] Improve typography hierarchy and spacing
- [ ] Add data quality indicators (badges, warnings)
- [ ] Implement responsive table design
- [ ] Add accessibility improvements (ARIA labels, keyboard navigation)
- **See**: `docs/output-formatting-plan.md` for detailed plan
- **Quick Reference**: `docs/output-formatting-quick-reference.md`
- **Summary**: `docs/output-formatting-summary.md`

### 7. Chart Enhancements
- [ ] Add lap time delta visualization (time gained/lost vs reference)
- [ ] Add sector time breakdown in tooltip
- [ ] Add compound change indicators on chart
- [ ] Add DRS zone visualization
- [ ] Add chart export (PNG/SVG)
- [ ] Add chart zoom/pan for race sessions
- [ ] Add lap range selector

### 8. Track Panel Improvements
- [ ] Add corner coordinate editing UI
- [ ] Add corner position adjustment tool
- [ ] Show corner coordinates in tooltip
- [ ] Add track zoom/pan functionality
- [ ] Add corner filtering by type
- [ ] Add speed trace overlay option
- [ ] Add braking/acceleration zone visualization

### 9. Analysis Panel Enhancements
- [ ] Verify all analysis panels are working correctly
- [ ] Add more analysis types
- [ ] Improve analysis visualization
- [ ] Add analysis export functionality

## 📊 Feature Enhancements

### 10. Corner Analysis
- [ ] Add corner-by-corner comparison
- [ ] Add corner performance trends over time
- [ ] Add corner difficulty ranking
- [ ] Add corner overtaking analysis
- [ ] Add corner-specific strategy analysis

### 11. Session Analysis
- [ ] Add race pace analysis
- [ ] Complete stint analysis implementation
- [ ] Add tyre degradation visualization
- [ ] Add fuel load estimation
- [ ] Add pit stop strategy comparison

### 12. Race Event Visualization
- [ ] Add legend for event markers
- [ ] Add tooltip on hover for event markers showing details
- [ ] Fine-tune event label positioning for edge cases
- [ ] Consider alternative layouts for very dense areas

## 🏗️ Technical Debt

### 13. Code Quality
- [ ] Add TypeScript strict mode
- [ ] Add unit tests for critical functions
- [ ] Add E2E tests for key workflows
- [ ] Improve code documentation
- [ ] Add JSDoc comments to functions

### 14. Performance
- [ ] Optimize large session data rendering
- [ ] Add virtual scrolling for corner table
- [ ] Add data caching for frequently accessed sessions
- [ ] Optimize SVG rendering
- [ ] Implement data pagination
- [ ] Add request caching

### 15. Testing
- [ ] Test all tracks for corner hover
- [ ] Test all session types
- [ ] Test with various driver combinations
- [ ] Test edge cases (no data, missing corners, etc.)
- [ ] Test performance with large datasets
- [ ] Browser compatibility testing (Chrome, Firefox, Safari, Edge)

## 📚 Documentation

### 16. Documentation Updates
- [ ] Update README with latest changes
- [ ] Add API documentation
- [ ] Add component documentation
- [ ] Add data structure documentation
- [ ] Add deployment guide updates
- [ ] Document new analysis features
- [ ] Update project structure documentation

## ♿ Accessibility

### 17. Accessibility Improvements
- [ ] Add keyboard navigation
- [ ] Add screen reader support
- [ ] Add ARIA labels
- [ ] Improve color contrast
- [ ] Add focus indicators
- [ ] Test with accessibility tools

## 🚀 Future Features

### 18. Advanced Analytics
- [ ] Add machine learning predictions
- [ ] Add driver performance models
- [ ] Add strategy optimization
- [ ] Add race simulation
- [ ] Add weather impact analysis

### 19. Mobile Support
- [ ] Optimize for mobile devices
- [ ] Add touch gestures
- [ ] Add mobile-specific UI
- [ ] Add offline support
- [ ] Add PWA features

### 20. Social Features
- [ ] Add session sharing
- [ ] Add comparison sharing
- [ ] Add comments/annotations
- [ ] Add favorites/bookmarks

## 📝 Notes

### Recently Completed ✅
- **AI-Powered Chatbot**: Fully implemented with Google Gemini AI integration
  - Fixed Gemini API model name (gemini-2.5-flash)
  - Improved error handling with user-friendly messages
  - Added fallback response generation
  - Enhanced query classification (driver codes, track names)
  - Better context awareness
- Corner hover detection fixed
- Event label overlap prevention implemented
- Safety car/VSC period highlighting added
- Pit stop detection using in-lap flag
- Race event markers added
- Analysis panels implemented
- Table of contents navigation added
- TypeScript type safety improvements in analysis components

### In Progress 🚧
- Corner coordinate validation
- Analysis panel enhancements
- Performance optimizations

### Blocked ⏸️
- None currently

## 🔍 How to Use This File

1. **Before starting work**: Check this file for related items
2. **When fixing issues**: Mark items as complete with ✅
3. **When adding new features**: Add new items here if they're not fully implemented
4. **When finding bugs**: Add them to the appropriate section
5. **Regular review**: Update priorities based on user feedback and project needs

## 📌 Priority Guide

- 🚨 **Critical**: Fix immediately, blocks functionality
- 🔧 **High Priority**: Should be fixed soon, impacts user experience
- 🎨 **Medium Priority**: Nice to have, improves usability
- 📊 **Feature Enhancements**: New features to add
- 🏗️ **Technical Debt**: Code quality and maintenance
- 🚀 **Future**: Long-term goals, not urgent

---

**Last Updated**: 2025-01-08
**Next Review**: Weekly

## 🎯 Quick Reference

### Immediate Actions Needed
1. ✅ Verify deleted components (GlobeTrackSelector, cornerPositionCalculator) - functionality replaced
2. ✅ Update README to reflect component changes - Done
3. Test new AnalysisPanel and TableOfContents components
4. Verify corner coordinates after recent changes
5. ✅ Test chatbot functionality with various queries - Error handling improved
6. ✅ Verify GEMINI_API_KEY environment variable setup - Fixed model name
7. Test chatbot with edge cases and various query formats
8. Monitor chatbot performance and error rates
9. ⭐ **Review output formatting plan** - See `docs/output-formatting-plan.md`
10. ⭐ **Start Phase 1 implementation** - Create formatting utilities and base components

### Code Markers to Search For
- `TODO:` - Work that needs to be done
- `FIXME:` - Broken code that needs fixing
- `XXX:` - Warning about problematic code
- `HACK:` - Workaround that should be replaced
- `NOTE:` - Important information

### Files with Known Issues
- Check `components/ClientPage.tsx` for integration issues
- Review `components/ChartPanel.tsx` for race event handling
- Verify `components/AnalysisPanel.tsx` is fully functional
- Check `components/TrackPanel.tsx` for corner hover fixes

