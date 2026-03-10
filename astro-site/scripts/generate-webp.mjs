import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const projectRoot = process.cwd();
const imagesRoot = path.join(projectRoot, 'public', 'img');

function parseArgs(argv) {
  const options = {
    dryRun: false,
    quality: 76,
    minSavingsPercent: 3,
  };

  for (const arg of argv) {
    if (arg === '--dry-run') options.dryRun = true;
    if (arg.startsWith('--quality=')) options.quality = Number(arg.split('=')[1]);
    if (arg.startsWith('--min-savings=')) options.minSavingsPercent = Number(arg.split('=')[1]);
  }

  return options;
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function isSourceImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!(ext === '.jpg' || ext === '.jpeg' || ext === '.png')) return false;
  if (filePath.includes(`${path.sep}backup_originali${path.sep}`)) return false;
  return true;
}

function toKB(bytes) {
  return (bytes / 1024).toFixed(1);
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  const allFiles = await walk(imagesRoot);
  const targets = allFiles.filter(isSourceImage);

  let processed = 0;
  let created = 0;
  let skipped = 0;
  let failed = 0;
  let srcBytes = 0;
  let webpBytes = 0;

  console.log(`Found ${targets.length} source images in public/img`);
  console.log(`Mode: ${options.dryRun ? 'DRY-RUN' : 'WRITE'}`);

  for (const srcPath of targets) {
    processed += 1;

    try {
      const srcBuffer = await fs.readFile(srcPath);
      const srcSize = srcBuffer.length;
      srcBytes += srcSize;

      const webpPath = srcPath.replace(/\.(jpe?g|png)$/i, '.webp');
      const webpBuffer = await sharp(srcBuffer, { failOn: 'none', sequentialRead: true })
        .rotate()
        .webp({ quality: options.quality, effort: 6 })
        .toBuffer();

      const webpSize = webpBuffer.length;
      const savingsPercent = ((srcSize - webpSize) / srcSize) * 100;
      const shouldWrite = webpSize < srcSize && savingsPercent >= options.minSavingsPercent;

      if (!shouldWrite) {
        skipped += 1;
        webpBytes += srcSize;
        continue;
      }

      created += 1;
      webpBytes += webpSize;

      if (!options.dryRun) {
        await fs.writeFile(webpPath, webpBuffer);
      }

      const rel = path.relative(projectRoot, srcPath);
      console.log(`- ${rel}: ${toKB(srcSize)} KB -> ${toKB(webpSize)} KB (${savingsPercent.toFixed(1)}%)`);
    } catch (error) {
      failed += 1;
      console.error(`! Failed ${srcPath}: ${error.message}`);
    }
  }

  const totalSavings = srcBytes - webpBytes;
  const totalSavingsPercent = srcBytes > 0 ? (totalSavings / srcBytes) * 100 : 0;

  console.log('');
  console.log('Summary');
  console.log(`Processed: ${processed}`);
  console.log(`Created:   ${created}`);
  console.log(`Skipped:   ${skipped}`);
  console.log(`Failed:    ${failed}`);
  console.log(`Source:    ${toKB(srcBytes)} KB`);
  console.log(`WebP:      ${toKB(webpBytes)} KB`);
  console.log(`Savings:   ${toKB(totalSavings)} KB (${totalSavingsPercent.toFixed(1)}%)`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
