# FAQ Video Page - Adding New Videos

This guide explains how to add new FAQ videos to the `/faq.html` page.

---

## Quick Start

To add a new video, edit the `FAQ_VIDEOS` array in `faq.html` (around line 185).

### Video Object Format

```javascript
{
  id: 'WISTIA_VIDEO_ID',
  title: 'Video Title Goes Here',
  subtitle: 'Description that appears below the title.'
}
```

### Example: Adding a New Video

```javascript
var FAQ_VIDEOS = [
  // Existing videos...

  // ADD YOUR NEW VIDEO HERE:
  {
    id: 'abc123xyz',                           // Wistia video ID
    title: 'How Do I Cancel My Subscription?', // Main title
    subtitle: 'Watch this if you need to pause or cancel your Olympus subscription.'
  }
];
```

---

## Finding the Wistia Video ID

The Wistia video ID is the alphanumeric string in your Wistia embed code or URL.

**From Wistia URL:**
```
https://fast.wistia.com/medias/wdx45t6xuy
                              ^^^^^^^^^^^
                              This is the ID
```

**From Wistia Embed Code:**
```html
<script src="https://fast.wistia.com/embed/wdx45t6xuy.js" async type="module"></script>
                                           ^^^^^^^^^^^
                                           This is the ID
```

---

## Complete Example

Here's what the full array looks like with 12+ videos:

```javascript
var FAQ_VIDEOS = [
  {
    id: 'wdx45t6xuy',
    title: 'What Results Can You Realistically Expect?',
    subtitle: 'Watch this if you have questions about ROI potential.'
  },
  {
    id: 'duvyg42f0m',
    title: 'Are There Contracts? Am I Locked In?',
    subtitle: 'Watch this if you\'ve been burned before and you\'re wondering what happens if this doesn\'t work.'
  },
  // ... more videos

  // NEW VIDEO ADDED HERE:
  {
    id: 'newvideoid',
    title: 'Your New Question Title?',
    subtitle: 'Helpful description for when to watch this video.'
  }
];
```

---

## Best Practices

### Titles
- Keep titles as questions when possible
- Front-load the most important words
- Aim for under 60 characters

### Subtitles
- Start with "Watch this if..." for consistency
- Address the viewer's concern or mindset
- Keep under 100 characters

### Order
- Put most common/important questions first
- Group related topics together
- Consider the viewer's journey (what they'd ask first)

---

## Escaping Special Characters

If your title or subtitle contains quotes, escape them with a backslash:

```javascript
{
  id: 'abc123',
  title: 'What\'s the Timeline?',           // Escaped apostrophe
  subtitle: 'Watch this if you\'re unsure.' // Escaped apostrophe
}
```

Or use double quotes for the string:

```javascript
{
  id: 'abc123',
  title: "What's the Timeline?",             // No escape needed
  subtitle: "Watch this if you're unsure."
}
```

---

## Testing Your Changes

1. Save the file
2. Refresh `/faq.html` in your browser
3. Verify:
   - New video appears in the playlist sidebar
   - Clicking it loads the video
   - Search finds it by title or subtitle
   - URL updates to `?v=VIDEOID`

---

## Thumbnail Images

Thumbnails are automatically pulled from Wistia using this URL pattern:
```
https://fast.wistia.com/embed/medias/VIDEO_ID/swatch
```

No manual upload required - Wistia generates them automatically.

---

## Current Videos (as of initial build)

| # | Wistia ID | Title |
|---|-----------|-------|
| 1 | wdx45t6xuy | What Results Can You Realistically Expect? |
| 2 | duvyg42f0m | Are There Contracts? Am I Locked In? |
| 3 | 32ryau775a | How Is This Even Possible? |
| 4 | 48lzhpxwpg | Price of Olympus |
| 5 | m8u10m06y1 | What If It Fails/Doesn't Work For Me? |
| 6 | fyzm3fwyyu | Is This Just ChatGPT/Claude With a Fancy Interface? |
| 7 | j8czqidp92 | I Already Have a Marketing Team or Agency |
| 8 | pl1gk0x2ft | I'm Not Good With Technology |
| 9 | 1zj43u301u | How Is This Different From Hiring an Agency? |
| 10 | bnteyd9j15 | Who Is Olympus For? |
| 11 | rtuzobug0m | What's the Timeline? When Do I See Results? |
| 12 | aey4oyfzrg | What Exactly Is Olympus? |
