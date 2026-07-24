# NURAA Design System

This file extends the product-level rules in `/DESIGN.md`. Page-specific files
inside `design-system/nuraa/pages/` may narrow these rules, but must not replace
the NURAA brand identity.

## Brand register

NURAA is a Saudi luxury home-fragrance maison. The storefront should feel
editorial, warm, quiet, tactile, and culturally grounded. It is image-led rather
than promotion-led: atmosphere first, product second, commerce third.

## Core tokens

| Role | Value | Usage |
| --- | --- | --- |
| Ink | `#17251F` | Primary text, deep-green surfaces |
| Warm ivory | `#FBFAF7` | Main canvas |
| Parchment | `#EEE8DC` | Alternate sections and soft panels |
| Clay | `#7B4D35` | Warm secondary accent |
| Gold | `#A47728` | Restrained highlights and active states |
| Hairline | `rgba(23, 37, 31, 0.12)` | Borders and separators |

Gold is an accent, never a large background. Body copy must retain at least
WCAG AA contrast against its surface.

## Typography

- Display and editorial headings: `Cormorant Garamond`, 500–600.
- Interface and body copy: `Outfit`, 400–600.
- Arabic: `Noto Sans Arabic`, with comfortable line-height and no forced Latin
  letter spacing.
- Storefront headings may use the display face. Admin interface headings do not.
- Avoid tiny uppercase text for primary information. Labels must remain readable
  at 12–14px.

## Spacing and shape

- Storefront sections: 96–144px vertical spacing on desktop, 64–88px mobile.
- Admin sections: 24–32px; control gaps: 8–16px.
- Storefront max content width: 1440px with responsive gutters.
- Admin max content width: 1600px, optimized for scan paths.
- Radius: 4–8px for storefront media and controls; 8–12px for admin surfaces.
- Use hairline borders instead of broad shadows. Reserve elevation for menus,
  dialogs, and sticky overlays.

## Components

### Buttons

- Primary: ink surface, ivory text, clear hover and focus state.
- Secondary: transparent surface with an ink hairline.
- Minimum interactive height: 40px desktop and 44px mobile.
- Icon-only actions require an accessible label.

### Cards

- Cards group information; they are not decoration.
- Storefront product cards are primarily media + typography and should not look
  like dashboard tiles.
- Admin metric cards are compact, flat, and aligned to a shared grid.

### Motion

- Use opacity, clip, and subtle image scale only where they reinforce hierarchy.
- Standard duration: 180–300ms. Editorial image reveals may reach 700ms.
- Never delay navigation or core controls for animation.
- Respect `prefers-reduced-motion` and disable non-essential movement.

## Responsive behavior

- Mobile layouts retain the same hierarchy rather than merely shrinking desktop.
- Navigation becomes a single accessible sheet/drawer.
- Product grids move from four columns to two, then one where copy length requires.
- Admin tables may scroll horizontally; primary actions remain visible.

## Avoid

- Blue SaaS palettes, monospaced dashboard typography, glassmorphism, gradients,
  excessive pill shapes, large drop shadows, nested cards, or decorative charts.
- Fake metrics, disabled-looking primary actions, hover-only content, and motion
  without reduced-motion support.
