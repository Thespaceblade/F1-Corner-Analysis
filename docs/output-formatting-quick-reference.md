# Output Formatting - Quick Reference Guide

## Overview
This is a quick reference guide for implementing visual formatting improvements across the F1 Corner Analysis application.

## Current Formatting Functions

### Existing Functions
- `formatLapTime()` in `components/ChartTooltip.tsx` - Formats lap times as M:SS.mmm or SS.mmm

### Missing Functions (To Create)
- `formatCornerTime()` - Format corner times (S.mmm)
- `formatDelta()` - Format deltas with color and sign
- `formatSpeed()` - Format speeds with units
- `formatSectorTime()` - Format sector times
- `formatPercentage()` - Format percentages

---

## Component Library

### 1. MetricCard Component
**Purpose**: Display a single metric with label, value, and optional delta/trend

**Usage**:
```tsx
<MetricCard
  label="Best Lap Time"
  value="1:23.456"
  delta="+0.123s"
  trend="up"
  icon="🏆"
  size="lg"
/>
```

**Props**:
- `label: string` - Metric label
- `value: string | number` - Metric value
- `delta?: string` - Delta value (optional)
- `trend?: 'up' | 'down' | 'neutral'` - Trend direction
- `icon?: string` - Icon emoji or component
- `size?: 'sm' | 'md' | 'lg'` - Size variant
- `color?: string` - Custom color
- `tooltip?: string` - Tooltip text

### 2. DeltaBadge Component
**Purpose**: Display time/speed deltas with color coding

**Usage**:
```tsx
<DeltaBadge value={0.123} unit="s" />
<DeltaBadge value={-0.045} unit="s" showSign />
```

**Props**:
- `value: number` - Delta value
- `unit?: string` - Unit (default: 's')
- `showSign?: boolean` - Show + sign for positive (default: true)
- `precision?: number` - Decimal places (default: 3)
- `variant?: 'badge' | 'text' | 'inline'` - Display variant

### 3. CornerBadge Component
**Purpose**: Display corner type with color coding

**Usage**:
```tsx
<CornerBadge type="slow" />
<CornerBadge type="medium" showLabel />
```

**Props**:
- `type: 'slow' | 'medium' | 'fast'` - Corner type
- `showLabel?: boolean` - Show text label
- `size?: 'sm' | 'md' | 'lg'` - Size variant

### 4. DriverBadge Component
**Purpose**: Display driver code with team color

**Usage**:
```tsx
<DriverBadge code="VER" />
<DriverBadge code="NOR" showName />
```

**Props**:
- `code: string` - Driver code
- `showName?: boolean` - Show driver name
- `size?: 'sm' | 'md' | 'lg'` - Size variant
- `variant?: 'badge' | 'chip' | 'pill'` - Style variant

### 5. TimeDisplay Component
**Purpose**: Format and display time values

**Usage**:
```tsx
<TimeDisplay value={83.456} type="lap" />
<TimeDisplay value={1.234} type="corner" />
<TimeDisplay value={23.456} type="sector" />
```

**Props**:
- `value: number | null` - Time value in seconds
- `type: 'lap' | 'corner' | 'sector'` - Time type
- `precision?: number` - Decimal places
- `showUnit?: boolean` - Show unit (s)
- `className?: string` - Additional classes

### 6. SpeedDisplay Component
**Purpose**: Format and display speed values

**Usage**:
```tsx
<SpeedDisplay value={180.5} unit="km/h" />
<SpeedDisplay value={112.2} unit="mph" />
```

**Props**:
- `value: number | null` - Speed value
- `unit?: 'km/h' | 'mph'` - Speed unit (default: 'km/h')
- `precision?: number` - Decimal places (default: 1)
- `showUnit?: boolean` - Show unit
- `className?: string` - Additional classes

### 7. ComparisonCard Component
**Purpose**: Display driver comparison side-by-side

