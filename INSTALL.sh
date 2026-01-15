#!/bin/bash

echo "🚀 Installing Eigent Chrome Extension..."
echo ""

# Check if we're in the right directory
if [ ! -f "manifest.json" ]; then
  echo "❌ Error: manifest.json not found"
  echo "Please run this script from the eigent-chrome-extension directory"
  exit 1
fi

echo "✅ Extension files verified"
echo ""

# Try to generate icons if possible
echo "🎨 Attempting to generate icons..."
if command -v convert &> /dev/null; then
  echo "Using ImageMagick..."
  cd icons
  convert icon.svg -resize 16x16 icon16.png 2>/dev/null && echo "✓ icon16.png"
  convert icon.svg -resize 32x32 icon32.png 2>/dev/null && echo "✓ icon32.png"
  convert icon.svg -resize 48x48 icon48.png 2>/dev/null && echo "✓ icon48.png"
  convert icon.svg -resize 128x128 icon128.png 2>/dev/null && echo "✓ icon128.png"
  cd ..
elif command -v node &> /dev/null; then
  echo "Using Node.js (this may take a moment)..."
  npm install canvas --silent 2>/dev/null
  node generate_icons.js 2>/dev/null && echo "✓ Icons generated"
else
  echo "⚠️  Could not generate PNG icons"
  echo "   The extension will use the default browser icon"
  echo "   See icons/README.md for manual generation options"
fi

echo ""
echo "📦 Extension is ready to install!"
echo ""
echo "Next steps:"
echo "1. Open Chrome/Brave and navigate to:"
echo "   - Chrome: chrome://extensions"
echo "   - Brave: brave://extensions"
echo ""
echo "2. Enable 'Developer mode' (top-right toggle)"
echo ""
echo "3. Click 'Load unpacked' button"
echo ""
echo "4. Select this folder:"
echo "   $(pwd)"
echo ""
echo "5. Configure your Anthropic API key in extension settings"
echo ""
echo "📖 See INSTALL.md for detailed instructions"
echo "✨ Enjoy your multi-agent workforce!"
