# Watch Paint Dry

A meditative and mesmerizing digital painting experience.

## Features
- **Realistic Drying Physics**: Watch your strokes transition from wet and glossy to dry and matte in real-time.
- **Dynamic Lighting**: The wet paint interacts with light, creating a pseudo-3D effect.
- **Glassmorphism UI**: Beautiful, modern controls that float above your canvas.
- **Canvas Texture**: Subtle background texture for a premium feel.

## How to Run
1. Ensure you have Node.js installed.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the local URL in your browser.

## Controls
- **Mouse**: Click and drag to rotate the camera.
- **Scroll Wheel**: Change painting depth.
- **Keyboard Navigation**:
  - **Arrow Keys**: Move the brush.
  - **Space / Enter**: Apply paint.
  - **W / S Keys**: Adjust depth.

## Deployment
This project is configured for **GitHub Pages**.
1. Push your code to a GitHub repository named `watch-paint-dry`.
2. Go to **Settings > Pages**.
3. Set **Source** to **GitHub Actions**.
4. GitHub will automatically detect the Vite config and deploy your site.

## Tech Stack
- Vanilla JavaScript & Three.js
- HTML5 Canvas / WebGL
- CSS3 (Responsive & Accessible)
- Vite (Build Tooling)
