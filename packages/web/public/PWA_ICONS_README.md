# PWA Icons

The following icon files are required for the Progressive Web App to function properly:

## Required Icons

1. **pwa-192x192.png** - 192x192px PNG icon
   - Standard app icon for mobile home screens
   - Should have the Fast Track logo/branding
   - Background color: #0f172a (dark blue-grey)
   - Primary color: #1976d2 (blue)

2. **pwa-512x512.png** - 512x512px PNG icon
   - High-resolution app icon
   - Used for splash screens and larger displays
   - Same design as 192x192 but higher resolution

3. **apple-touch-icon.png** - 180x180px PNG icon
   - iOS-specific app icon
   - Should be the same design as other icons
   - iOS will automatically add rounded corners

4. **masked-icon.svg** - SVG monochrome icon
   - Safari pinned tab icon (macOS)
   - Should be a single color (monochrome) version of the logo
   - Typically the silhouette/outline of the main logo

## How to Generate Icons

You can use online tools like:
- https://favicon.io/favicon-converter/ - Convert any image to multiple icon sizes
- https://realfavicongenerator.net/ - Comprehensive favicon/PWA icon generator
- https://www.pwabuilder.com/ - PWA asset generator

## Design Recommendations

- **Logo**: Consider using a dumbbell, running shoe, or plate/fork icon to represent fitness
- **Color Scheme**:
  - Background: #0f172a (dark slate)
  - Primary: #1976d2 (blue)
  - Accent options: #f97316 (orange), #ef4444 (red), #3b82f6 (blue), #8b5cf6 (purple)
- **Style**: Minimalist, flat design with good contrast for visibility on various backgrounds
- **Safe Area**: Keep important elements within the center 80% to account for iOS masking

## Temporary Fallback

Until proper icons are created, the app will use the default Vite/Vue icon. The PWA will still function, but the install experience won't be optimal.
