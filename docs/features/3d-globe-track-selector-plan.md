# 3D Earth Globe Track Selector - Implementation Plan

## Overview
Replace the current HTML `<select>` dropdown for track selection (lines 117-128 in `components/Toolbar.tsx`) with an interactive 3D Earth globe that displays F1 race locations as pins. The globe will feature smooth animations for rotation, zoom, and pin interactions.

---

## 1. Technology Stack Selection

### Primary Library Options

#### Option A: **react-globe.gl** (Recommended)
- **Pros**: 
  - React-specific wrapper around Globe.gl
  - Built on Three.js/WebGL for hardware acceleration
  - Excellent performance and smooth animations
  - Active maintenance and good documentation
  - Supports custom markers, arcs, and data visualization
  - TypeScript support
- **Cons**: 
  - Additional dependency (~200KB gzipped)
  - Requires WebGL support
- **Installation**: `npm install react-globe.gl`

#### Option B: **@react-three/fiber + @react-three/drei**
- **Pros**: 
  - Full control over 3D scene
  - Modern React Three.js integration
  - Highly customizable
- **Cons**: 
  - More complex implementation
  - Requires building globe from scratch
  - Larger bundle size

#### Option C: **CesiumJS**
- **Pros**: 
  - Professional-grade 3D globe
  - High-quality terrain and imagery
- **Cons**: 
  - Very large bundle size (~2MB+)
  - Overkill for this use case
  - More complex licensing

**Recommendation**: Use **react-globe.gl** for the best balance of features, performance, and ease of implementation.

---

## 2. Data Structure Enhancement

### 2.1 Update `tracks.json` Schema

Add geographic coordinates to each track entry:

```json
{
  "tracks": {
    "bahrain": {
      "id": "bahrain",
      "name": "Bahrain International Circuit",
      "svgFile": "bahrain.svg",
      "corners": [],
      "coordinates": {
        "latitude": 26.0325,
        "longitude": 50.5106
      },
      "city": "Sakhir",
      "country": "Bahrain"
    },
    // ... other tracks
  }
}
```

### 2.2 Track Coordinate Research

Research and compile accurate coordinates for all 24 tracks:

| Track ID | Track Name | City/Country | Latitude | Longitude |
|----------|------------|--------------|----------|-----------|
| bahrain | Bahrain International Circuit | Sakhir, Bahrain | ~26.0325°N | ~50.5106°E |
| saudi-arabia | Jeddah Corniche Circuit | Jeddah, Saudi Arabia | ~21.6319°N | ~39.1044°E |
| australia | Albert Park Circuit | Melbourne, Australia | ~-37.8497°S | ~144.9680°E |
| china | Shanghai International Circuit | Shanghai, China | ~31.3389°N | ~121.2197°E |
| japan | Suzuka Circuit | Suzuka, Japan | ~34.8431°N | ~136.5411°E |
| miami | Miami International Autodrome | Miami, USA | ~25.9581°N | ~-80.2389°W |
| emilia-romagna | Imola | Imola, Italy | ~44.3439°N | ~11.7167°E |
| monaco | Circuit de Monaco | Monte Carlo, Monaco | ~43.7347°N | ~7.4206°E |
| spain | Circuit de Barcelona-Catalunya | Barcelona, Spain | ~41.5700°N | ~2.2611°E |
| canada | Circuit Gilles Villeneuve | Montreal, Canada | ~45.5017°N | ~-73.5228°W |
| austria | Red Bull Ring | Spielberg, Austria | ~47.2197°N | ~14.7647°E |
| great-britain | Silverstone Circuit | Silverstone, UK | ~52.0786°N | ~-1.0169°W |
| belgium | Circuit de Spa-Francorchamps | Spa, Belgium | ~50.4372°N | ~5.9714°E |
| hungary | Hungaroring | Budapest, Hungary | ~47.5789°N | ~19.2486°E |
| netherlands | Circuit Zandvoort | Zandvoort, Netherlands | ~52.3888°N | ~4.5442°E |
| italy | Autodromo Nazionale Monza | Monza, Italy | ~45.6156°N | ~9.2811°E |
| azerbaijan | Baku City Circuit | Baku, Azerbaijan | ~40.3725°N | ~49.8533°E |
| singapore | Marina Bay Street Circuit | Singapore | ~1.2914°N | ~103.8640°E |
| united-states | Circuit of the Americas | Austin, USA | ~30.1327°N | ~-97.6351°W |
| mexico | Autódromo Hermanos Rodríguez | Mexico City, Mexico | ~19.4042°N | ~-99.0907°W |
| brazil | Interlagos | São Paulo, Brazil | ~-23.7036°S | ~-46.6997°W |
| las-vegas | Las Vegas Street Circuit | Las Vegas, USA | ~36.1147°N | ~-115.1728°W |
| qatar | Lusail International Circuit | Lusail, Qatar | ~25.4901°N | ~51.4542°E |
| abu-dhabi | Yas Marina Circuit | Abu Dhabi, UAE | ~24.4672°N | ~54.6031°E |

