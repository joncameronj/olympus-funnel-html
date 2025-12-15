# OlympusAI Design System

**Version:** 1.1 | **Updated:** 2025-11-27

---

## Critical Rules

### No Subheaders on Pages
Page headers are simple, standalone titles. NO descriptive subtitles.

### No Borders on Cards
Cards use background color only for separation. NO borders on standard cards.

### Universal Border Radius
**ALL UI elements:** `rounded-sm` (4px). Only exception: avatars use `rounded-full`.

---

## 1. Color System

### Theme Detection
```tsx
const { resolvedTheme } = useTheme();
const isDark = resolvedTheme === 'dark';
```

### Core Colors

| Element | Dark Mode | Light Mode |
|---------|-----------|------------|
| Card BG | `rgb(15, 15, 15)` | `rgb(250, 250, 250)` |
| Input BG | `rgb(20, 20, 20)` | `rgb(255, 255, 255)` |
| Input Border | `rgb(25, 25, 25)` | `rgb(245, 245, 245)` |
| Focus BG | `rgb(0, 0, 0)` | `rgb(255, 255, 255)` |
| Focus Border | `rgba(255,255,255,1)` | `rgb(100, 100, 100)` |
| Label Text | `rgb(155, 155, 155)` | `rgb(135, 135, 135)` |
| Primary Text | `rgb(255, 255, 255)` | `rgb(0, 0, 0)` |
| List Item BG | `rgb(0, 0, 0)` | `rgb(255, 255, 255)` |
| List Hover BG | `rgb(10, 10, 10)` | `rgb(248, 248, 248)` |
| List Border | `rgb(25, 25, 25)` | `rgb(230, 230, 230)` |

### Progress Colors
```tsx
const getProgressColor = (percentage: number): string => {
  if (percentage < 25) return '#ef4444';  // red
  if (percentage <= 50) return '#ea580c'; // orange
  if (percentage <= 70) return '#eab308'; // yellow
  if (percentage < 100) return '#a3e635'; // lime
  return '#22c55e';                       // green
};
```

### Banner Gradients
```tsx
// Blue info banner
background: `linear-gradient(to right, ${isDark ? 'rgb(0,0,0)' : 'rgb(255,255,255)'} 0%, ${isDark ? 'rgb(0,0,0)' : 'rgba(70,135,255,0.16)'} 66%, rgba(0,85,195,0.56) 100%)`;

// Red alert banner
background: `linear-gradient(to right, ${isDark ? 'rgb(0,0,0)' : 'rgb(255,255,255)'} 0%, ${isDark ? 'rgb(0,0,0)' : 'rgb(255,255,255)'} 66%, rgba(255,13,13,0.39) 100%)`;
```

---

## 2. Typography

### Font Families
- **Headers:** `font-tasa-orbiter` (TASA Orbiter Display)
- **Body:** `font-inter` (Inter)
- **Mono:** `font-jetbrains-mono` (JetBrains Mono)

### Font Weights
| Weight | Value | Class | Usage |
|--------|-------|-------|-------|
| Light | 300 | `font-tasa-orbiter-light` | Subtle text |
| Regular | 400 | `font-inter-regular` | Body text |
| Medium | 500 | `font-inter-medium` | Navigation, labels |
| SemiBold | 600 | `font-inter-semibold` | Headings |
| Bold | 700 | `font-inter-bold` | Strong emphasis |

### Typography Hierarchy
| Component | Size | Weight | Font |
|-----------|------|--------|------|
| Page Titles | `text-6xl` | 500 | `font-tasa-orbiter` |
| Section Titles | `text-2xl` | 600 | `font-tasa-orbiter` |
| Body Text | `text-sm` | 400 | `font-inter` |
| Form Labels | `text-xs` | 500 | `font-inter-medium` |
| Form Inputs | `text-sm` | 400 | `font-inter-regular` |
| Status Badges | `text-xs` | 600 | `font-jetbrains-mono` |

### Letter Spacing
| Value | Usage |
|-------|-------|
| `-0.08em` | Labels (ultra-tight) |
| `-0.06em` | Progress text |
| `-0.05em` | Headers |
| `-0.02em` | Navigation |

---

