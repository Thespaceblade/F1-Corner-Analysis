# Chatbot Icon Positioning - Important Notes

## Critical Implementation Details

The F1 chatbot icon has specific positioning requirements that must be maintained. If the icon is accidentally changed, refer to this document to restore the correct implementation.

### Requirements

1. **Position**: The chatbot icon MUST be positioned in the bottom-right corner of the viewport
2. **Positioning Type**: MUST use `fixed` positioning (NOT `absolute` or `relative`)
3. **Container Location**: MUST be outside the `<main>` container (as a sibling, not a child)
4. **Visibility**: MUST remain visible on screen at all times, regardless of scroll position
5. **Hover Animation**: MUST include `hover:scale-110` for the correct hover effect

### Correct Implementation

#### In `components/ClientPage.tsx`:

```tsx
return (
  <div className="relative">
    {/* ... page content ... */}
    </main>
    <Chatbot 
      context={{
        track: selectedTrack,
        year: selectedYear,
        session: selectedSession,
        drivers: selectedDrivers,
      }}
    />
  </div>
)
```

**Key Points:**
- Chatbot component is rendered **outside** the `<main>` tag
- Chatbot is a sibling of `<main>`, not a child
- The wrapper div has `relative` class (for other positioning needs)

#### In `components/Chatbot.tsx`:

```tsx
return (
  <>
    {/* Chatbot Toggle Button - fixed in bottom right corner, stays on screen */}
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[var(--accent-clr)] text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-110"
      aria-label="Toggle chatbot"
    >
      {/* ... icon content ... */}
    </button>
    {/* ... chatbot window ... */}
  </>
)
```

**Key Points:**
- Button MUST use `fixed` class (NOT `absolute`)
- Button MUST have `bottom-6 right-6` for positioning
- Button MUST include `hover:scale-110` for hover animation
- Button MUST have `z-50` to stay above other content

### Common Mistakes to Avoid

❌ **DO NOT** place the Chatbot component inside the `<main>` container
❌ **DO NOT** use `absolute` positioning instead of `fixed`
❌ **DO NOT** remove the `hover:scale-110` animation
❌ **DO NOT** position it relative to the main container

### Why This Matters

- **Fixed positioning** ensures the icon stays in the viewport regardless of scroll
- **Outside main container** prevents layout issues and ensures proper z-index stacking
- **Hover animation** provides the expected user experience
- **Bottom-right corner** is the standard location for chatbot icons

### History

This implementation was established in commit `1711fd2` (feat: add AI-powered chatbot feature with Google Gemini integration) and should be maintained as the standard.

### Last Verified

- Date: 2025-01-XX
- Status: Correctly implemented
- Location: `components/Chatbot.tsx` and `components/ClientPage.tsx`


