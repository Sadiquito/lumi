# Lumi Design System Lockfile

Version: 1.0

---

## 🖋 Typography

- **Title Font**: Cinzel
- **Title Font Weights Available**: 400 (regular), 700 (bold)
- **Body Font**: Crimson Pro
- **Body Font Weights Available**: 200-900

### Font Usage Rules

- **Main Lumi Title (`lumi`)**
  - Font: Cinzel
  - Font Weight: 700 (bold)
  - Text Case: Write string lowercase (`lumi`) — Cinzel naturally renders it as caps
  - Tracking: `tracking-wider`
  - Size: `text-6xl md:text-7xl`
  - Effects:
    - Multi-layered glow using blur and scaling
    - Gradient: `bg-gradient-to-b from-amber-100 via-orange-100 to-rose-100`
    - Text shadow: `drop-shadow-lg`
    - Overlay blurs:
      - Aquamarine: `text-lumi-aquamarine/40 blur-2xl scale-110`
      - Sunset gold: `text-lumi-sunset-gold/30 blur-xl scale-105`

- **Subtitle (`superintelligent journaling`)**
  - Font: Cinzel
  - Font Weight: `font-medium` (superintelligent), `font-semibold` (journaling)
  - Size: `text-3xl md:text-5xl`
  - Tracking: `tracking-wide`
  - Colors:
    - `superintelligent`: white (`text-white`)
    - `journaling`: `text-lumi-aquamarine`

- **Body Text**
  - Font: Crimson Pro
  - Weight: 400-500
  - Color: `text-white/90`
  - Size: `text-xl`

---

## 🎨 Colors

```javascript
colors: {
  'lumi-aquamarine': '#4ECDC4',
  'lumi-sunset-gold': '#FFD93D',
  'lumi-coral': '#FF6B6B',
  'primary-background': '#121212',
  'secondary-background': '#1F1F1F',
  'text-primary': '#FFFFFF',
  'text-secondary': '#CCCCCC',
}
