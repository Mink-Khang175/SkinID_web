import { cp, mkdir, rm, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const outputDirectory = resolve(projectRoot, 'dist');
const publishEntries = [
  'index.html',
  'skin-analysis.html',
  'profile.html',
  'CNAME',
  'src',
  'public'
];

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

for (const entry of publishEntries) {
  await cp(resolve(projectRoot, entry), resolve(outputDirectory, entry), {
    recursive: true,
    force: true
  });
}

for (const file of [
  'index.html',
  'skin-analysis.html',
  'profile.html',
  'src/js/app/bootstrap.js',
  'src/data/products.js'
]) {
  try {
    await stat(resolve(outputDirectory, file));
  } catch {
    throw new Error(`Missing publish file: ${file}`);
  }
}
