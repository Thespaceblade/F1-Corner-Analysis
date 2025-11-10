# Event Label Organization Plan

## Problem
Multiple race event labels overlap when events occur on the same lap or nearby laps. All labels currently use:
- `position: 'top'`
- `offset: 5`
- Same vertical position = overlapping labels

## Current Event Types
1. **Race Start** (lap 1) - Green, "🏁 Start"
2. **Pit Stops** - Orange, "Pit" (per driver)
3. **Safety Car Start/End** - Yellow, "SC start" / "SC end"
4. **VSC Start/End** - Light yellow, "VSC start" / "VSC end"
5. **Yellow Flags** - Yellow, "Yellow"
6. **Red Flags** - Red, "Red Flag"

## Solution Strategy

### Option 1: Vertical Staggering with Collision Detection (Recommended)
**Approach:**
- Group events by lap number
- Assign vertical offsets based on:
  - Event priority (Red Flag > Race Start > SC/VSC > Pit Stops > Yellow Flags)
  - Lap proximity (events on same lap get different offsets)
  - Number of events on nearby laps

**Implementation:**
1. Collect all events (point events + period start/end events)
2. Sort by lap number
3. For each lap, assign vertical offset slots:
   - Slot 0: offset 5px (top priority)
   - Slot 1: offset 20px
   - Slot 2: offset 35px
   - Slot 3: offset 50px
   - etc.
4. Detect collisions: if events on lap N and lap N+1 would overlap, increase offset
5. Consider lap width: if laps are close together (within 2-3 lap numbers), need more spacing

**Pros:**
- Clear visual hierarchy
- Prevents overlaps
- Maintains readability
- Works for dense event areas

**Cons:**
- More complex implementation
- Requires collision detection logic

### Option 2: Alternate Top/Bottom Positioning
**Approach:**
- High priority events: top position
- Low priority events: bottom position
- Period events (SC/VSC): top for start, bottom for end (or vice versa)

**Implementation:**
- Race Start, Red Flags: top
- Pit Stops: bottom (or alternate)
- SC/VSC start: top
- SC/VSC end: bottom
- Yellow Flags: bottom

**Pros:**
- Simple implementation
- Clear separation
- Uses chart space efficiently

**Cons:**
- Less intuitive (events on same lap split)
- Bottom labels might be obscured by chart data
- Doesn't solve overlap for same-position events

### Option 3: Combined Labels for Same-Lap Events
**Approach:**
- When multiple events occur on same lap, combine into one label
- Format: "Pit (VER, NOR) | SC start"

**Implementation:**
- Group events by lap number
- Create combined label text
- Show multiple lines or comma-separated
- Use highest priority event's color

**Pros:**
- Reduces label count
- Clear indication of multiple events
- No overlaps on same lap

**Cons:**
- Labels can get long
- Less granular information
- Harder to read

### Option 4: Horizontal Offsetting
**Approach:**
- Offset labels horizontally (left/right of the line)
- Use angle or connection lines

**Implementation:**
- Use `angle` property in label
- Offset x position slightly
- Add connecting lines to reference line

**Pros:**
- Prevents vertical overlap
- Can be combined with vertical staggering

**Cons:**
- Requires more chart space
- Can look cluttered
- Recharts label positioning is limited

## Recommended Implementation: Hybrid Approach

### Phase 1: Smart Vertical Staggering
1. **Event Priority System:**
   ```
   Priority 1: Red Flag (highest)
   Priority 2: Race Start
   Priority 3: SC/VSC period start/end
   Priority 4: Pit Stops
   Priority 5: Yellow Flags (lowest)
   ```

2. **Offset Calculation:**
   - Base offset: 5px
   - Offset increment: 15px per priority level
   - Additional offset for same-lap events: +15px per event
   - Collision buffer: if events within 2 laps, add 10px buffer

3. **Label Assignment Algorithm:**
   ```
   For each event in sorted order (by lap number, then priority):
     - Calculate desired offset based on priority
     - Check for collisions with previous events (within 3 lap range)
     - If collision detected, increase offset
     - Assign offset slot
   ```

### Phase 2: Period Event Optimization
- SC/VSC start: top position, standard offset
- SC/VSC end: top position, but check if it conflicts with start
- If start and end are close (within 5 laps), stagger end label

### Phase 3: Same-Lap Event Grouping (Optional Enhancement)
- If 3+ events on same lap, consider combining into multi-line label
- Format: 
  ```
  Pit (VER, NOR)
  SC start
  ```

## Implementation Details

### Data Structure
```typescript
type LabeledEvent = {
  lapNumber: number
  type: string
  label: string
  priority: number
  offset: number  // Calculated vertical offset
  position: 'top' | 'bottom'  // Optional: use bottom for less critical
}
```

### Collision Detection
```typescript
function calculateLabelOffsets(events: LabeledEvent[]): LabeledEvent[] {
  const MIN_OFFSET = 5
  const OFFSET_STEP = 15
  const COLLISION_THRESHOLD = 2  // laps
  
  // Sort by lap, then priority
  const sorted = events.sort((a, b) => {
    if (a.lapNumber !== b.lapNumber) return a.lapNumber - b.lapNumber
    return a.priority - b.priority
  })
  
  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i]
    let offset = MIN_OFFSET + (current.priority * OFFSET_STEP)
    
    // Check collisions with previous events
    for (let j = 0; j < i; j++) {
      const previous = sorted[j]
      const lapDiff = Math.abs(current.lapNumber - previous.lapNumber)
      
      if (lapDiff <= COLLISION_THRESHOLD && 
          Math.abs(offset - previous.offset) < 12) {
        // Collision detected, increase offset
        offset = previous.offset + OFFSET_STEP
      }
    }
    
    current.offset = offset
  }
  
  return sorted
}
```

## Alternative: Simpler Approach (Quick Fix)
If the full collision detection is too complex, use a simpler staggered approach:

1. **Fixed offset slots based on event type:**
   - Red Flag: 5px
   - Race Start: 20px
   - SC/VSC start: 35px
   - SC/VSC end: 50px
   - Pit Stops: 20px (but check for conflicts)
   - Yellow Flags: 65px

2. **For same-lap events:**
   - Always add 15px for each additional event on same lap
   - Limit to max 4-5 labels per lap area

3. **For nearby laps (within 2 laps):**
   - Use different offset slots to prevent visual overlap

## Recommendation
Start with **Option 1 (Vertical Staggering with Collision Detection)** as it provides the best balance of clarity and flexibility. Implement the collision detection algorithm to automatically calculate offsets based on event proximity and priority.





