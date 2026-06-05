---
name: Financial Integrity
colors:
  surface: '#031427'
  surface-dim: '#031427'
  surface-bright: '#2a3a4f'
  surface-container-lowest: '#000f21'
  surface-container-low: '#0b1c30'
  surface-container: '#102034'
  surface-container-high: '#1b2b3f'
  surface-container-highest: '#26364a'
  on-surface: '#d3e4fe'
  on-surface-variant: '#c6c6cd'
  inverse-surface: '#d3e4fe'
  inverse-on-surface: '#213145'
  outline: '#909097'
  outline-variant: '#45464d'
  surface-tint: '#bec6e0'
  primary: '#bec6e0'
  on-primary: '#283044'
  primary-container: '#0f172a'
  on-primary-container: '#798098'
  inverse-primary: '#565e74'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb690'
  on-tertiary: '#552100'
  tertiary-container: '#2d0e00'
  on-tertiary-container: '#d45d00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdbca'
  tertiary-fixed-dim: '#ffb690'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#783200'
  background: '#031427'
  on-background: '#d3e4fe'
  surface-variant: '#26364a'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style
The design system is anchored in **Trust, Clarity, and Forward Motion**. It is designed for users who require a high-precision view of their financial health without the cognitive load typically associated with banking software.

The visual style is **Modern Corporate with a Humanist Touch**. It leverages a "Soft-Scale" approach: combining the structural reliability of enterprise finance with the approachable aesthetics of consumer technology. Key characteristics include:
- **High-Information Clarity:** Prioritizing readability and data visualization through generous whitespace and intentional focal points.
- **Precision Minimalism:** Removing unnecessary ornamentation to focus on numbers and actions.
- **Sophisticated Softness:** Using large corner radii and fluid transitions to make the experience feel organic and less intimidating.

## Colors
The palette is strategically split between stability and action, optimized for a high-performance **Dark Mode** environment.

- **Primary (Deep Navy):** Represents the foundation of the brand. In this dark-first interface, it defines the deep obsidian and midnight tones of the background and primary containers.
- **Secondary (Mint Green):** Symbolizes growth, income, and "positive" data points. It is high-vibrancy to ensure it stands out clearly against the dark background.
- **Tertiary (Soft Orange):** Reserved for expenses, warnings, and alerts. It is tuned to be noticeable without feeling aggressive on a dark canvas.
- **Neutral (Slate):** Used for secondary text and structural borders to maintain a professional, calm atmosphere.

**Dark Mode Implementation:**
The system defaults to a sophisticated dark mode. The primary background is a deep obsidian. Surfaces utilize a slightly lighter navy-grey to maintain depth and hierarchy. Primary brand colors maintain their hue but are adjusted for AA accessibility against dark backgrounds.

## Typography
This design system utilizes **Inter** for its exceptional legibility and systematic weight distribution, particularly effective on high-resolution screens in dark mode.

- **Data Focus:** For financial figures, use `Inter` with tabular lining (tnum) enabled to ensure numbers align vertically in lists and tables.
- **Hierarchy:** Use `Headline-XL` for primary account balances and `Headline-MD` for card titles.
- **Labels:** Small labels use a medium weight with slight tracking (letter-spacing) to ensure they remain legible even at 12px against dark surfaces.

## Layout & Spacing
The layout follows a **Fluid Grid** model with strict 8px incremental spacing.

- **Desktop:** A 12-column grid with 24px gutters and 40px outer margins. Content is often centered in a max-width container of 1280px for readability.
- **Mobile:** A 4-column grid with 16px margins. 
- **Rhythm:** Use `md` (24px) for the majority of component padding to maintain the "airy" feel requested. Use `lg` (48px) to separate distinct functional sections (e.g., the gap between a chart and a transaction list).

## Elevation & Depth
Depth is created through **Tonal Layering** supplemented by **Subtle Outlines**.

1.  **Base Layer:** The lowest level (background).
2.  **Surface Layer:** Cards and containers. These use slightly lighter shades of the background to indicate elevation.
3.  **Raised Layer:** Modals and dropdowns. These use the highest surface brightness in the palette.

In Dark Mode, traditional shadows are replaced by **low-contrast outlines** (1px solid) and subtle shifts in surface brightness to indicate elevation, as shadows are less effective on dark backgrounds.

## Shapes
The shape language is defined by **Friendly Geometry**.

- **Standard Elements:** Buttons, input fields, and small cards use `0.5rem` (rounded).
- **Large Containers:** Main dashboard cards and modal sheets use `1rem` (rounded-lg).
- **Interactive Decor:** Progress bars and pill-tags use `1.5rem` (rounded-xl) or full caps for a softer, modern appearance.

## Components
- **Buttons:** Primary buttons use a high-contrast treatment against the dark background. Success actions (e.g., "Add Funds") use the Mint Green. All buttons have a height of 48px for touch-friendliness.
- **Input Fields:** Use a subtle dark-grey background in dark mode with a 1px border that turns Secondary Mint or Primary Navy on focus. Labels sit outside the field for accessibility.
- **Cards:** Cards are the primary container. They feature an elevated surface background, `rounded-lg` corners, and a 24px internal padding.
- **Chips/Badges:** Small, pill-shaped indicators for categories (e.g., "Housing", "Groceries"). Use low-opacity versions of the secondary or tertiary colors as backgrounds with high-contrast text.
- **Lists:** Transaction lists should be high-contrast. Use `body-md` for the title and `label-sm` for the timestamp. The amount should be `body-md` bold, colored by Secondary (income) or Tertiary (expense).
- **Icons:** Use 24px minimalist line icons (2px stroke width). Icons should be monochromatic (Neutral Slate) unless they signify a specific status.