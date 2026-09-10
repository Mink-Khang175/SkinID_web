import { cp, mkdir, rm, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const outputDirectory = resolve(projectRoot, 'dist');
const excludedDirectories = new Set([
  '.git', '.openai', 'dist', 'docs', 'scripts', 'tests', 'tools', 'node_modules'
]);

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

const entries = await (await import('node:fs/promises')).readdir(projectRoot, { withFileTypes: true });
for (const entry of entries) {
  if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue;
  await cp(resolve(projectRoot, entry.name), resolve(outputDirectory, entry.name), {
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
