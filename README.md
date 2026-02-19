# Astral Rangoli

A production-grade generative art application built with **Angular v17+** and **p5.js**.

## Features
- **Physics Engine**: Anti-gravity particles with orbit mechanics and drag interactions.
- **Symmetry Engine**: N-fold radial symmetry (2-16 axes) for kaleidoscopic effects.
- **Visuals**: Neon/Glassmorphism UI, bloom effects, and dynamic HSB color palettes.
- **Performance**: Optimized for 60fps with up to 2000 particles using instance mode p5.

## Installation

1. **Prerequisites**: Node.js v18+
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Run Locally**:
   ```bash
   ng serve
   ```
   Navigate to `http://localhost:4200/`.

## Deployment

To deploy to GitHub Pages:

```bash
ng build --configuration production --base-href /shilpaRangoli-app/
npx angular-cli-ghpages --dir=dist/my-rangoli-app
```

## Controls
- **Click/Drag**: Spawn particles.
- **Click**: Add gravity anchor.
- **Sliders**: Adjust symmetry, speed, gravity, and size.
- **Palette**: Switch between Neon, Pastel, Fire, and Ice themes.

