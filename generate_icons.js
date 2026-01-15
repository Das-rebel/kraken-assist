// Simple PNG icon generator using Canvas
const fs = require('fs');
const { createCanvas } = require('canvas');

function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#6366f1');
  gradient.addColorStop(1, '#8b5cf6');
  
  // Rounded rectangle
  const radius = size * 0.2;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, radius);
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // Outer circle
  ctx.strokeStyle = 'white';
  ctx.lineWidth = size * 0.03;
  ctx.beginPath();
  ctx.arc(size/2, size/2, size * 0.31, 0, Math.PI * 2);
  ctx.stroke();
  
  // Inner white circle
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(size/2, size/2, size * 0.19, 0, Math.PI * 2);
  ctx.fill();
  
  // Center dot
  ctx.fillStyle = '#6366f1';
  ctx.beginPath();
  ctx.arc(size/2, size/2, size * 0.06, 0, Math.PI * 2);
  ctx.fill();
  
  // Cross lines
  ctx.strokeStyle = 'white';
  ctx.lineWidth = size * 0.03;
  ctx.lineCap = 'round';
  
  // Vertical line
  ctx.beginPath();
  ctx.moveTo(size/2, size * 0.19);
  ctx.lineTo(size/2, size * 0.34);
  ctx.moveTo(size/2, size * 0.66);
  ctx.lineTo(size/2, size * 0.81);
  ctx.stroke();
  
  // Horizontal line
  ctx.beginPath();
  ctx.moveTo(size * 0.19, size/2);
  ctx.lineTo(size * 0.34, size/2);
  ctx.moveTo(size * 0.66, size/2);
  ctx.lineTo(size * 0.81, size/2);
  ctx.stroke();

  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`icons/icon${size}.png`, buffer);
  console.log(`Created icon${size}.png`);
}

// Create all sizes
[16, 32, 48, 128].forEach(createIcon);
console.log('All icons created!');
