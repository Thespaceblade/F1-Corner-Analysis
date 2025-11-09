# Header Section Implementation Prompt

## Create a Premium Header Section with the Following Specifications:

### Overall Design Philosophy
Create a sophisticated, modern header with a dark theme that features:
- Clean, minimal design with subtle visual effects
- Animated gradient background positioned behind logo only
- Solid, readable text with glow effects (not transparent gradient text)
- Smooth fade-out transition blending into page background
- Responsive layout that stacks on mobile, horizontal on desktop

---

### Layout Structure

**Container Structure:**
```
<header> (relative, mb-8, overflow-visible)
  ├─ Gradient Background Layer (absolute, z-index: 0)
  ├─ Fade-out Gradient Layer (absolute, z-index: 1, positioned at bottom)
  └─ Content Container (relative, z-index: 2)
      ├─ Logo Section (left on desktop, centered on mobile)
      └─ Text Content Section (right on desktop, below logo on mobile)
          ├─ Main Title (h1)
          ├─ Subtitle
          └─ Attribution Links
```

**Responsive Breakpoints:**
- Mobile: Stacked vertically, centered
- Desktop (md: 768px+): Horizontal layout, left-aligned logo, left-aligned text

---

### Visual Design Elements

#### 1. Background Gradient
- **Type**: Radial gradient, elliptical
- **Position**: Left side (10-12% from left, 50% vertical)
- **Size**: 100-110% ellipse
- **Colors**: Accent color (rgba(124, 199, 255, ...)) fading to transparent
- **Opacity**: 0.12 → 0.06 → 0.02 → transparent
- **Animation**: Slow pulse (4s cycle, opacity 1.0 → 0.7 → 1.0)
- **Fade Distance**: Transparent by 65-70% of gradient radius
- **Mobile**: Smaller, more subtle (100% ellipse, max 0.12 opacity)
- **Desktop**: Slightly larger (110% ellipse, max 0.15 opacity)

#### 2. Fade-out Gradient (Bottom Transition)
- **Position**: Bottom of header, extending 24px below
- **Type**: Linear gradient (top to bottom)
- **Colors**: transparent → page-bg/80 → page-bg (solid)
- **Height**: 24px (h-24)
- **Purpose**: Seamless blend with page background

#### 3. Logo Container
- **Size**: 
  - Mobile: 96px (h-24 w-24)
  - Desktop: 144px (h-36 w-36)
- **Shape**: Perfect circle (rounded-full)
- **Border**: 1px solid, accent color at 40% opacity
- **Background**: Transparent (no glass effect)
- **Glow Effect**: 
  - Single subtle glow layer
  - Position: 8px outside container (inset-[-8px])
  - Color: Accent at 10% opacity
  - Blur: xl (24px)
  - Hover: Increases to 15% opacity
- **Image**: 
  - Size: 160x160px
  - Padding: 6px mobile, 10px desktop
  - Object-fit: contain
- **Hover Effects**:
  - Scale: 1.05x (subtle)
  - Border: Brightens to 60% opacity
  - Glow: Slightly increases
  - Transition: 300ms smooth

#### 4. Main Title (h1)
- **Font Size**: 
  - Mobile: 5xl (3rem / 48px)
  - Desktop: 7xl (4.5rem / 72px)