**Usage**:
```tsx
<ComparisonCard
  driver1={{ code: 'VER', value: 1.234 }}
  driver2={{ code: 'NOR', value: 1.287 }}
  label="Corner 8 Time"
  unit="s"
/>
```

**Props**:
- `driver1: { code: string, value: number }` - First driver
- `driver2: { code: string, value: number }` - Second driver
- `label: string` - Comparison label
- `unit?: string` - Value unit
- `showDelta?: boolean` - Show delta (default: true)
- `highlightWinner?: boolean` - Highlight faster driver (default: true)

### 8. StatCard Component
**Purpose**: Display statistics with icon and value

**Usage**:
```tsx
<StatCard
  icon="📊"
  label="Average Lap Time"
  value="1:23.456"
  subtext="Based on 50 laps"
/>
```

**Props**:
- `icon: string | ReactNode` - Icon
- `label: string` - Stat label
- `value: string | number` - Stat value
- `subtext?: string` - Subtext/description
- `trend?: 'up' | 'down' | 'neutral'` - Trend indicator
- `color?: string` - Custom color

### 9. TrendIndicator Component
**Purpose**: Display trend arrow with color

**Usage**:
```tsx
<TrendIndicator direction="up" value={0.123} />
<TrendIndicator direction="down" value={0.045} />
```

**Props**:
- `direction: 'up' | 'down' | 'neutral'` - Trend direction
- `value?: number` - Trend value
- `showValue?: boolean` - Show value (default: false)
- `size?: 'sm' | 'md' | 'lg'` - Size variant

### 10. DataTable Component
**Purpose**: Enhanced table with formatting and styling

**Usage**:
```tsx
<DataTable
  columns={columns}
  data={data}
  highlightBest
  sortable
  responsive
/>
```

**Props**:
- `columns: Column[]` - Table columns
- `data: any[]` - Table data
- `highlightBest?: boolean` - Highlight best values
- `sortable?: boolean` - Enable sorting
- `responsive?: boolean` - Responsive design
- `striped?: boolean` - Zebra striping

---

## Formatting Utilities

### formatTime(value: number, type: 'lap' | 'corner' | 'sector'): string
**Purpose**: Format time values based on type

**Examples**:
```typescript
formatTime(83.456, 'lap')    // "1:23.456"
formatTime(1.234, 'corner')  // "1.234s"
formatTime(23.456, 'sector') // "23.456s"
```

### formatDelta(value: number, unit?: string, options?: FormatDeltaOptions): string
**Purpose**: Format delta values with sign and color

**Examples**:
```typescript
formatDelta(0.123, 's')      // "+0.123s"
formatDelta(-0.045, 's')     // "-0.045s"
formatDelta(0.123, 's', { showSign: false }) // "0.123s"
```

### formatSpeed(value: number, unit?: 'km/h' | 'mph'): string
**Purpose**: Format speed values

**Examples**:
```typescript
formatSpeed(180.5, 'km/h')   // "180.5 km/h"
formatSpeed(112.2, 'mph')    // "112.2 mph"
```

### formatPercentage(value: number, precision?: number): string
**Purpose**: Format percentage values

**Examples**:
```typescript
formatPercentage(12.5)       // "12.5%"
formatPercentage(12.567, 1)  // "12.6%"
```

### getDeltaColor(value: number, inverted?: boolean): string
**Purpose**: Get color for delta value (green for negative/faster, red for positive/slower)

**Examples**:
```typescript
getDeltaColor(0.123)   // "#ef4444" (red - slower)
getDeltaColor(-0.045)  // "#22c55e" (green - faster)
getDeltaColor(0.123, true) // "#22c55e" (inverted - green for positive)
```

---

## Color System

### Semantic Colors
- **Success/Positive**: `#22c55e` (green) - Faster, better performance
- **Warning/Neutral**: `#eab308` (yellow) - Medium, caution
- **Error/Negative**: `#ef4444` (red) - Slower, worse performance
- **Info/Neutral**: `#7cc7ff` (blue) - Information, neutral
- **Secondary**: `#9aa4b2` (gray) - Secondary information

