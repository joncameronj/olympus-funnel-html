# Olympus UI Design System v2

A comprehensive design system documentation for the Olympus landing page.

---

## Table of Contents

1. [Theme System](#1-theme-system)
2. [Typography](#2-typography)
3. [Color System](#3-color-system)
4. [Spacing System](#4-spacing-system)
5. [Components](#5-components)
6. [Layout Patterns](#6-layout-patterns)
7. [Interactive Elements](#7-interactive-elements)
8. [Responsive Design](#8-responsive-design)
9. [Accessibility](#9-accessibility)

---

## 1. Theme System

### CSS Custom Properties

```css
:root {
  /* Dark Theme (Default) */
  --bg-page: rgb(10, 10, 10);
  --bg-card: rgb(15, 15, 15);
  --bg-input: rgb(20, 20, 20);
  --border-input: rgb(25, 25, 25);
  --border-list: rgb(25, 25, 25);
  --text-primary: rgb(255, 255, 255);
  --text-muted: rgb(155, 155, 155);
  --btn-primary-bg: #FFFFFF;
  --btn-primary-text: #000000;
}

[data-theme="light"] {
  /* Light Theme */
  --bg-page: rgb(255, 255, 255);
  --bg-card: rgb(250, 250, 250);
  --bg-input: rgb(255, 255, 255);
  --border-input: rgb(245, 245, 245);
  --border-list: rgb(230, 230, 230);
  --text-primary: rgb(0, 0, 0);
  --text-muted: rgb(135, 135, 135);
  --btn-primary-bg: #000000;
  --btn-primary-text: #FFFFFF;
}
```

### Theme Switching Pattern

Toggle visibility based on theme:
```css
.element-dark { display: block; }
.element-light { display: none; }

[data-theme="light"] .element-dark { display: none; }
[data-theme="light"] .element-light { display: block; }
```

---

## 2. Typography

### Font Families

| Font | Weights | Usage |
|------|---------|-------|
| **Acid Grotesk** | 300 (Light), 500 (Medium), 600 (Bold) | Headlines, titles, numbers, buttons |
| **Inter** | 400 (Regular), 500 (Medium), 700 (Bold) | Body text, descriptions, UI labels |
| **Instrument Serif** | 400 (Italic) | Accent text, taglines, editorial |
| **JetBrains Mono** | 400 (Regular) | Badges, technical text |

### Font Stack Fallback

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

### Typography Scale

#### Headlines (Acid Grotesk)

| Level | Size | Weight | Letter Spacing | Line Height |
|-------|------|--------|----------------|-------------|
| Hero | 10rem (160px) | 600 | -0.05em | 0.9 |
| Section | 5.5rem (88px) | 600 | -0.05em | 0.9 |
| Card Title Large | 3.25rem (52px) | 500 | -0.05em | 1.15 |
| Card Title | 3rem (48px) | 500 | -0.03em | 1 |
| Card Title Medium | 2.5rem (40px) | 500-600 | -0.05em | 1.2 |
| Card Title Small | 2rem (32px) | 500-600 | -0.05em | 1.1 |

#### Subheadlines (Inter)

| Level | Size | Weight | Letter Spacing | Color |
|-------|------|--------|----------------|-------|
| Primary | 28-32px | 700 | -0.05em | rgb(160, 160, 160) |
| Secondary | 24px | 500-600 | -0.06em | var(--text-muted) |

#### Body Text (Inter)

| Level | Size | Weight | Letter Spacing | Line Height |
|-------|------|--------|----------------|-------------|
| Large | 24px | 500 | -0.06em | 1.5-1.6 |
| Default | 18px | 500 | -0.02em | 1.5 |
| Small | 16px | 500 | -0.02em | 1.6 |
| Caption | 14px | 400-500 | normal | 1.5 |
| Micro | 12px | 500 | normal | 1.5 |

#### Special Text

| Type | Font | Size | Weight | Style |
|------|------|------|--------|-------|
| Accent/Tagline | Instrument Serif | 36px / 1.6875rem | 400 | Italic |
| Badge | JetBrains Mono | 11px | 500 | Uppercase, 0.08em spacing |
| Label | Inter | 14px | 600 | Uppercase, 0.1em spacing |

---

## 3. Color System

### Base Colors

| Token | Dark Theme | Light Theme |
|-------|------------|-------------|
| Page Background | rgb(10, 10, 10) | rgb(255, 255, 255) |
| Card Background | rgb(15, 15, 15) | rgb(250, 250, 250) |
| Card Background Alt | rgb(28, 28, 30) | rgb(250, 250, 250) |
| Input Background | rgb(20, 20, 20) | rgb(255, 255, 255) |
| Primary Text | rgb(255, 255, 255) | rgb(0, 0, 0) |
| Muted Text | rgb(155, 155, 155) | rgb(135, 135, 135) |
| Subheadline Text | rgb(160, 160, 160) | rgb(160, 160, 160) |

### Accent Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Emerald (Success)** | #10b981, #22C55E, #34C759 | CTAs, success states, positive metrics |
| **Red (Alert)** | #ef4444, #FF3B30, #dc2626 | Problems, warnings, negative states |
| **Blue** | #3b82f6, #0077FF | Links, highlights |
| **Cyan** | #06b6d4 | Accents |
| **Purple/Indigo** | #8b5cf6, #818CF8 | Secondary accents |
| **Orange** | #FF6F00, #FF9500 | Warm accents |

### Gradient Definitions

#### Text Gradients

```css
/* Support Copy - Green */
background: linear-gradient(to right, #10b981, #14b8a6);

/* Testimonial Position - Cyan to Blue */
background: linear-gradient(to right, #06b6d4, #3b82f6);

/* Features Headline - Warm Radial */
background: radial-gradient(circle at bottom left,
  #FFFFFF 0%, #FFD87E 15%, #FF6A00 40%, #FF0000 70%, #4A0000 100%);

/* How It Works - Cool Radial */
background: radial-gradient(circle at 0% 100%,
  #FFFFFF 0%, #7EFFFF 20%, #0077FF 40%, #4400CC 67%, #540081 100%);

/* Solution Card - Blue */
background: radial-gradient(circle at bottom left,
  #FFFFFF 0%, #7EFFFF 20%, #0077FF 40%, #0000FF 60%, #000000 100%);

/* Solution Card - Warm */
background: radial-gradient(circle at bottom left,
  #FFFFFF 0%, #FFF3AE 20%, #FF6F00 40%, #A50000 60%, #060000 100%);

/* Solution Card - Green */
background: radial-gradient(circle at bottom left,
  #FFFFFF 0%, #C0FFAB 20%, #00FF4C 40%, #007E2E 60%, #000000 100%);
```

#### Background Gradients

```css
/* Footer Ghost Text */
background: linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 0%, rgba(0, 0, 0, 0) 100%);

/* Progress Bar - Red */
background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);

/* Progress Bar - Green */
background: linear-gradient(to top, #10b981 0%, #34d399 100%);
```

### Shadow Definitions

| Level | Value | Usage |
|-------|-------|-------|
| Subtle | `0 4px 12px rgba(0, 0, 0, 0.15)` | Cards, screenshots |
| Medium | `0 10px 40px rgba(0, 0, 0, 0.3)` | Elevated cards |
| Strong | `0 20px 50px rgba(0, 0, 0, 0.3)` | CTA buttons |
| Prominent | `0 25px 50px -12px rgba(0, 0, 0, 0.5)` | macOS windows |
| Toggle | `0 3px 8px rgba(0, 0, 0, 0.15), 0 3px 1px rgba(0, 0, 0, 0.06)` | Toggle knobs |

---

## 4. Spacing System

### Container Widths

| Container | Max Width |
|-----------|-----------|
| Main Content | 1300px |
| Narrow (Subheadlines) | 700-800px |
| Wide (Founder Quote) | 900px |
| CTA Section | 1250px |

### Section Spacing

| Property | Desktop | Tablet | Mobile |
|----------|---------|--------|--------|
| Section Margin Top | 240px | 120px | 80px |
| Section Padding Vertical | 80-120px | 60-80px | 60px |
| Section Padding Horizontal | 24px | 24px | 16-24px |

### Component Spacing

| Element | Value |
|---------|-------|
| Card Padding Large | 48px |
| Card Padding Default | 32-36px |
| Card Padding Small | 24px |
| Grid Gap | 16px |
| Tight Grid Gap | 12px |
| Wide Grid Gap | 24-32px |
| Element Margin Bottom | 24-48px |
| Tight Margin | 8-16px |

### Spacing Scale

```
4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px, 120px, 240px
```

---

## 5. Components

### Buttons

#### Primary CTA Button

```css
.cta-button {
  padding: 12px 32px;
  font-family: 'Acid Grotesk', sans-serif;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.02em;
  background: #ffffff;          /* Dark theme */
  color: #000000;
  border: none;
  border-radius: 4px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  transition: opacity 0.2s;
}

.cta-button:hover {
  opacity: 0.9;
}

/* Light theme */
[data-theme="light"] .cta-button {
  background: #000000;
  color: #ffffff;
}
```

#### Pricing Card Button

```css
.pricing-card-button {
  width: 100%;
  padding: 16px 32px;
  font-family: 'Acid Grotesk', sans-serif;
  font-size: 18px;
  font-weight: 600;
  border-radius: 4px;
}
```

### Cards

#### Standard Card

```css
.card {
  background: rgba(155, 155, 155, 0.1);
  border-radius: 4px;
  padding: 36px;
}
```

#### Dark Card

```css
.card-dark {
  background-color: rgb(28, 28, 30);
  border-radius: 4px;
  padding: 32px;
}

[data-theme="light"] .card-dark {
  background-color: rgb(250, 250, 250);
}
```

#### Inverted Card (Contract Style)

```css
/* Dark theme: white card */
.card-inverted {
  background-color: #ffffff;
}
.card-inverted .title { color: #000000; }
.card-inverted .description { color: #888888; }

/* Light theme: black card */
[data-theme="light"] .card-inverted {
  background-color: #1a1a1a;
}
[data-theme="light"] .card-inverted .title { color: #ffffff; }
```

### Form Inputs

#### Revenue Input

```css
.revenue-input {
  width: 100%;
  padding: 16px 20px 16px 40px;
  font-family: 'Acid Grotesk', sans-serif;
  font-size: 24px;
  font-weight: 300;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  background: var(--bg-input);
  border: 2px solid var(--border-input);
  border-radius: 4px;
  transition: border-color 0.2s;
}

.revenue-input:focus {
  border-color: #10b981;
  outline: none;
}

.revenue-input::placeholder {
  color: rgb(160, 160, 160);
  opacity: 0.5;
}

/* Error State */
.revenue-input.error {
  border-color: #f87171;
}
```

### Toggle Switch (Apple Style)

```css
.toggle-switch {
  width: 76px;
  height: 46px;
}

.toggle-slider {
  background-color: rgba(120, 120, 128, 0.32);
  border-radius: 46px;
  transition: background-color 0.3s ease;
}

.toggle-slider:before {
  /* Knob */
  height: 40px;
  width: 40px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15), 0 3px 1px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s ease;
}

.toggle-input:checked + .toggle-slider {
  background-color: #34c759;
}

.toggle-input:checked + .toggle-slider:before {
  transform: translateX(30px);
}
```

### Badges

#### Status Badge

```css
.intro-badge {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  border-radius: 4px;
  font-family: 'Acid Grotesk', sans-serif;
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--text-primary);
  box-shadow: inset 0 0 0 1px var(--border-list);
}
```

#### Pricing Badge

```css
.pricing-card-badge {
  padding: 4px 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid #000000;
  border-radius: 2px;
}
```

### Navigation Dots (Carousel)

```css
.testimonial-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(155, 155, 155, 0.4);
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;
}

.testimonial-dot:hover {
  background: rgba(155, 155, 155, 0.6);
  transform: scale(1.2);
}

.testimonial-dot.active {
  background: #ffffff;
}

[data-theme="light"] .testimonial-dot.active {
  background: #000000;
}
```

### FAQ Accordion

```css
.faq-question {
  padding: 20px 24px;
  font-family: 'Acid Grotesk', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.06em;
}

.faq-chevron {
  color: var(--text-muted);
  transition: color 0.4s ease-out, transform 0.4s ease-out;
}

.faq-item.open .faq-chevron {
  color: #ef4444;
  transform: rotate(90deg);
}

.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease-out;
}

.faq-item.open .faq-answer {
  max-height: 1000px;
}

.faq-answer p {
  padding: 0 24px;
  font-family: 'Inter', sans-serif;
  font-size: 1.25rem;
  font-weight: 500;
  letter-spacing: -0.06em;
  color: var(--text-muted);
  line-height: 1.7;
}
```

### Browser Frame

```css
.browser-frame {
  background: var(--bg-card);
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.browser-header {
  padding: 12px 16px;
  background: rgba(155, 155, 155, 0.1);
  border-bottom: 1px solid rgba(155, 155, 155, 0.1);
}

.browser-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.browser-dot.red { background: #ff5f57; }
.browser-dot.yellow { background: #febc2e; }
.browser-dot.green { background: #28c840; }
```

### macOS Window

```css
.macos-window {
  background: rgba(50, 50, 50, 0.5);
  backdrop-filter: blur(40px);
  border: 8px solid rgba(80, 80, 80, 0.4);
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.macos-title-bar {
  height: 28px;
  background: rgba(60, 60, 60, 0.3);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px 8px 0 0;
}

.traffic-light {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.traffic-light-red { background: #FF5F57; }
.traffic-light-yellow { background: #FFBD2E; }
.traffic-light-green { background: #28C840; }
```

---

## 6. Layout Patterns

### Grid Systems

#### 2-Column Grid

```css
.grid-2col {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
```

#### 3-Column Grid

```css
.grid-3col {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
```

#### Bento Grid (60/40 Split)

```css
.bento-grid {
  display: grid;
  grid-template-columns: 60fr 40fr;
  gap: 16px;
}

.bento-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
```

#### Pricing Grid

```css
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

/* Full-width enterprise card */
.pricing-card-enterprise {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 48px;
}
```

### Section Structure

```html
<section class="[name]-section">
  <div class="[name]-container">
    <h2 class="[name]-headline">Title</h2>
    <p class="[name]-subheadline">Supporting text</p>
    <!-- Content -->
  </div>
</section>
```

```css
.[name]-section {
  max-width: 1300px;
  margin: 0 auto;
  padding: 240px 24px 80px;
}

.[name]-headline {
  font-family: 'Acid Grotesk', sans-serif;
  font-size: 5.5rem;
  font-weight: 600;
  letter-spacing: -0.05em;
  line-height: 0.9;
  text-align: center;
  color: var(--text-primary);
  margin-bottom: 24px;
}

.[name]-subheadline {
  font-family: 'Inter', sans-serif;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.05em;
  color: rgb(160, 160, 160);
  text-align: center;
  max-width: 700px;
  margin: 0 auto 64px;
  line-height: 1.3;
}
```

---

## 7. Interactive Elements

### Transitions

| Type | Duration | Easing |
|------|----------|--------|
| Quick (hover) | 0.2s | ease |
| Standard | 0.3s | ease / cubic-bezier(0.4, 0, 0.2, 1) |
| Accordion | 0.4s | ease-out |
| Carousel | 0.6s | cubic-bezier(0.4, 0, 0.2, 1) |
| Color change | 2s | ease-out |

### Hover States

```css
/* Button hover */
.button:hover {
  opacity: 0.9;
}

/* Link hover */
.link:hover {
  color: var(--text-primary);
}

/* Card hover (screenshot) */
.screenshot-item:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

/* Nav dot hover */
.nav-dot:hover {
  transform: scale(1.2);
}
```

### Animations

#### Keyframe Animations

```css
/* Spinner */
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Progress pulse */
@keyframes progressPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Bar grow */
@keyframes barGrow {
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
}

/* Day pass (calendar) */
@keyframes dayPass {
  from { background-color: transparent; }
  to { background-color: rgba(120, 120, 120, 0.3); }
}

/* Rocket fly */
@keyframes rocketFly {
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
```

#### Animation Delays (Stagger Pattern)

```html
<div style="--delay: 0.4s">Item 1</div>
<div style="--delay: 0.8s">Item 2</div>
<div style="--delay: 1.2s">Item 3</div>
```

```css
.item {
  animation: fadeIn 0.5s ease-out var(--delay) forwards;
}
```

### Intersection Observer Pattern

```javascript
const observer = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      // Start animation
    } else {
      // Stop animation
    }
  });
}, { threshold: 0.3 });

observer.observe(element);
```

---

## 8. Responsive Design

### Breakpoints

| Name | Width | Usage |
|------|-------|-------|
| Mobile | < 600px | Single column, reduced typography |
| Tablet | 601px - 900px | 2 columns, medium typography |
| Desktop | > 900px | Full layouts |

### Typography Scaling

| Element | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Hero Headline | 10rem | 6rem | 4rem |
| Section Headline | 5.5rem | 4rem | 2-3rem |
| Subheadline | 28px | 22px | 1-1.5rem |
| Card Title | 3rem | 2rem | 1.5-2rem |

### Layout Changes

```css
/* Desktop */
.grid {
  grid-template-columns: repeat(2, 1fr);
}

/* Tablet */
@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr 1fr;
  }

  .bento-grid {
    grid-template-columns: 1fr;
  }
}

/* Mobile */
@media (max-width: 600px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .section {
    padding: 60px 16px;
  }

  .card {
    padding: 32px 24px;
  }
}
```

### Responsive Utilities

```css
/* Clamp for fluid typography */
font-size: clamp(9px, 0.8vw, 11px);
font-size: clamp(64px, 8vw, 96px);

/* Hide on mobile */
@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }
}
```

---

## 9. Accessibility

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .animated {
    animation: none !important;
    transition: none !important;
  }

  .auto-scroll {
    /* Disable auto-scroll */
  }
}
```

### ARIA Attributes

```html
<!-- Modal/Dialog -->
<div role="dialog" aria-modal="true" aria-hidden="true">

<!-- Carousel -->
<div role="region" aria-label="Screenshot carousel">

<!-- FAQ -->
<button aria-expanded="false">Question</button>
<div aria-hidden="true">Answer</div>
```

### Focus States

```css
.button:focus {
  outline: 2px solid #10b981;
  outline-offset: 2px;
}

.input:focus {
  border-color: #10b981;
  outline: none;
}
```

### Color Contrast

- Primary text on dark: White (#FFFFFF) on near-black (rgb(10,10,10)) - **21:1**
- Muted text: Gray (rgb(155,155,155)) on dark - **7.5:1**
- Green accent: #10b981 on dark - **4.5:1+**

---

## Quick Reference

### Common Values

| Property | Value |
|----------|-------|
| Border Radius | 4px |
| Border Radius Large | 8px, 12px, 16px |
| Border Radius Circle | 50% |
| Standard Transition | 0.3s cubic-bezier(0.4, 0, 0.2, 1) |
| Container Max Width | 1300px |
| Card Padding | 32-48px |
| Grid Gap | 16px |
| Section Margin | 240px |

### Color Quick Reference

| Name | Value |
|------|-------|
| Emerald | #10b981 |
| Red | #ef4444 |
| Blue | #3b82f6 |
| Cyan | #06b6d4 |
| Purple | #8b5cf6 |
| Orange | #FF6F00 |
| Gray (muted) | rgb(155, 155, 155) |
| Dark Card | rgb(28, 28, 30) |

### Font Quick Reference

| Usage | Family | Size | Weight |
|-------|--------|------|--------|
| Headline | Acid Grotesk | 5.5rem | 600 |
| Subheadline | Inter | 28px | 700 |
| Body | Inter | 18-24px | 500 |
| Button | Acid Grotesk | 18-20px | 600 |
| Caption | Inter | 14px | 400-500 |
