# Philosophy AI — space design adaptation

## Scope and source mapping

- Design reference: https://tinyastronomer.com/ → `/` (`index.html`). Adapt the observatory composition to the existing AI education content, rather than recreating astronomy studies.
- Shared palette: `/education-inquiry.html` keeps its existing content, education photos, inquiry form and lightbox.
- Existing community, authentication, admin routes and Firebase rules retain their implementations.

## Website cloner template use

Source: https://github.com/JCodesMore/ai-website-cloner-template
Inspected revision: `ee3f5a2f31fd549b9593fa4f7cf6d2955ee593bb`.

Applied `.agents/skills/clone-website/SKILL.md` and its inspection guide: map existing routes, observe the reference, implement editable styles, compare the rendered result. Adapted `src/app/globals.css`'s semantic dark token structure (`background`, `foreground`, `card`, `muted`, `border`, `ring`) in `assets/space-theme.css`, with aliases for the site's existing variables. The MIT notice is retained in `docs/third-party/website-cloner-LICENSE.txt`.

The existing site is HTML/CSS/JavaScript with Netlify functions. The template's Next.js/Tailwind runtime is not required for this adaptation; introducing it would require a separate migration of the Firebase pages and deployment configuration.

## Reference observations and adaptations

The reference homepage has a nearly black background, generous spacing, warm gold markers, large Earth visual, pale display typography and a numbered observation list. Here the observation list links to the six existing education destinations. Existing Korean body fonts and actual site copy are retained. Tool cards and section headings follow the darker palette. No reference logo, original copy, website bundles or astronomy application code is copied.

## Asset map

| Origin | Repository path | Use |
| --- | --- | --- |
| https://images-assets.nasa.gov/image/as17-148-22727/as17-148-22727~medium.jpg | `assets/space/earth-blue-marble.jpg` | 1280 × 1280 NASA Apollo 17 photograph; CSS crop and illustrative night shading |
| Original SVG created for this site | `assets/space/starfield.svg` | Decorative star background |
| Original SVG created for this site | `assets/space/constellation.svg` | Decorative constellation; not a scientific sky chart |

NASA source and credit: https://images.nasa.gov/details/as17-148-22727 — NASA / Apollo 17. The credit is visible on the homepage. The orbit line and shading are decorative, not a live astronomical simulation. The original mascot remains in `assets/mascot.jpg`.

## Responsive behavior

- Wide desktop: introductory copy, Earth image and six destination links in three columns.
- Medium desktop/tablet: copy and Earth in two columns; navigation below in three columns.
- Mobile: copy, Earth, two-column destination list, then single-column tool cards.
- Mobile menu is a keyboard-operable button with expanded state; Escape closes it.
- Motion is disabled when the device requests reduced motion.

## Run

No build or package installation is needed. Run `python -m http.server 8000` from the repository, then open http://localhost:8000. Existing Netlify publish directory and serverless configuration are unchanged.

## Validation

- `git diff --check` and `node --check` on the inline JavaScript: pass.
- Headless Chromium rendering at 1440, 1920, 1024, 820, 768, 390 and 320 px: no horizontal overflow or visible missing local images.
- Existing offline fallback: 40 tool cards; science category returns 7 cards; resetting to all restores 40.
- Mobile menu: open, Escape close, anchor navigation close and `aria-expanded` state pass.
- Reduced motion: Earth float animation disabled.
- Education inquiry page: no horizontal overflow at 1440, 390 and 320 px.
- No JavaScript page errors in the local tests. External requests were blocked during these checks to avoid sending analytics or writing to Firestore. Authenticated login, community posting and live CMS data were not exercised.
- Preview screenshots: `space-desktop.jpg`, `space-mobile.jpg`; the test renderer used an installed Korean fallback font. Live browsers can use the existing online Pretendard/Noto/Cormorant font links.
