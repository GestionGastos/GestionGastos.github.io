---
name: Financial Integrity
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#341100'
  on-tertiary-container: '#d95f00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
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
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
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
The palette is strategically split between stability and action. 

- **Primary (Deep Navy):** Represents the foundation of the brand. Used for headers, primary navigation, and core brand elements to instill a sense of institutional security.
- **Secondary (Mint Green):** Symbolizes growth, income, and "positive" data points. It is high-vibrancy to ensure it stands out against the dark primary.
- **Accent (Soft Coral):** Reserved for expenses, warnings, and alerts. It is tuned to be noticeable without feeling aggressive.
- **Neutral (Slate):** Used for secondary text and structural borders to maintain a professional, calm atmosphere.

**Dark Mode Implementation:**
In dark mode, the primary background shifts to a deep obsidian (`#0B0F1A`). Surfaces utilize a slightly lighter navy-grey (`#1E293B`) to maintain depth. Primary brand colors maintain their hue but are adjusted for AA accessibility against dark backgrounds.

## Typography
This design system utilizes **Inter** for its exceptional legibility and systematic weight distribution.

- **Data Focus:** For financial figures, use `Inter` with tabular lining (tnum) enabled to ensure numbers align vertically in lists and tables.
- **Hierarchy:** Use `Headline-XL` for primary account balances and `Headline-MD` for card titles.
- **Labels:** Small labels use a medium weight with slight tracking (letter-spacing) to ensure they remain legible even at 12px.

## Layout & Spacing
The layout follows a **Fluid Grid** model with strict 8px incremental spacing.

- **Desktop:** A 12-column grid with 24px gutters and 40px outer margins. Content is often centered in a max-width container of 1280px for readability.
- **Mobile:** A 4-column grid with 16px margins. 
- **Rhythm:** Use `md` (24px) for the majority of component padding to maintain the "airy" feel requested. Use `lg` (48px) to separate distinct functional sections (e.g., the gap between a chart and a transaction list).

## Elevation & Depth
Depth is created through **Tonal Layering** supplemented by **Ambient Shadows**.

1.  **Base Layer:** The lowest level (background).
2.  **Surface Layer:** Cards and containers. These use a very soft, diffused shadow: `box-shadow: 0 4px 20px rgba(15, 23, 42, 0.05)`.
3.  **Raised Layer:** Modals and dropdowns. These use a more pronounced shadow: `box-shadow: 0 12px 40px rgba(15, 23, 42, 0.12)`.

In Dark Mode, shadows are replaced by **low-contrast outlines** (1px solid `#1E293B`) and subtle shifts in surface brightness to indicate elevation, as shadows are less effective on dark backgrounds.

## Shapes
The shape language is defined by **Friendly Geometry**.

- **Standard Elements:** Buttons, input fields, and small cards use `0.5rem` (rounded).
- **Large Containers:** Main dashboard cards and modal sheets use `1rem` (rounded-lg).
- **Interactive Decor:** Progress bars and pill-tags use `1.5rem` (rounded-xl) or full caps for a softer, modern appearance.

## Components
- **Buttons:** Primary buttons use the Deep Navy background with white text. Success actions (e.g., "Add Funds") use the Mint Green. All buttons have a height of 48px for touch-friendliness.
- **Input Fields:** Use a subtle `#F1F5F9` background in light mode with a 1px border that turns Primary Blue on focus. Labels sit outside the field for accessibility.
- **Cards:** Cards are the primary container. They feature a white background, `rounded-lg` corners, and a 24px internal padding.
- **Chips/Badges:** Small, pill-shaped indicators for categories (e.g., "Housing", "Groceries"). Use low-opacity versions of the secondary or tertiary colors as backgrounds with high-contrast text.
- **Lists:** Transaction lists should be high-contrast. Use `body-md` for the title and `label-sm` for the timestamp. The amount should be `body-md` bold, colored by Secondary (income) or Accent (expense).
- **Icons:** Use 24px minimalist line icons (2px stroke width). Icons should be monochromatic (Neutral Slate) unless they signify a specific status.