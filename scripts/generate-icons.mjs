import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SVG_PATH = 'public/icons/icon.svg';
const OUTPUT_DIR = 'public/icons';

async function generate() {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const svgBuffer = fs.readFileSync(SVG_PATH);

    console.log('Generating icon-192.png...');
    await sharp(svgBuffer)
        .resize(192, 192)
        .toFile(path.join(OUTPUT_DIR, 'icon-192.png'));

    console.log('Generating icon-512.png...');
    await sharp(svgBuffer)
        .resize(512, 512)
        .toFile(path.join(OUTPUT_DIR, 'icon-512.png'));

    console.log('Done!');
}

generate().catch(console.error);
