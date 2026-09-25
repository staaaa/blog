const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetDir = path.resolve(__dirname, '../public/maplibre');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const workerSrc = path.resolve(__dirname, '../node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs');
const sharedSrc = path.resolve(__dirname, '../node_modules/maplibre-gl/dist/maplibre-gl-shared.mjs');

if (fs.existsSync(workerSrc)) {
  // Bundle worker into standalone .js (no external imports)
  const esbuildBin = path.resolve(__dirname, '../node_modules/.bin/esbuild');
  const outFile = path.join(targetDir, 'maplibre-gl-worker.bundle.js');
  
  console.log('Bundling MapLibre worker into standalone JS...');
  execSync(`"${esbuildBin}" "${workerSrc}" --bundle --format=esm --outfile="${outFile}"`, { stdio: 'inherit' });
  
  // Also copy as standard .js and keep .mjs
  fs.copyFileSync(outFile, path.join(targetDir, 'maplibre-gl-worker.js'));
  fs.copyFileSync(workerSrc, path.join(targetDir, 'maplibre-gl-worker.mjs'));
  if (fs.existsSync(sharedSrc)) {
    fs.copyFileSync(sharedSrc, path.join(targetDir, 'maplibre-gl-shared.mjs'));
  }
  console.log('MapLibre worker files prepared successfully.');
}