### Corner Type Colors
- **Slow**: `#ef4444` (red)
- **Medium**: `#eab308` (yellow)
- **Fast**: `#22c55e` (green)

### Delta Colors
- **Positive (Slower)**: `#ef4444` (red)
- **Negative (Faster)**: `#22c55e` (green)
- **Neutral (Same)**: `#9aa4b2` (gray)

---

## Typography Scale

### Headings
- **H1**: `text-2xl font-bold` (24px, bold) - Page titles
- **H2**: `text-xl font-semibold` (20px, semibold) - Section titles
- **H3**: `text-base font-semibold` (16px, semibold) - Subsection titles
- **H4**: `text-sm font-medium` (14px, medium) - Card titles

### Body Text
- **Large**: `text-base` (16px) - Important metrics
- **Regular**: `text-sm` (14px) - Body text
- **Small**: `text-xs` (12px) - Secondary info
- **Tiny**: `text-[10px]` (10px) - Labels, metadata

### Monospace (for numbers)
- **Regular**: `font-mono text-sm` - Time values
- **Bold**: `font-mono font-bold` - Important numbers
- **Large**: `font-mono text-base` - Featured metrics

---

## Spacing System

### Spacing Scale
- **xs**: `4px` (gap-1)
- **sm**: `8px` (gap-2)
- **md**: `16px` (gap-4)
- **lg**: `24px` (gap-6)
- **xl**: `32px` (gap-8)
- **2xl**: `48px` (gap-12)

### Application
- **Card padding**: `p-4` (16px)
- **Section margins**: `mt-6` (24px)
- **Element gaps**: `gap-2` to `gap-4` (8-16px)
- **Page margins**: `p-8` (32px)

---

## Icons & Badges

### Common Icons
- 🏆 Fastest/Best
- 📈 Improvement/Up
- 📉 Decline/Down
- ⚠️ Warning/Caution
- ✅ Success/Available
- ❌ Error/Unavailable
- 🔄 Loading/Processing
- ⏱️ Time/Clock
- 📊 Statistics/Chart
- 🎯 Target/Goal

### Badge Variants
- **Corner Type**: Colored dot + label
- **Driver**: Team color + code
- **Delta**: Colored text with sign
- **Status**: Icon + text
- **Metric**: Value + unit

---

## Chatbot Formatting

### Markdown Support
The chatbot should support:
- **Bold**: `**text**` → **text**
- *Italic*: `*text*` → *text*
- `Code`: `` `code` `` → `code`
- Lists: `- item` → • item
- Tables: Markdown tables
- Links: `[text](url)` → [text](url)

### Structured Data
Display structured data as:
- Cards for metrics
- Tables for comparisons
- Badges for drivers/corners
- Icons for status

### Example Chatbot Response
```
**🏆 Corner 8 - Fastest Driver**

**Max Verstappen (VER)**: `1.234s` 🏆
**Lando Norris (NOR)**: `1.287s` (+0.053s)
**Lewis Hamilton (HAM)**: `1.301s` (+0.067s)

*Data from Monaco 2025 Qualifying*
```

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Create `lib/formatting/` directory
- [ ] Create formatting utility functions
- [ ] Create base component library
- [ ] Set up component styles
- [ ] Create TypeScript types

### Phase 2: Components
- [ ] Implement MetricCard
- [ ] Implement DeltaBadge
- [ ] Implement CornerBadge
- [ ] Implement DriverBadge
- [ ] Implement TimeDisplay
- [ ] Implement SpeedDisplay
- [ ] Implement ComparisonCard
- [ ] Implement StatCard
- [ ] Implement TrendIndicator
- [ ] Implement DataTable