**Note**: These coordinates are approximate and should be verified with official sources or Google Maps.

---

## 3. Component Architecture

### 3.1 New Component: `GlobeTrackSelector.tsx`

Create a new component that will replace the track dropdown in `Toolbar.tsx`.

**Location**: `components/GlobeTrackSelector.tsx`

**Props Interface**:
```typescript
type GlobeTrackSelectorProps = {
  tracks: Array<{
    id: string
    name: string
    round?: number // Calendar round number for ordering
    coordinates?: {
      latitude: number
      longitude: number
    }
  }>
  selectedTrack: string
  onTrackChange: (trackId: string) => void
  selectedYear: number
  availableTracks: string[] // Filter tracks by year availability
  calendarOrder?: Map<string, number> // Map of track ID to round number
}
```

**Key Features**:
- 3D Earth globe with texture
- Interactive pins for each track
- Red connection lines between races (F1 intro style)
- Smooth camera animations
- Click/hover interactions
- Line pulsation on hover
- Responsive design
- Fallback to dropdown on mobile/unsupported browsers

### 3.2 Integration Points

**Modify `components/Toolbar.tsx`**:
- Replace lines 117-128 (track select dropdown) with `<GlobeTrackSelector />`
- Maintain same props interface for compatibility
- Add conditional rendering based on screen size/WebGL support

**Modify `components/ClientPage.tsx`**:
- Ensure track data includes coordinates when loaded
- Pass coordinate data to Toolbar component

---

## 4. Animation Specifications

### 4.1 Globe Initialization
- **Duration**: 1.5-2 seconds
- **Animation**: 
  - Globe fades in from opacity 0 to 1
  - Initial rotation: slow 360° rotation to show it's interactive
  - Pins animate in with a "drop" effect (scale from 0 to 1 with slight bounce)

### 4.2 Pin Interactions

#### Hover Animation
- **Duration**: 200ms
- **Effects**:
  - Pin scales up 1.2x
  - Pin glows with track's team color (if available)
  - Tooltip appears with track name
  - Globe slightly rotates to bring pin to front

#### Click/Select Animation
- **Duration**: 800ms-1s
- **Effects**:
  - Camera smoothly zooms toward selected pin
  - Globe rotates to center pin in view
  - Selected pin pulses (scale animation)
  - Other pins fade slightly (opacity 0.6)
  - Camera returns to overview position after 2 seconds

### 4.3 Year Change Animation
- **Duration**: 1s
- **Effects**:
  - Pins for unavailable tracks fade out and shrink
  - Available pins fade in and scale up
  - Globe maintains rotation during transition

### 4.4 Continuous Rotation
- **Speed**: Very slow (1 rotation per 60-90 seconds)
- **Direction**: West to East (natural Earth rotation)
- **Pause**: On user interaction (hover/click)
- **Resume**: After 3 seconds of inactivity

