const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function main() {
  const root = path.resolve(__dirname, '..');
  const outDir = path.join(root, 'public');

  // 1. Generate 512x512 App Icon
  const iconSource = path.join(root, 'uzvaj_application', 'assets', 'SVG', 'app_icon_smile.png');
  const iconDest = path.join(outDir, 'playstore_icon_512.png');
  
  await sharp(iconSource)
    .resize(512, 512, { fit: 'cover' })
    .png({ quality: 100 })
    .toFile(iconDest);

  const iconMeta = await sharp(iconDest).metadata();
  console.log(`Created: ${iconDest} (${iconMeta.width}x${iconMeta.height}, size: ${(fs.statSync(iconDest).size / 1024).toFixed(1)} KB)`);

  // 2. Generate 1024x500 Feature Graphic
  const logoSource = path.join(root, 'uzvaj_application', 'assets', 'SVG', 'PNG_Uživaj Logo Design-03.png');
  const featureDest = path.join(outDir, 'playstore_feature_graphic_1024x500.png');

  // Trim and scale logo to fit nicely on the 1024x500 canvas
  const logoBuffer = await sharp(logoSource)
    .trim()
    .resize({ width: 540 })
    .toBuffer();

  const logoMeta = await sharp(logoBuffer).metadata();
  const logoLeft = Math.round((1024 - logoMeta.width) / 2);
  const logoTop = 110;

  // Render high-res SVG canvas
  const svgBackground = Buffer.from(`
    <svg width="1024" height="500" viewBox="0 0 1024 500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0056eb" />
          <stop offset="50%" stop-color="#0066ff" />
          <stop offset="100%" stop-color="#0040b3" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stop-color="#4d94ff" stop-opacity="0.4" />
          <stop offset="100%" stop-color="#0040b3" stop-opacity="0" />
        </radialGradient>
      </defs>
      
      <!-- Gradient background -->
      <rect width="1024" height="500" fill="url(#bg)" />
      <rect width="1024" height="500" fill="url(#glow)" />
      
      <!-- Subtle luxury ambient rings -->
      <circle cx="100" cy="70" r="160" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.08" />
      <circle cx="930" cy="430" r="210" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.08" />
      <circle cx="940" cy="80" r="90" fill="#ffffff" opacity="0.03" />
      <circle cx="80" cy="440" r="110" fill="#ffffff" opacity="0.03" />

      <!-- Tagline pill -->
      <g transform="translate(512, 335)">
        <rect x="-170" y="-19" width="340" height="38" rx="19" fill="#FBAE3D" />
        <text x="0" y="6" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="2">
          UŽIVAJ VIŠE, PLATI MANJE
        </text>
      </g>

      <!-- Subtext -->
      <text x="512" y="420" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="600" fill="#E6EFFF" text-anchor="middle" letter-spacing="0.5">
        Ekskluzivni popusti u restoranima i kafićima
      </text>
    </svg>
  `);

  await sharp(svgBackground)
    .composite([
      {
        input: logoBuffer,
        top: logoTop,
        left: logoLeft,
      }
    ])
    .png({ quality: 100 })
    .toFile(featureDest);

  const featureMeta = await sharp(featureDest).metadata();
  console.log(`Created: ${featureDest} (${featureMeta.width}x${featureMeta.height}, size: ${(fs.statSync(featureDest).size / 1024).toFixed(1)} KB)`);
}

main().catch(console.error);

