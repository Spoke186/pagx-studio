---
name: PagX Studio
description: Web design studio whose own site is the proof of its craft.
colors:
  bg-dark: "oklch(0.15 0.004 85)"
  bg-light: "oklch(0.962 0.009 85)"
  surface-dark: "oklch(0.195 0.005 85)"
  surface-light: "oklch(0.93 0.011 85)"
  line-dark: "oklch(0.31 0.006 85)"
  line-light: "oklch(0.86 0.012 85)"
  fg-dark: "oklch(0.96 0.01 85)"
  fg-light: "oklch(0.16 0.005 85)"
  muted-dark: "oklch(0.7 0.01 85)"
  muted-light: "oklch(0.46 0.01 85)"
  signal: "oklch(0.67 0.22 37)"
  signal-deep: "oklch(0.6 0.23 29)"
typography:
  display:
    fontFamily: "Hanken Grotesk Variable, system-ui, sans-serif"
    fontSize: "clamp(3rem, 8.8vw, 10rem)"
    fontWeight: 600
    lineHeight: 0.88
    letterSpacing: "-0.055em"
    textTransform: "uppercase"
  headline:
    fontFamily: "Hanken Grotesk Variable, system-ui, sans-serif"
    fontSize: "clamp(2.1rem, 4.6vw, 4.4rem)"
    fontWeight: 560
    lineHeight: 1
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Hanken Grotesk Variable, system-ui, sans-serif"
    fontSize: "clamp(1.0625rem, 1.2vw, 1.1875rem)"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Hanken Grotesk Variable, system-ui, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 600
    letterSpacing: "0.1em"
    textTransform: "uppercase"
  code:
    fontFamily: "Share Tech Mono, ui-monospace, monospace"
rounded:
  pill: "999px"
  panel: "14px"
  stage: "24px"
components:
  button-primary:
    backgroundColor: "{colors.fg-dark} on dark / {colors.fg-light} on light"
    textColor: "the page background"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    height: "50px"
  button-secondary:
    backgroundColor: "transparent, 1px border in fg at 35%"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
---

# Design System: PagX Studio

> Status: "Horizonte" round 2 (2026-10-09, DECISIONS #34). Light and dark themes. Where this file and DIRECTION §11.1 disagree with older text below, round 2 wins: Hanken Grotesk + Share Tech Mono (code only), flat ink/paper pills, no glows; the 3D lives in the hero (ribbons of code), inside the type (scanned bodies) and under the closing (the band).

## Overview

**Creative North Star: "Horizonte"**, round 2. PagX is where code becomes a website. The page reads like the agency poster of pin GIRLBOSS, recoloured in "Tinta" (DECISIONS #36): neutral grotesk type, tiny uppercase labels, flat ink/paper pills, a hairline grid and one signal orange. The 3D is live and tells one story, code becoming things (DECISIONS #35): ribbons of code glyphs behind the hero (pin Imagica), code that assembles a laptop and phone which land on each concept's live site, a ribbon of code through the automation steps, and a black glass phone lit bone and orange that types the first WhatsApp messages. No human faces anywhere.

## Colors

"Tinta" (DECISIONS #36). Two themes share role tokens (`--color-bg`, `surface`, `line`, `fg`, `muted`, `accent`); the theme is chosen by the visitor (header toggle, remembered) or the system.
- **Dark:** warm black with bone text. **Light:** warm paper with near-black ink. No blue tint anywhere.
- **Signal orange** (`--color-c1`) is the only colour: the logo dot, eyebrow squares, active underlines, the last word of the closing title, the flow's trail and the customer's chat bubble. `--color-c2` (deeper red) only ends a gradient.
- **3D ink** (`--gl-1/2/3/hi`): bone and graphite glyphs with orange rims on dark; ink and graphite with orange rims and folds on paper. `stage.ts` reads them, so colour lives in CSS only.
- **Ice** (`--color-ice`) is kept only for the portfolio's HUD, which is always dark.

## Typography

- **Hanken Grotesk** (variable, OFL) for everything: display 600 uppercase with −0.055em tracking; headlines 560; body 400; labels 600 at 11–12 px uppercase with +0.1em.
- **Share Tech Mono** only where it is code: the 3D glyphs, tracking-box labels and the browser URL bar.
- Hero intro: letters rise and decode from terminal glyphs. Cursor proximity thins nearby letters to 180.

## Layout

- 12-column grid, max 1440px, gutter `clamp(16px, 4vw, 56px)`. A fixed 6-column hairline grid sits behind the content.
- Hero: tag and specs on top, giant title bottom-left, the ribbons across the upper half.
- Concepts: a giant title. Each case opens with a hairline, its number and its name; its frames are assembled from code before the live site appears.
- Closing: copy on 7 columns, the phone on the right 5 (stacked on phones).
- Mobile is designed on its own: thumb bar with the primary CTA, specs hidden in the hero, the closing contact rows stacked above the band.

## Components

- **Primary button:** flat pill in `fg` with `bg` text, uppercase label, rolling letters, arrow. **Secondary:** transparent with a 1px `fg` border at 35%.
- **Theme toggle:** a 40px circle with a half-filled disc that turns 180° between themes.
- **Eyebrow:** a small orange square, the section number and an uppercase label.
- **Flow (automations):** with WebGL, a ribbon of code links the steps and lights up to the packet; the steps are glass chips tilted in CSS 3D. Without WebGL, a 1px line that draws itself.
- **Closing phone (`.closing-phone`):** a link to WhatsApp; the stage draws the lit phone into its box, and the static tier shows a still of it.

## Motion and tiers

- UI easing `cubic-bezier(0.16, 1, 0.3, 1)`; 3D on the master clock.
- High: DPR ≤ 1.75 and full glyph/point counts. Mid (coarse pointer or ≤ 4 cores): DPR 1 and about half. Reduced motion: no WebGL; stills per theme from `public/home/`.

## Do's and Don'ts
- **Do** keep the 3D inside the layout (behind the hero, inside the type, under the closing), never as a loose decoration.
- **Do** label every demo as a concept.
- **Don't** use neon glows, colored chips or decorative monospace.
- **Don't** show human faces in any asset.