### 4.5 Race-to-Race Connection Lines (F1 Intro Style)

#### Line Rendering
- **Color**: Red (#FF0000 or F1 red #E10600)
- **Style**: Great circle arcs connecting races in calendar order
- **Default Appearance**:
  - Width: 1-2 pixels
  - Opacity: 0.4-0.6 (semi-transparent)
  - Smooth curves following Earth's surface
- **Connection Logic**:
  - Connect each race to the next race in the calendar order
  - Lines follow great circle paths (shortest distance on sphere)
  - Only show lines between available tracks for selected year

#### Hover Interaction Animation
- **Duration**: 300ms transition
- **Triggered Lines**: 
  - Line from previous race to hovered race
  - Line from hovered race to next race
- **Visual Effects**:
  - **Width**: Increase from 1-2px to 4-6px
  - **Opacity**: Increase from 0.4-0.6 to 1.0 (fully opaque)
  - **Color**: Brighten to vibrant red (#FF0000)
  - **Pulsation**: 
    - Continuous pulse animation (scale 1.0 → 1.2 → 1.0)
    - Pulse duration: 1.5 seconds per cycle
    - Smooth easing (ease-in-out)
  - **Glow Effect**: Add subtle glow around active lines

#### Line Animation Details
- **Pulsation Pattern**:
  ```typescript
  // Pseudo-code for pulsation
  const pulseScale = 1.0 + 0.2 * Math.sin(time * 2 * Math.PI / 1.5)
  const lineWidth = baseWidth * pulseScale
  const opacity = baseOpacity + 0.3 * (1 + Math.sin(time * 2 * Math.PI / 1.5)) / 2
  ```
- **Performance**: Use GPU-accelerated line rendering
- **Smooth Transitions**: Interpolate line properties on hover enter/exit

#### Calendar Order Determination
- **Data Source**: Use `calendarData.rounds` from `ClientPage.tsx`
- **Sorting**: Order tracks by `round` number
- **Edge Cases**:
  - First race: Only show line to next race
  - Last race: Only show line from previous race
  - Single race: No lines shown
  - Year changes: Recalculate line connections based on available tracks

---

## 5. Visual Design

### 5.1 Globe Appearance
- **Texture**: High-quality Earth texture (NASA Blue Marble or similar)
- **Atmosphere**: Subtle glow effect around edges
- **Lighting**: Ambient + directional light for depth
- **Background**: Dark space background matching app theme

### 5.2 Pin Design
- **Shape**: 3D cone/pin marker or custom F1 flag icon
- **Colors**: 
  - Default: Accent color from app theme
  - Hover: Bright accent color
  - Selected: Pulsing accent color
  - Unavailable: Gray (50% opacity)
- **Size**: 
  - Base: 0.3-0.5 units
  - Hover: 0.6 units
  - Selected: 0.7 units (with pulse)

### 5.3 Tooltip Design
- **Style**: Dark background matching app theme
- **Content**: Track name, city, country
- **Position**: Above pin, follows camera
- **Animation**: Fade in/out with slide

### 5.4 Connection Lines Design
- **Color**: 
  - Default: Red (#E10600 or #FF0000) at 40-60% opacity
  - Hovered: Bright red (#FF0000) at 100% opacity
  - Glow: Subtle red glow (#FF4444) around active lines
- **Width**:
  - Default: 1-2 pixels
  - Hovered: 4-6 pixels (with pulsation)
- **Style**: 
  - Great circle arcs (curved along Earth's surface)
  - Smooth bezier curves for visual appeal
  - Dashed option for inactive lines (optional)
- **Rendering**:
  - Use Three.js Line or Tube geometry
  - Follow globe surface curvature
  - Anti-aliased for smooth appearance

---

## 6. User Interaction Design

### 6.1 Desktop Interactions
- **Mouse Drag**: Rotate globe
- **Mouse Wheel**: Zoom in/out (with limits)
- **Click Pin**: Select track
- **Hover Pin**: Show tooltip
- **Right Click + Drag**: Pan camera (optional)

### 6.2 Touch Interactions (Mobile/Tablet)
- **One Finger Drag**: Rotate globe
- **Pinch**: Zoom
- **Tap Pin**: Select track
- **Long Press**: Show tooltip

### 6.3 Keyboard Accessibility
- **Tab**: Navigate between pins
- **Enter/Space**: Select focused pin
- **Arrow Keys**: Rotate globe
- **Escape**: Close tooltip/return to overview

---

## 7. Performance Considerations

### 7.1 Optimization Strategies
- **Lazy Loading**: Load globe component only when needed
- **Texture Compression**: Use compressed textures (DXT1/DXT5)
- **Level of Detail (LOD)**: Reduce pin detail when zoomed out
- **Frame Rate**: Target 60 FPS, gracefully degrade to 30 FPS if needed
- **WebGL Detection**: Fallback to dropdown if WebGL unavailable

### 7.2 Bundle Size Management
- **Code Splitting**: Load globe library asynchronously
- **Tree Shaking**: Import only needed functions
- **Texture Loading**: Load textures on demand

### 7.3 Mobile Optimization
- **Reduced Quality**: Lower resolution textures on mobile
- **Fewer Pins**: Limit visible pins on small screens
- **Touch Optimization**: Larger hit areas for pins

---

## 8. Implementation Phases

### Phase 1: Setup & Data Preparation
1. Install `react-globe.gl` and dependencies
2. Research and add coordinates to `tracks.json`
3. Create `GlobeTrackSelector.tsx` component skeleton
4. Add TypeScript types for coordinates

### Phase 2: Basic Globe Implementation
1. Render basic 3D Earth globe
2. Add Earth texture
3. Implement basic rotation controls
4. Add dark theme styling

### Phase 3: Pin System
1. Convert track coordinates to 3D positions
2. Render pins on globe
3. Implement pin hover effects
4. Add tooltips

### Phase 3.5: Connection Lines System
1. Calculate great circle paths between consecutive races
2. Render red connection lines in calendar order
3. Implement line rendering with Three.js Line/Tube geometry
4. Add line hover detection
5. Implement pulsation animation for active lines
6. Add glow effects for highlighted lines
7. Handle edge cases (first/last race, year changes)

### Phase 4: Selection & Animation
1. Implement track selection on pin click
2. Add camera animation to selected pin
3. Implement smooth transitions
4. Add selected state styling

### Phase 5: Year Filtering
1. Filter pins based on available tracks for selected year
2. Add fade in/out animations for pin visibility
3. Handle year changes smoothly

### Phase 6: Polish & Optimization
1. Add continuous slow rotation
2. Optimize performance
3. Add loading states
4. Implement fallback for unsupported browsers
5. Add accessibility features

### Phase 7: Integration & Testing
1. Replace dropdown in `Toolbar.tsx`
2. Test all interactions
3. Cross-browser testing
4. Mobile responsiveness testing
5. Performance profiling

---

## 9. Fallback Strategy

### 9.1 WebGL Detection
```typescript
const hasWebGL = () => {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
  } catch {
    return false
  }
}
```

### 9.2 Conditional Rendering
- If WebGL unavailable → Show traditional dropdown
- If mobile device with low performance → Show simplified version or dropdown
- If user prefers reduced motion → Show static globe or dropdown

---

## 10. Accessibility Considerations

### 10.1 Screen Reader Support
- Add ARIA labels to pins
- Announce track selection
- Provide keyboard navigation

### 10.2 Visual Accessibility
- High contrast mode support
- Colorblind-friendly pin colors
- Large enough pin hit areas

### 10.3 Motion Preferences
- Respect `prefers-reduced-motion` CSS media query
- Disable auto-rotation if motion reduced
- Use instant transitions instead of animations

---

## 11. Testing Checklist

### 11.1 Functional Testing
- [ ] All tracks display as pins
- [ ] Pin click selects correct track
- [ ] Year change filters pins correctly
- [ ] Connection lines render between consecutive races
- [ ] Lines follow great circle paths correctly
- [ ] Hover highlights previous and next race lines
- [ ] Line pulsation animation works smoothly
- [ ] Animations are smooth
- [ ] Tooltips display correctly

### 11.2 Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

### 11.3 Performance Testing
- [ ] 60 FPS on desktop
- [ ] 30+ FPS on mobile
- [ ] Smooth animations with 24 pins
- [ ] Smooth line rendering with 23 connection lines
- [ ] Pulsation animation doesn't impact frame rate
- [ ] Fast initial load time

### 11.4 Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Reduced motion respected
- [ ] High contrast mode works

---

## 12. Future Enhancements (Post-MVP)

### 12.1 Advanced Features
- **Race Calendar Visualization**: Show race dates on pins
- **Track Preview**: Mini track layout on pin hover
- **Animated Route Progression**: Animate along connection lines showing calendar progression
- **Weather Visualization**: Color-code pins by weather conditions
- **Time Zone Display**: Show local time at each track
- **Line Animation**: Animate "travel" along lines (particle effects)
- **Multiple Year Comparison**: Show lines for different years with different colors

### 12.2 Data Visualization
- **Lap Time Comparison**: Visualize fastest lap times per track
- **Driver Performance**: Color-code pins by driver performance
- **Historical Data**: Show multiple years with different pin styles

---

## 13. Dependencies to Add

```json
{
  "dependencies": {
    "react-globe.gl": "^2.29.0",
    "three": "^0.160.0"
  },
  "devDependencies": {
    "@types/three": "^0.160.0"
  }
}
```

---

## 14. File Structure Changes

```
components/
  ├── GlobeTrackSelector.tsx (NEW)
  └── Toolbar.tsx (MODIFY - replace dropdown)

public/
  ├── data/
  │   └── tracks.json (MODIFY - add coordinates)
  └── textures/
      └── earth-texture.jpg (NEW - optional, can use CDN)

lib/
  ├── globeUtils.ts (NEW - coordinate conversion utilities)
  └── lineUtils.ts (NEW - great circle path calculations)
```

---

## 15. Estimated Implementation Time

- **Phase 1-2**: 4-6 hours (Setup & basic globe)
- **Phase 3**: 4-5 hours (Pin system)
- **Phase 3.5**: 5-7 hours (Connection lines & pulsation)
- **Phase 4**: 4-5 hours (Selection & animation)
- **Phase 5**: 3-4 hours (Year filtering)
- **Phase 6**: 4-6 hours (Polish & optimization)
- **Phase 7**: 3-4 hours (Integration & testing)

**Total**: ~27-37 hours

---

## 16. Risk Assessment

### 16.1 Technical Risks
- **WebGL Support**: Mitigated by fallback dropdown
- **Performance on Low-End Devices**: Mitigated by quality reduction
- **Bundle Size Increase**: Mitigated by code splitting

### 16.2 UX Risks
- **Learning Curve**: Users may not immediately understand interaction
  - **Mitigation**: Add subtle hints/animations, tooltips
- **Mobile Usability**: 3D interactions can be difficult on small screens
  - **Mitigation**: Simplified mobile version or dropdown fallback

---

---

## 17. Connection Lines Implementation Details

### 17.1 Great Circle Path Calculation

Calculate great circle arcs between two points on a sphere:

```typescript
// Calculate points along great circle path
function calculateGreatCirclePath(
  start: { lat: number, lon: number },
  end: { lat: number, lon: number },
  numPoints: number = 50
): Array<{ lat: number, lon: number }> {
  // Convert to radians
  const lat1 = start.lat * Math.PI / 180
  const lon1 = start.lon * Math.PI / 180
  const lat2 = end.lat * Math.PI / 180
  const lon2 = end.lon * Math.PI / 180
  
  const points = []
  for (let i = 0; i <= numPoints; i++) {
    const fraction = i / numPoints
    const a = Math.sin((1 - fraction) * Math.acos(
      Math.sin(lat1) * Math.sin(lat2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)
    )) / Math.sin(Math.acos(
      Math.sin(lat1) * Math.sin(lat2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)
    ))
    const b = Math.sin(fraction * Math.acos(
      Math.sin(lat1) * Math.sin(lat2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)
    )) / Math.sin(Math.acos(
      Math.sin(lat1) * Math.sin(lat2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)
    ))
    
    const x = a * Math.cos(lat1) * Math.cos(lon1) + b * Math.cos(lat2) * Math.cos(lon2)
    const y = a * Math.cos(lat1) * Math.sin(lon1) + b * Math.cos(lat2) * Math.sin(lon2)
    const z = a * Math.sin(lat1) + b * Math.sin(lat2)
    
    points.push({
      lat: Math.atan2(z, Math.sqrt(x * x + y * y)) * 180 / Math.PI,
      lon: Math.atan2(y, x) * 180 / Math.PI
    })
  }
  return points
}
```

### 17.2 Line Rendering with react-globe.gl

```typescript
// Example usage with react-globe.gl
import Globe from 'react-globe.gl'

// Prepare arcs data
const arcsData = sortedTracks.map((track, index) => {
  if (index === sortedTracks.length - 1) return null // Last track has no next
  
  const nextTrack = sortedTracks[index + 1]
  return {
    startLat: track.coordinates.latitude,
    startLng: track.coordinates.longitude,
    endLat: nextTrack.coordinates.latitude,
    endLng: nextTrack.coordinates.longitude,
    color: '#FF0000',
    stroke: 1,
    opacity: 0.5
  }
}).filter(Boolean)

// In render
<Globe
  arcsData={arcsData}
  arcColor="color"
  arcStroke="stroke"
  arcOpacity="opacity"
  arcDashLength={0}
  arcDashGap={0}
  arcDashAnimateTime={0}
/>
```

### 17.3 Pulsation Animation

```typescript
// Use requestAnimationFrame for smooth pulsation
useEffect(() => {
  let animationFrame: number
  let startTime = Date.now()
  
  const animate = () => {
    const elapsed = (Date.now() - startTime) / 1000 // seconds
    const pulseScale = 1.0 + 0.2 * Math.sin(elapsed * 2 * Math.PI / 1.5)
    const pulseOpacity = 0.7 + 0.3 * (1 + Math.sin(elapsed * 2 * Math.PI / 1.5)) / 2
    
    // Update line properties for hovered connections
    updateHoveredLines(pulseScale, pulseOpacity)
    
    animationFrame = requestAnimationFrame(animate)
  }
  
  if (hoveredTrackId) {
    animate()
  }
  
  return () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
    }
  }
}, [hoveredTrackId])
```

### 17.4 Hover Detection Logic

```typescript
// Determine which lines to highlight on hover
function getHoveredLines(
  hoveredTrackId: string,
  sortedTracks: Track[]
): { previousLine: number | null, nextLine: number | null } {
  const hoveredIndex = sortedTracks.findIndex(t => t.id === hoveredTrackId)
  
  if (hoveredIndex === -1) {
    return { previousLine: null, nextLine: null }
  }
  
  return {
    previousLine: hoveredIndex > 0 ? hoveredIndex - 1 : null,
    nextLine: hoveredIndex < sortedTracks.length - 1 ? hoveredIndex : null
  }
}
```

---

## Conclusion

This plan provides a comprehensive roadmap for replacing the dropdown with an interactive 3D Earth globe featuring F1-style connection lines. The implementation should prioritize smooth animations, performance, and accessibility while maintaining the existing functionality of track selection.

The recommended approach uses `react-globe.gl` for its balance of features and ease of implementation, with careful attention to performance optimization and fallback strategies for unsupported environments.

**Key Features Summary**:
- 3D Earth globe with interactive pins
- Red connection lines between races in calendar order
- Smooth pulsation animation on hover
- F1 intro-style visual presentation
- Great circle path calculations for accurate line rendering