### Phase 3: Integration
- [ ] Update CornerTable to use new components
- [ ] Update ChartTooltip to use formatting utilities
- [ ] Update AnalysisPanel components
- [ ] Update Chatbot to support markdown
- [ ] Update all time/speed displays

### Phase 4: Testing
- [ ] Test all formatting functions
- [ ] Test all components
- [ ] Test responsive design
- [ ] Test accessibility
- [ ] Test performance

---

## Code Examples

### Example 1: Formatting Utility
```typescript
// lib/formatting/formatTime.ts
export function formatTime(value: number | null, type: 'lap' | 'corner' | 'sector'): string {
  if (value === null || isNaN(value)) return 'N/A'
  
  switch (type) {
    case 'lap':
      const minutes = Math.floor(value / 60)
      const seconds = value % 60
      const secondsInt = Math.floor(seconds)
      const milliseconds = Math.round((seconds - secondsInt) * 1000)
      
      if (minutes > 0) {
        return `${minutes}:${secondsInt.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`
      }
      return `${secondsInt}.${milliseconds.toString().padStart(3, '0')}`
    
    case 'corner':
    case 'sector':
      return `${value.toFixed(3)}s`
    
    default:
      return value.toFixed(3)
  }
}
```

### Example 2: DeltaBadge Component
```tsx
// components/formatting/DeltaBadge.tsx
import { getDeltaColor } from '@/lib/formatting/formatDelta'

type DeltaBadgeProps = {
  value: number
  unit?: string
  showSign?: boolean
  precision?: number
  variant?: 'badge' | 'text' | 'inline'
}

export default function DeltaBadge({
  value,
  unit = 's',
  showSign = true,
  precision = 3,
  variant = 'badge'
}: DeltaBadgeProps) {
  const color = getDeltaColor(value)
  const sign = value > 0 && showSign ? '+' : ''
  const formattedValue = `${sign}${value.toFixed(precision)}${unit}`
  
  if (variant === 'text') {
    return <span style={{ color }}>{formattedValue}</span>
  }
  
  if (variant === 'inline') {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono" style={{ color, backgroundColor: `${color}20` }}>
        {formattedValue}
      </span>
    )
  }
  
  return (
    <span className="inline-flex items-center px-2 py-1 rounded-md text-sm font-mono font-medium" style={{ color, backgroundColor: `${color}15` }}>
      {formattedValue}
    </span>
  )
}
```

### Example 3: MetricCard Component
```tsx
// components/formatting/MetricCard.tsx
import TrendIndicator from './TrendIndicator'
import DeltaBadge from './DeltaBadge'

type MetricCardProps = {
  label: string
  value: string | number
  delta?: number
  trend?: 'up' | 'down' | 'neutral'
  icon?: string
  size?: 'sm' | 'md' | 'lg'
  color?: string
  tooltip?: string
}

export default function MetricCard({
  label,
  value,
  delta,
  trend,
  icon,
  size = 'md',
  color,
  tooltip
}: MetricCardProps) {
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  }
  
  return (
    <div className={`panel ${sizeClasses[size]} ${tooltip ? 'cursor-help' : ''}`} title={tooltip}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-xl">{icon}</span>}
          <span className="text-xs text-gray-400 font-medium">{label}</span>
        </div>
        {trend && <TrendIndicator direction={trend} />}
      </div>
      <div className="text-2xl font-bold text-gray-100 mb-1" style={color ? { color } : undefined}>
        {value}
      </div>
      {delta !== undefined && (
        <div className="mt-2">
          <DeltaBadge value={delta} variant="inline" />
        </div>
      )}
    </div>
  )
}
```

---

## Next Steps

1. **Review** this quick reference guide
2. **Create** formatting utilities in `lib/formatting/`
3. **Build** component library in `components/formatting/`
4. **Integrate** components into existing code
5. **Test** formatting and components
6. **Iterate** based on feedback

---

**Last Updated**: 2025-01-08
**Status**: Quick Reference
**See Also**: `output-formatting-plan.md` for detailed plan


