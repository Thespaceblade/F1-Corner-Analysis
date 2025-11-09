# Header Section - Implementation Prompt

## Create a premium header section with these specifications:

### Layout
- **Structure**: Logo (left) + Title/Subtitle/Attribution (right) on desktop; stacked on mobile
- **Container**: Relative positioning with z-index layering
- **Responsive**: Vertical stack mobile, horizontal layout desktop (md: 768px+)

### Background Effects
- **Gradient**: Radial gradient (ellipse 100-110%) positioned at 10-12% from left, 50% vertical
- **Colors**: Accent color (rgba(124, 199, 255, ...)) fading: 0.12 → 0.06 → 0.02 → transparent
- **Animation**: Slow pulse (4s cycle, opacity 1.0 → 0.7 → 1.0)
- **Fade Distance**: Transparent by 65-70% of radius
- **Important**: Gradient should ONLY affect logo area, NOT text area
- **Bottom Fade**: Linear gradient (24px height) from transparent → page-bg for seamless blend

### Logo
- **Size**: 96px mobile, 144px desktop (circular)
- **Border**: 1px solid, accent color at 40% opacity
- **Background**: Transparent (NO glass effects)
- **Glow**: Single subtle glow (8px outside, 10% opacity, blur-xl)
- **Hover**: Scale 1.05x, border brightens to 60%, glow increases to 15%
- **Image**: 160px, object-contain, padding 6-10px

### Typography
- **Title**: 
  - Size: 5xl mobile, 7xl desktop
  - Weight: Bold, tracking: -0.02em
  - Part 1: Accent color (#7cc7ff) - SOLID, not transparent
  - Part 2: White (#ffffff) - SOLID
  - **Critical**: Use solid colors with text-shadow for glow, NOT `bg-clip-text` with transparent text
  - Shadows: Dual-layer (glow: 0 0 20px rgba(124,199,255,0.4), depth: 0 2px 8px rgba(0,0,0,0.5))
- **Subtitle**: base/lg size, medium weight, subtext color, wide tracking
- **Attribution**: xs/sm size, subtext color 70%, links accent color 80%

### Animations
- **Logo Enter**: 0.7s spring animation (scale 0.85→1.05→1, rotate -8°→2°→0°, fade in)
- **Text Enter**: 0.6s fade-up (translateY 10px→0, fade in) with 0.3s delay
- **Stagger**: Title 0.3s, Subtitle 0.4s, Attribution 0.6s
- **Background Pulse**: 4s infinite pulse (opacity 1→0.7→1)
- **Reduced Motion**: Disable all animations when `prefers-reduced-motion: reduce`

### Colors
- Background: #0d0f13 (dark)
- Accent: #7cc7ff (blue)
- Text: #ffffff (white)
- Subtext: #9aa4b2 (gray)

### Spacing
- Padding: py-10/px-6 mobile, py-12/px-12 desktop
- Gap: 20px mobile, 40px desktop
- Margin: mb-8 (32px) below header
- Text spacing: 10-12px between title/subtitle, 8px to attribution

### Key Requirements
1. **Text must be SOLID colors** - never use transparent gradient text (causes coverage issues)
2. **Gradient only behind logo** - position and size so it doesn't reach text area
3. **No glass effects** - transparent background, minimal shadows
4. **Smooth animations** - GPU-accelerated (transform, opacity only)
5. **Accessibility** - WCAG AA contrast, focus states, reduced motion support
6. **Responsive** - Test on mobile (375px), tablet (768px), desktop (1280px+)

### Z-Index Layers
- Background gradient: 0
- Fade-out gradient: 1
- Content: 2
- Logo glow (behind): -1 (relative to logo)

### Example Structure
```tsx
<header className="relative mb-8 overflow-visible">
  <div className="absolute inset-0 bg-gradient-radial-header animate-pulse-slow z-0" />
  <div className="absolute -bottom-8 left-0 right-0 h-24 bg-gradient-to-b from-transparent via-page-bg/80 to-page-bg z-[1]" />
  <div className="relative flex flex-col md:flex-row items-center md:items-end gap-5 md:gap-10 py-10 md:py-12 px-6 md:px-12 z-[2]">
    {/* Logo with subtle glow */}
    {/* Title with solid colors and shadows */}
    {/* Subtitle with decorative lines */}
    {/* Attribution links */}
  </div>
</header>
```

This creates a clean, premium header with excellent readability, subtle animations, and seamless page integration.




