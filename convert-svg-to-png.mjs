import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const svgFiles = [
  'shift-logo.svg',
  'shift-logo-light.svg',
  'shift-logo-dark.svg'
];

const sizes = [
  { name: '', width: 160, height: 60 },      // 1x
  { name: '@2x', width: 320, height: 120 },  // 2x
  { name: '@3x', width: 480, height: 180 }   // 3x
];

async function convert() {
  for (const svgFile of svgFiles) {
    const svgPath = join(__dirname, 'static', svgFile);
    const svgContent = readFileSync(svgPath, 'utf-8');
    const baseName = svgFile.replace('.svg', '');

    for (const size of sizes) {
      const pngPath = join(__dirname, 'static', `${baseName}${size.name}.png`);

      try {
        await sharp(Buffer.from(svgContent))
          .resize(size.width, size.height)
          .png()
          .toFile(pngPath);

        console.log(`Created: ${baseName}${size.name}.png (${size.width}x${size.height})`);
      } catch (err) {
        console.error(`Error converting ${svgFile}:`, err.message);
      }
    }
  }
}

convert();
