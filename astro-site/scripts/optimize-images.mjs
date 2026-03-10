import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const projectRoot = process.cwd();
const imagesRoot = path.join(projectRoot, 'public', 'img');

function parseArgs(argv) {
  const options = {
    dryRun: false,
    quality: 78,
    maxWidth: 1920,
    minSavingsPercent: 8,
  };

  for (const arg of argv) {
    if (arg === '--dry-run') options.dryRun = true;
    if (arg.startsWith('--quality=')) options.quality = Number(arg.split('=')[1]);
    if (arg.startsWith('--max-width=')) options.maxWidth = Number(arg.split('=')[1]);
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

function isOptimizableImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!(ext === '.jpg' || ext === '.jpeg' || ext === '.png')) return false;
  if (filePath.includes(`${path.sep}backup_originali${path.sep}`)) return false;
  return true;
}

function buildPipeline(buffer, metadata, filePath, options) {
  const ext = path.extname(filePath).toLowerCase();
  // Normalize EXIF orientation so output pixels are always physically upright.
  let pipeline = sharp(buffer, { failOn: 'none', sequentialRead: true }).rotate();

  if (metadata.width && metadata.width > options.maxWidth) {
    pipeline = pipeline.resize({ width: options.maxWidth, withoutEnlargement: true });
  }

  if (ext === '.png') {
    return pipeline.png({ compressionLevel: 9, palette: true, effort: 10 });
  }

  return pipeline.jpeg({ quality: options.quality, mozjpeg: true, progressive: true });
}

function toKB(bytes) {
  return (bytes / 1024).toFixed(1);
}

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function run() {
  const options = parseArgs(process.argv.slice(2));

  const allFiles = await walk(imagesRoot);
  const targets = allFiles.filter(isOptimizableImage);

  const backupRoot = path.join(projectRoot, '.image-backups', nowStamp());

  let processed = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;
  let bytesBefore = 0;
  let bytesAfter = 0;

  console.log(`Found ${targets.length} JPG/PNG files in public/img`);
  console.log(`Mode: ${options.dryRun ? 'DRY-RUN' : 'WRITE'}`);

  for (const filePath of targets) {
    processed += 1;

    try {
      const originalBuffer = await fs.readFile(filePath);
      const originalBytes = originalBuffer.length;
      bytesBefore += originalBytes;

      const image = sharp(originalBuffer, { failOn: 'none' });
      const metadata = await image.metadata();

      const optimizedBuffer = await buildPipeline(originalBuffer, metadata, filePath, options).toBuffer();

      const optimizedBytes = optimizedBuffer.length;
      const savingsPercent = ((originalBytes - optimizedBytes) / originalBytes) * 100;
      const shouldWrite = optimizedBytes < originalBytes && savingsPercent >= options.minSavingsPercent;

      if (!shouldWrite) {
        skipped += 1;
        bytesAfter += originalBytes;
        continue;
      }

      updated += 1;
      bytesAfter += optimizedBytes;

      if (!options.dryRun) {
        const relative = path.relative(projectRoot, filePath);
        const backupPath = path.join(backupRoot, relative);
        await ensureDir(path.dirname(backupPath));
        await fs.copyFile(filePath, backupPath);
        await fs.writeFile(filePath, optimizedBuffer);
      }

      const rel = path.relative(projectRoot, filePath);
      console.log(`- ${rel}: ${toKB(originalBytes)} KB -> ${toKB(optimizedBytes)} KB (${savingsPercent.toFixed(1)}%)`);
    } catch (error) {
      failed += 1;
      console.error(`! Failed ${filePath}: ${error.message}`);
    }
  }

  const totalSavingsBytes = bytesBefore - bytesAfter;
  const totalSavingsPercent = bytesBefore > 0 ? (totalSavingsBytes / bytesBefore) * 100 : 0;

  console.log('');
  console.log('Summary');
  console.log(`Processed: ${processed}`);
  console.log(`Updated:   ${updated}`);
  console.log(`Skipped:   ${skipped}`);
  console.log(`Failed:    ${failed}`);
  console.log(`Before:    ${toKB(bytesBefore)} KB`);
  console.log(`After:     ${toKB(bytesAfter)} KB`);
  console.log(`Savings:   ${toKB(totalSavingsBytes)} KB (${totalSavingsPercent.toFixed(1)}%)`);
  if (!options.dryRun && updated > 0) {
    console.log(`Backups:   ${path.relative(projectRoot, backupRoot)}`);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
