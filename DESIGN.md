# NURAA Design System

## Brand register

NURAA is a Saudi luxury home-fragrance house. The experience should feel warm, composed, tactile, editorial, and culturally grounded. It must not resemble a generic SaaS template, a loud beauty store, or a decorative “Middle Eastern” theme.

## Storefront

- Use editorial composition, generous negative space, large product photography, and restrained motion.
- Primary palette: ink green `#17251F`, warm ivory `#FBFAF6`, parchment `#EEE8DC`, clay `#7B4D35`, antique gold `#D2AD66`.
- Display typography: Cormorant Garamond. Interface/body typography: Outfit. Arabic: Noto Sans Arabic.
- Headlines should normally occupy no more than two or three lines on desktop.
- Product imagery is the main source of color. Avoid gradients except subtle photographic overlays.
- Use square or lightly rounded controls; avoid excessive pills, nested cards, glass effects, and decorative badges.
- Motion must be calm: 200–900ms, transform/opacity only, and disabled for reduced-motion users.
- All storefront media and copy must continue to read from the existing CMS, catalog, Prisma, and Supabase Storage.

## Admin

- The admin is an operations tool, not a marketing page. Prioritize scannability, clear hierarchy, compact tables, and predictable navigation.
- Use the same ink/ivory/gold identity at lower intensity. Status colors remain semantic.
- Minimum interactive target is 44px. Every icon-only action needs an accessible name.
- Tables may scroll horizontally on small screens; controls and filters must remain usable without hover.
- Use one primary action per page. Destructive actions must be separated and confirmed.
- Charts need readable labels, tooltips, and a text/table equivalent where appropriate.

## Shared rules

- Preserve English and Arabic layouts, including RTL behavior.
- Maintain visible focus states and WCAG AA text contrast.
- Use `next/image` with `fill`, a positioned parent, and accurate `sizes` for responsive media.
- Do not change database models, API contracts, payment state, CMS keys, or Supabase media URLs as part of visual work.
