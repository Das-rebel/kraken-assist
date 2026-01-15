# Kraken Assist Extension Icons

## Current Status
- icon.svg: Master SVG file (Kraken Assist branding)
- icon16.png, icon32.png, icon48.png, icon128.png: To be generated

## Generate PNG Icons

### Option 1: HTML Generator (Recommended - No dependencies)
1. Open `generate-icons.html` in your browser
2. Click each "Download" button for each icon size
3. Save the files as icon16.png, icon32.png, icon48.png, icon128.png
4. Move downloaded PNG files to this folder (icons/)
5. Reload the extension

### Option 2: ImageMagick (If installed)
```bash
# Check if ImageMagick is available
which convert

# If available, run:
convert icon.svg -resize 16x16 icon16.png
convert icon.svg -resize 32x32 icon32.png
convert icon.svg -resize 48x48 icon48.png
convert icon.svg -resize 128x128 icon128.png
```

### Option 2: ImageMagick (If installed)
```bash
# Check if ImageMagick is available
which convert

# If available, run:
convert icon.svg -resize 16x16 icon16.png
convert icon.svg -resize 32x32 icon32.png
convert icon.svg -resize 48x48 icon48.png
convert icon.svg -resize 128x128 icon128.png
```

### Option 3: Node.js with Canvas
```bash
npm install canvas
node generate_icons.js
```

### Option 4: Use Default Icons
The extension will work with Chrome's default puzzle piece icon if PNG files are not present.

## Note
PNG icons are optional. The extension will function correctly without them.