## 3. Spacing & Layout

### Spacing Scale
| Class | Value | Usage |
|-------|-------|-------|
| `gap-2` | 8px | Tight spacing |
| `gap-3` | 12px | Close elements |
| `gap-4` | 16px | Standard |
| `gap-8` | 32px | Column gap |
| `space-y-3` | 12px | Label-field |
| `space-y-6` | 24px | Section |
| `space-y-12` | 48px | Questions |

### Fixed Dimensions
| Element | Width |
|---------|-------|
| Main content | `700px` |
| Sidebar | `228px` |
| Page max-width | `928px` |
| Input height | `h-12` (48px) |
| Search height | `h-10` (40px) |
| Progress bar | `4px` height |

---

## 4. Form Elements

### Input Pattern
```tsx
<input
  className={`w-full rounded-sm h-12 px-4 text-sm transition-all focus:outline-none font-inter-regular ${isDark ? 'placeholder:text-white/40' : 'placeholder:text-black/40'}`}
  style={{
    backgroundColor: inputBgColor,
    borderWidth: '1px',
    borderColor: inputBorderColor,
    color: textColor,
  }}
  onFocus={e => {
    e.target.style.backgroundColor = inputFocusBgColor;
    e.target.style.borderColor = inputFocusBorderColor;
  }}
  onBlur={e => {
    e.target.style.backgroundColor = inputBgColor;
    e.target.style.borderColor = inputBorderColor;
  }}
/>
```

### Textarea Pattern
Same as input but with `rows={5}`, `px-4 py-3`, `resize-none`, `font-inter-medium`.

### Labels
```tsx
<Label
  className="text-sm font-medium font-inter-medium"
  style={{ letterSpacing: '-0.08em', color: labelTextColor }}
>
  Field Label *
</Label>
```

### NumberInput Component
Always use `@/components/ui/number-input` for numeric inputs:
```tsx
<NumberInput
  value={price}
  onChange={setPrice}
  min={0}
  max={10000}
  step={0.01}
  decimals={2}
  prefix="$"
/>
```

### ElasticSlider Component
Always use `@/components/ui/elastic-slider` for sliders:
```tsx
<ElasticSlider
  defaultValue={value}
  startingValue={1}
  maxValue={10}
  stepSize={1}
  leftLabel="1"
  rightLabel="10"
  onValueChange={onChange}
/>
```

---

## 5. Buttons

### Primary Button
```tsx
<button
  className="px-8 py-3 text-xs font-bold transition-all duration-300 rounded-sm font-jetbrains-mono uppercase"
  style={{
    background: isDark ? '#FFFFFF' : '#000000',
    color: isDark ? '#000000' : '#FFFFFF',
    fontWeight: 600,
  }}
>
  BUTTON TEXT
</button>
```

### Full-Width Button (Auth)
```tsx
<button className="w-full bg-black dark:bg-white text-white dark:text-black rounded-sm px-6 py-3 font-jetbrains-mono uppercase">
  SIGN IN
</button>
```

### Icon Button
```tsx
<button className={`p-1 rounded-sm transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}>
  <X className="h-5 w-5" />
</button>
```

---

## 6. Cards & Containers

### Standard Card
```tsx
<Card style={{ backgroundColor: cardBgColor, padding: '24px' }}>
  <CardTitle
    className="text-2xl font-tasa-orbiter"
    style={{ letterSpacing: '-0.05em', fontWeight: 600 }}
  >
    Title
  </CardTitle>
  <CardContent className="space-y-4">{/* content */}</CardContent>
</Card>
```

### Two-Column Layout
```tsx
<div className="flex gap-8">
  <div className="space-y-6" style={{ width: '700px', flexShrink: 0 }}>
    {/* Main content */}
  </div>
  <div style={{ width: '228px', flexShrink: 0 }}>
    <div className="sticky" style={{ top: '24px' }}>
      {/* Sidebar */}
    </div>
  </div>
</div>
```

---

## 7. Banners & Alerts

### Info Banner (Blue)
```tsx
<div
  className="mb-6 rounded-sm border border-blue-600"
  style={{ background: blueBannerGradient }}
