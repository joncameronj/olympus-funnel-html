# Olympus Funnel - Project Guidelines

**ALWAYS REFERENCE THIS FILE** when working on this project.

## Tech Stack Rules

### ALLOWED:
- HTML5
- CSS3 (vanilla)
- JavaScript (vanilla ES6+)

### NOT ALLOWED:
- No frameworks (React, Vue, Angular, etc.)
- No CSS frameworks (Tailwind, Bootstrap, etc.)
- No build tools (Webpack, Vite, etc.)
- No npm packages on the frontend
- No jQuery

## Performance Requirements

| Metric | Target | Maximum |
|--------|--------|---------|
| FCP | < 1.0s | 1.5s |
| LCP | < 1.5s | 2.5s |
| CLS | < 0.05 | 0.1 |
| Total Weight | < 200KB | 300KB |
| PageSpeed | 90+ | - |

## File Structure
```
/
├── index.html              # Landing page (form + video)
├── calendar.html           # Cal.com embed
├── confirmation.html       # Thank you page
├── terms.html              # Terms of service
├── cookies.html            # Cookie info page
├── vercel.json             # Hosting config
├── api/
│   └── notify.js           # Vercel Edge Function (RO.AM proxy)
└── assets/
    ├── css/main.css        # Non-critical styles
    ├── js/
    │   ├── app.js          # Core utilities
    │   ├── form.js         # Form submission
    │   ├── tracking.js     # Pixel loading
    │   ├── video-loader.js # Wistia lazy load
    │   └── calendar-loader.js
    ├── fonts/
    │   └── *.woff2         # Custom fonts
    └── images/
        └── *.webp          # All images in WebP
```

## Code Patterns

### Critical CSS
All above-the-fold styles MUST be inlined in `<head>`:
```html
<style>
  /* Critical CSS here - max 10KB */
</style>
```

### Non-Critical CSS
Load asynchronously:
```html
<link rel="preload" href="/assets/css/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/assets/css/main.css"></noscript>
```

### JavaScript Loading
```html
<!-- Deferred (non-blocking) -->
<script src="/assets/js/app.js" defer></script>

<!-- Lazy loaded via JS (tracking pixels) -->
<!-- Never in HTML - loaded programmatically after delay -->
```

### Images
Always use WebP with explicit dimensions:
```html
<img src="/assets/images/hero.webp"
     width="1920" height="1080"
     alt="Description"
     loading="lazy"
     decoding="async">
```

Hero images use eager loading:
```html
<img src="/assets/images/hero.webp"
     width="1920" height="1080"
     alt=""
     loading="eager"
     fetchpriority="high">
```

### Resource Hints
Always include in `<head>`:
```html
<link rel="dns-prefetch" href="//connect.facebook.net">
<link rel="dns-prefetch" href="//www.googletagmanager.com">
<link rel="dns-prefetch" href="//www.clarity.ms">
<link rel="dns-prefetch" href="//fast.wistia.com">
<link rel="dns-prefetch" href="//app.cal.com">
```

### Third-Party Scripts (Tracking)
NEVER load tracking pixels in HTML. Always delay:
```javascript
// Load after 3 seconds OR first user interaction
const loadTracking = () => { /* ... */ };
const timer = setTimeout(loadTracking, 3000);
['click', 'scroll', 'touchstart'].forEach(e =>
  window.addEventListener(e, () => {
    clearTimeout(timer);
    loadTracking();
  }, { once: true, passive: true })
);
```

### Wistia Video
Use facade pattern (click-to-load):
```html
<div class="video-facade" data-wistia-id="VIDEO_ID">
  <img src="/assets/images/video-poster.webp" alt="Watch video">
  <button class="play-btn" aria-label="Play video"></button>
</div>
```

### Cal.com
Preload on landing, embed on calendar page:
```javascript
// Landing page - preload in background
Cal("init", {origin:"https://cal.com"});
Cal("preload", { calLink: "username/30min" });

// Calendar page - inline embed
Cal("inline", { elementOrSelector: "#cal-embed", calLink: "username/30min" });
```

### Forms
Always capture UTM parameters:
```javascript
const params = new URLSearchParams(window.location.search);
const utmData = {
  utm_source: params.get('utm_source'),
  utm_medium: params.get('utm_medium'),
  utm_campaign: params.get('utm_campaign')
};
```

## Environment Variables (Vercel)
```
ROAM_API_KEY=xxx
ROAM_CHANNEL_ID=xxx
```

## Conversion Events
| Event | Meta | Google | When |
|-------|------|--------|------|
| PageView | `fbq('track', 'PageView')` | `gtag('event', 'page_view')` | Page load |
| Lead | `fbq('track', 'Lead')` | `gtag('event', 'conversion', {...})` | Form submit |
| Schedule | `fbq('track', 'Schedule')` | `gtag('event', 'conversion', {...})` | Booking complete |

## User Flow
```
Landing Page → Form Submit → Calendar Page → Book Slot → Confirmation
     ↓              ↓              ↓              ↓
 PageView        Lead         PageView      Schedule
                + RO.AM                     + RO.AM
```

## Mobile Requirements
- All touch targets: minimum 44x44px
- Use `type="tel"`, `type="email"` for proper keyboards
- Include `autocomplete` attributes on form fields
- Test on iOS Safari and Chrome Android
