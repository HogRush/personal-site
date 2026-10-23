# HogRush · Personal Site

The personal website of **Stephen Lee (HogRush)** — a warm-paper editorial design:
off-white paper texture, serif italic display type, caramel accent, and generous
whitespace. Plain static HTML/CSS/JS with no build step, deployed to Cloudflare Pages.

**Live:** <https://hogrush.pages.dev/>

## Stack

- Hand-written HTML, CSS, and vanilla JavaScript — no framework, no bundler, no build step
- Web fonts loaded from Google Fonts (Playfair Display, Inter, Noto Serif SC)
- Inline SVG icons (Lucide-style, `stroke: currentColor`)
- Hosted on Cloudflare Pages

## Structure

```
.
├── index.html            # Page markup and all copy (hero, about, projects, contact)
├── styles.css            # Design tokens, components, responsive rules, theme variables
├── script.js             # Theme toggle, mobile nav, scroll-reveal animations
├── assets/
│   └── hogrush-logo*.png # Logo used in the hero
├── favicon.ico
├── icon-16.png           # Favicon sizes
├── icon-32.png
├── icon-192.png
├── apple-touch-icon.png  # iOS home-screen icon
└── .gitignore
```

## Local preview

Any static file server works — there is nothing to install or compile:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy

The site is served by the Cloudflare Pages project `hogrush`. To publish the current
directory as-is:

```bash
bunx wrangler pages deploy . --project-name=hogrush
```

## Theme

The site has a **three-state theme toggle**: `light`, `dark`, and `system`.

- Default is `system`, which follows the visitor's `prefers-color-scheme`.
- Clicking the toggle cycles `system → light → dark → system`.
- An explicit choice is persisted in `localStorage` under the key `theme`.
- An inline script in `<head>` applies the resolved theme before first paint, so there
  is no flash of the wrong theme.
- While in `system` mode, the page reacts live to OS-level theme changes.

## License

© Stephen Lee (HogRush). All rights reserved. The site's text, images, and design are
not licensed for reuse.