>
  <div className="flex items-start justify-between gap-3 p-4">
    <div className="flex items-start gap-3">
      <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-blue-600/50" />
      </div>
      <div>
        <p className="text-sm font-medium">Title</p>
        <p className="text-sm mt-1" style={{ color: bannerSubTextColor }}>Description</p>
      </div>
    </div>
    <button className="p-1 rounded-sm"><X className="h-5 w-5" /></button>
  </div>
</div>
```

### Error Alert (Red)
```tsx
<div className="rounded-sm border border-red-600 bg-red-600 p-4">
  <div className="flex items-start gap-3">
    <AlertCircle className="h-5 w-5 text-white" />
    <p className="text-sm text-white">Error message.</p>
  </div>
</div>
```

---

## 8. Status Badges

```tsx
<span
  className="inline-flex items-center gap-x-1.5 rounded-sm px-2 py-1 text-xs font-jetbrains-mono uppercase"
  style={{ boxShadow: `inset 0 0 0 1px ${statusColor}` }}
>
  <svg viewBox="0 0 6 6" className="size-1.5">
    <circle r={3} cx={3} cy={3} fill={statusColor} />
  </svg>
  {statusText}
</span>
```

| Status | Color | Text |
|--------|-------|------|
| Complete | `rgb(34, 197, 94)` | COMPLETE |
| Draft | `rgb(156, 163, 175)` | DRAFT |
| Queued | `rgb(251, 191, 36)` | QUEUED |
| Processing | `rgb(251, 191, 36)` | PROCESSING |
| Failed | `rgb(239, 68, 68)` | FAILED |
| KPIs Yes | `rgb(59, 130, 246)` | YES |
| KPIs No | `rgb(156, 163, 175)` | NO |

---

## 9. Page Layout (Required Structure)

```tsx
<div className="mx-auto space-y-6 py-12 px-4" style={{ maxWidth: '928px' }}>
  {/* Title */}
  <div className="space-y-4">
    <div className="pt-8">
      <h1
        className="text-6xl font-tasa-orbiter"
        style={{ fontWeight: 500, letterSpacing: '-0.05em', color: textColor }}
      >
        Page Title.
      </h1>
    </div>
  </div>

  {/* Content */}
  <div className="space-y-6">
    {/* page content */}
  </div>
</div>
```

**Required specifications:**
- Max Width: `928px` (never use `max-w-7xl`)
- Padding: `py-12 px-4`
- Title: `text-6xl`, `font-tasa-orbiter`, weight `500`, spacing `-0.05em`
- Title top padding: `pt-8`

---

## 10. List Views

### Search + Action Bar
```tsx
<div className="flex justify-between items-center gap-4 mb-6">
  <div className="relative flex-1 max-w-md">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: mutedTextColor }} />
    <input
      placeholder="Search..."
      className="pl-10 w-full rounded-sm h-10 text-sm font-inter-medium"
      style={{ backgroundColor: 'transparent', border: `1px solid ${inputBorderColor}` }}
    />
  </div>
  <button className="px-8 py-3 text-xs uppercase font-jetbrains-mono rounded-sm">
    CREATE ITEM
  </button>
</div>
```

### ProductListHeader
```tsx
import { ProductListHeader } from '@/components/ui/product-list-item';
<ProductListHeader thirdColumnLabel="Date" />
```

Column widths: Icon `40px` | Name `flex-1 min-200px` | Status `100px` | Third `120px` | Actions `64px` | Delete `40px`

### ProductListItem
```tsx
<ProductListItem
  icon={<BaseLottieIcon animationData={iconAnim} className="h-5 w-5" color={iconColor} />}
  name="Item Name"
  status="complete"
  kpisLinked={true}  // or date="2024-01-15"
  onEdit={() => {}}
  onDelete={() => {}}
  onClick={() => {}}
/>
```

### Empty States
```tsx
<div
  className="flex flex-col items-center justify-center text-center p-12 rounded-sm h-96"
  style={{ backgroundColor: cardBgColor }}
>
  <BaseLottieIcon className="h-12 w-12 opacity-40 mb-6" color={mutedIconColor} />
  <h2 className="text-lg font-medium mb-2">No items found.</h2>
  <p className="max-w-md mb-8 text-sm" style={{ color: mutedTextColor }}>
    Create your first item to get started.
  </p>
  <button className="px-6 py-2.5 text-sm font-medium rounded-sm">
    Create Item
  </button>