- **Font Weight**: Bold (700)
- **Letter Spacing**: -0.02em (slightly tight)
- **Line Height**: Tight (leading-tight)
- **Layout**: Two-part title
  - Part 1: Accent color (#7cc7ff)
  - Part 2: White (#ffffff)
- **Text Effects**:
  - Part 1: Solid color with dual-layer shadow
    - Glow shadow: 0 0 20px rgba(124,199,255,0.4)
    - Depth shadow: 0 2px 8px rgba(0,0,0,0.5)
  - Part 2: White with depth shadow
    - Shadow: 0 2px 8px rgba(0,0,0,0.5)
- **Important**: Use solid colors, NOT transparent gradient text
- **Word Break**: Allow breaking if needed (break-words)
- **Padding**: 8px horizontal on mobile, none on desktop

#### 5. Subtitle
- **Font Size**: base (16px) mobile, lg (18px) desktop
- **Color**: Subtext color at full opacity
- **Weight**: Medium (500)
- **Tracking**: Wide (tracking-wide)
- **Shadow**: Subtle (0 1px 4px rgba(0,0,0,0.2))
- **Decoration**: Optional gradient lines on sides (hidden on mobile)
  - Lines: 1px height, 40-48px width
  - Gradient: transparent → accent/60 → transparent
  - Only visible on sm+ screens

#### 6. Attribution Section
- **Font Size**: xs (12px) mobile, sm (14px) desktop
- **Color**: Subtext color at 70% opacity
- **Layout**: Horizontal flex with separators (•)
- **Links**: 
  - Color: Accent at 80% opacity
  - Hover: Accent at full opacity
  - No underlines
  - Smooth color transition (200ms)
- **Icons**: 
  - Size: 16px (w-4 h-4)
  - Hover: Scale to 1.1x
  - Smooth transition (200ms)
- **Spacing**: 12-16px gap between elements

---

### Animations

#### 1. Background Pulse Animation
```css
@keyframes pulse-slow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```
- **Duration**: 4s
- **Timing**: ease-in-out
- **Loop**: Infinite
- **Applied to**: Gradient background

#### 2. Logo Entrance Animation
```css
@keyframes logo-enter {
  0% {
    opacity: 0;
    transform: scale(0.85) rotate(-8deg);
  }
  60% {
    transform: scale(1.05) rotate(2deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}
```
- **Duration**: 0.7s
- **Timing**: cubic-bezier(0.34, 1.56, 0.64, 1) (spring-like)
- **Applied to**: Logo image
- **Effect**: Subtle bounce on entrance

#### 3. Text Entrance Animation
```css
@keyframes text-enter {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
```
- **Duration**: 0.6s
- **Delay**: 0.3s (staggered after logo)
- **Timing**: ease-out
- **Applied to**: Title and subtitle
- **Stagger**: Subtitle at 0.4s delay, attribution at 0.6s delay

#### 4. Reduced Motion Support
- Respect `prefers-reduced-motion: reduce`
- Disable all animations for users who prefer reduced motion
- Use `@media (prefers-reduced-motion: reduce)` to set animations to `none`

---

### Color Scheme

**Required CSS Variables:**
```css
:root {
  --page-bg: #0d0f13;        /* Dark background */
  --accent-clr: #7cc7ff;     /* Accent blue */
  --text-clr: #e7eaee;       /* Main text (white) */
  --subtext-clr: #9aa4b2;    /* Secondary text (gray) */
}
```

**Color Usage:**
- **Title Part 1**: #7cc7ff (accent blue, solid)
- **Title Part 2**: #ffffff (white, solid)
- **Subtitle**: subtext-clr (gray, full opacity)
- **Links**: accent-clr at 80% opacity, 100% on hover
- **Logo Border**: accent-clr at 40% opacity, 60% on hover
- **Glow**: accent-clr at 10% opacity, 15% on hover
- **Gradient**: accent-clr fading from 0.12-0.15 → transparent

---

### Spacing & Sizing

**Container Padding:**
- Mobile: py-10 (40px vertical), px-6 (24px horizontal)
- Desktop: py-12 (48px vertical), px-12 (48px horizontal)

**Gaps:**
- Mobile: gap-5 (20px)
- Desktop: gap-10 (40px)

**Margin Bottom:**
- Header: mb-8 (32px)

**Logo Sizing:**
- Mobile: 96px × 96px
- Desktop: 144px × 144px
- Image: 160px × 160px (scales down to fit)

**Text Spacing:**
- Title to Subtitle: space-y-2.5 (10px) mobile, space-y-3 (12px) desktop
- Subtitle to Attribution: mt-2 (8px)

---

### Typography

**Font Family**: Sans-serif (system default)

**Title:**
- Size: 5xl → 7xl (responsive)
- Weight: Bold (700)
- Tracking: -0.02em
- Line Height: Tight

**Subtitle:**
- Size: base → lg (responsive)
- Weight: Medium (500)
- Tracking: Wide

**Attribution:**
- Size: xs → sm (responsive)
- Weight: Normal (400)

---

### Interactive Elements

#### Logo Hover:
- Scale: 1.05x
- Border: Brightens (40% → 60% opacity)
- Glow: Increases (10% → 15% opacity)
- Transition: 300ms

#### Link Hover:
- Color: Brightens (80% → 100% opacity)
- Icon: Scales to 1.1x
- Transition: 200ms

---

### Accessibility Requirements

1. **Focus States**: 
   - Visible focus indicators on all interactive elements
   - Use focus-visible for keyboard navigation
   - Accent color outline, 2px, with offset

2. **Color Contrast**:
   - Ensure WCAG AA compliance (4.5:1 for text)
   - Test all text colors against background

3. **Reduced Motion**:
   - Respect prefers-reduced-motion
   - Disable animations when requested

4. **Semantic HTML**:
   - Use proper heading hierarchy (h1 for main title)
   - Use semantic links with proper rel attributes
   - Include aria-labels for icon-only links

5. **Alt Text**:
   - Descriptive alt text for logo image
   - Include context (e.g., "F1 Corner Analysis logo")

---

### Z-Index Layering

- **Background Gradient**: z-index: 0
- **Fade-out Gradient**: z-index: 1
- **Content Container**: z-index: 2
- **Logo Glow (behind)**: z-index: -1 (relative to logo container)

---

### Implementation Notes

1. **Text Rendering**: 
   - Use solid colors, NOT `bg-clip-text` with transparent text
   - Gradient text causes coverage issues with background gradients
   - Use text-shadow for glow effects instead

2. **Gradient Positioning**:
   - Position gradient to only affect logo area, not text
   - Keep gradient small and subtle
   - Fade to transparent before reaching text area

3. **Performance**:
   - Use GPU-accelerated properties (transform, opacity)
   - Avoid heavy blur effects
   - Optimize images (use Next.js Image or similar)

4. **Responsive Design**:
   - Test on mobile (375px, 414px)
   - Test on tablet (768px, 1024px)
   - Test on desktop (1280px, 1920px)
   - Ensure text doesn't overflow or get cut off

5. **Browser Support**:
   - Test in Chrome, Firefox, Safari
   - Ensure gradients work in all modern browsers
   - Provide fallbacks for older browsers if needed

---

### Example Structure (React/Next.js)

```tsx
<header className="relative mb-8 overflow-visible">
  {/* Animated gradient background - behind logo only */}
  <div className="absolute inset-0 bg-gradient-radial-header animate-pulse-slow pointer-events-none z-0" />
  
  {/* Fade-out gradient at bottom */}
  <div className="absolute -bottom-8 left-0 right-0 h-24 bg-gradient-to-b from-transparent via-[var(--page-bg)]/80 to-[var(--page-bg)] pointer-events-none z-[1]" />
  
  {/* Content container */}
  <div className="relative flex flex-col md:flex-row items-center md:items-end justify-center md:justify-start gap-5 md:gap-10 py-10 md:py-12 px-6 md:px-12 z-[2]">
    
    {/* Logo */}
    <div className="relative group flex-shrink-0 z-[2]">
      <div className="absolute inset-[-8px] bg-accent/10 rounded-full blur-xl group-hover:bg-accent/15 transition-all duration-300 -z-10" />
      <div className="relative flex h-24 w-24 md:h-36 md:w-36 items-center justify-center rounded-full border border-accent/40 bg-transparent group-hover:scale-105 group-hover:border-accent/60 transition-all duration-300">
        <Image
          src="/logo.png"
          alt="Logo"
          width={160}
          height={160}
          className="object-contain p-1.5 md:p-2.5 animate-logo-enter"
          priority
        />
      </div>
    </div>
    
    {/* Text content */}
    <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2.5 md:space-y-3 min-w-0 flex-1 w-full relative z-[2]">
      <h1 className="text-5xl md:text-7xl font-bold tracking-[-0.02em] animate-text-enter leading-tight break-words px-2 md:px-0">
        <span className="text-[#7cc7ff] drop-shadow-[0_0_20px_rgba(124,199,255,0.4),0_2px_8px_rgba(0,0,0,0.5)]">
          Part 1
        </span>
        <span className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
          {' '}Part 2
        </span>
      </h1>
      <div className="flex items-center gap-3 md:gap-4 animate-text-enter" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
        <div className="h-px w-10 md:w-12 bg-gradient-to-r from-transparent via-accent/60 to-transparent hidden sm:block" />
        <p className="text-base md:text-lg text-subtext-clr font-medium tracking-wide drop-shadow-[0_1px_4px_rgba(0,0,0,0.2)]">
          Subtitle text
        </p>
        <div className="h-px w-10 md:w-12 bg-gradient-to-r from-transparent via-accent/60 to-transparent hidden sm:block" />
      </div>
      
      {/* Attribution */}
      <div className="flex items-center gap-3 md:gap-4 animate-text-enter justify-center md:justify-start mt-2" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
        {/* Attribution links */}
      </div>
    </div>
  </div>
</header>
```

---

### CSS Requirements

**Required Animations:**
- `pulse-slow`: 4s pulse animation
- `logo-enter`: 0.7s spring-like entrance
- `text-enter`: 0.6s fade-up entrance

**Required Gradient:**
- `.bg-gradient-radial-header`: Radial gradient positioned left, fading to transparent

**Required Utilities:**
- Responsive sizing utilities
- Z-index utilities
- Animation delay utilities
- Reduced motion media query

---

### Key Design Principles

1. **Clarity**: Text must be solid and readable, never transparent
2. **Subtlety**: Effects should enhance, not distract
3. **Performance**: Use GPU-accelerated animations
4. **Accessibility**: Support all users, including those with motion sensitivity
5. **Responsive**: Work beautifully on all screen sizes
6. **Clean**: Minimal design, no unnecessary effects
7. **Professional**: Premium feel without being flashy

---

### Testing Checklist

- [ ] Text is fully readable (no coverage issues)
- [ ] Gradient only affects logo area, not text
- [ ] Logo has no glass-like effects
- [ ] Animations are smooth (60fps)
- [ ] Responsive on all screen sizes
- [ ] Accessibility compliant (WCAG AA)
- [ ] Reduced motion respected
- [ ] Focus states visible
- [ ] Hover effects work smoothly
- [ ] No performance issues

---

This header design creates a premium, professional appearance with clean typography, subtle animations, and excellent readability while maintaining a modern, sophisticated aesthetic.




