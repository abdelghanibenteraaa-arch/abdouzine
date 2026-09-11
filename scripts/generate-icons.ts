import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generate() {
  const publicDir = path.resolve(process.cwd(), 'public');
  const iconsDir = path.join(publicDir, 'icons');

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // SVG source for icon
  const svgContent = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <rect width="512" height="512" rx="90" fill="#ba2638" />
    <circle cx="256" cy="256" r="185" fill="#ffffff" />
    <circle cx="256" cy="256" r="170" fill="#f8fafc" stroke="#ba2638" stroke-width="4" stroke-dasharray="12 8" />
    <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="82" font-weight="900" fill="#ba2638">عبدو</text>
    <text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="68" font-weight="900" fill="#0f172a">زين</text>
  </svg>
  `;

  // Maskable SVG with safe margin
  const maskableSvgContent = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <rect width="512" height="512" fill="#ba2638" />
    <circle cx="256" cy="256" r="160" fill="#ffffff" />
    <circle cx="256" cy="256" r="145" fill="#f8fafc" stroke="#ba2638" stroke-width="4" stroke-dasharray="10 6" />
    <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="70" font-weight="900" fill="#ba2638">عبدو</text>
    <text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="58" font-weight="900" fill="#0f172a">زين</text>
  </svg>
  `;

  fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgContent.trim());

  const svgBuffer = Buffer.from(svgContent);
  const maskableSvgBuffer = Buffer.from(maskableSvgContent);

  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(iconsDir, 'icon-192x192.png'));

  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon-512x512.png'));

  await sharp(maskableSvgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon-maskable-512x512.png'));

  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  console.log('Icons generated successfully in public/icons/');
}

generate().catch(console.error);