</div>
```

### Loading State
```tsx
<div className="flex items-center justify-center py-12">
  <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: textColor }} />
  <p style={{ color: mutedTextColor }}>Loading...</p>
</div>
```

---

## 11. Navigation

### Sticky Sidebar
```tsx
<div style={{ width: '228px', flexShrink: 0 }}>
  <div className="sticky" style={{ top: '24px' }}>
    <nav>
      {sections.map(section => (
        <button
          key={section.id}
          className="w-full text-left px-3 py-2 text-sm font-tasa-orbiter transition-all duration-200"
          style={{
            color: isActive ? textColor : mutedTextColor,
            borderLeft: `2px solid ${isActive ? textColor : 'rgba(155,155,155,0.3)'}`,
            letterSpacing: '-0.02em',
            fontWeight: 500,
          }}
        >
          {section.title}
        </button>
      ))}
    </nav>
  </div>
</div>
```

---

## 12. Progress Indicators

### Full Progress Bar
```tsx
<div className="mb-8">
  <div className="flex justify-between text-sm mb-2 font-inter" style={{ fontWeight: 600, letterSpacing: '-0.06em', color: mutedTextColor }}>
    <span>{current} of {total} answered</span>
    <span>{percentage}%</span>
  </div>
  <div className="w-full bg-black/50 rounded-full overflow-hidden" style={{ height: '4px' }}>
    <div
      className="rounded-full transition-all duration-300"
      style={{ height: '4px', width: `${percentage}%`, background: getProgressColor(percentage) }}
    />
  </div>
</div>
```

### Inline Progress
```tsx
<div className="flex items-center gap-2">
  <span className="text-sm font-medium">{percentage}%</span>
  <div className="rounded-full overflow-hidden" style={{ width: '64px', height: '4px', backgroundColor: 'rgb(230,230,230)' }}>
    <div style={{ width: `${percentage}%`, backgroundColor: getProgressColor(percentage) }} />
  </div>
</div>
```

---

## 13. AI Analysis Banners

Show only when AI has pre-filled form data and status is `'Complete'` or `'Processing'`.

```tsx
const AI_BANNER_KEY = 'ai_analysis_banner_dismissed_[entity_type]';
const [showBanner, setShowBanner] = useState(() => {
  return !localStorage.getItem(AI_BANNER_KEY) && (status === 'Complete' || status === 'Processing');
});

const dismissBanner = () => {
  localStorage.setItem(AI_BANNER_KEY, 'true');
  setShowBanner(false);
};
```

---

## Quick Reference

### Color Variables Template
```tsx
const isDark = resolvedTheme === 'dark';
const cardBgColor = isDark ? 'rgb(15, 15, 15)' : 'rgb(250, 250, 250)';
const inputBgColor = isDark ? 'rgb(20, 20, 20)' : 'rgb(255, 255, 255)';
const inputBorderColor = isDark ? 'rgb(25, 25, 25)' : 'rgb(245, 245, 245)';
const inputFocusBgColor = isDark ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)';
const inputFocusBorderColor = isDark ? 'rgba(255, 255, 255, 1)' : 'rgb(100, 100, 100)';
const labelTextColor = isDark ? 'rgb(155, 155, 155)' : 'rgb(135, 135, 135)';
const textColor = isDark ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)';
const mutedTextColor = isDark ? 'rgb(155, 155, 155)' : 'rgb(135, 135, 135)';
const iconColor = isDark ? '#FFFFFF' : '#000000';
const mutedIconColor = isDark ? '#9B9B9B' : '#878787';
```

### Common Imports
```tsx
import { useTheme } from '@/components/providers/ThemeProvider';
import { BaseLottieIcon } from '@/components/icons/base-lottie-icon';
import { ProductListItem, ProductListContainer, ProductListHeader } from '@/components/ui/product-list-item';
import { NumberInput } from '@/components/ui/number-input';
import ElasticSlider from '@/components/ui/elastic-slider';
```

---

**End of Design System Documentation**
