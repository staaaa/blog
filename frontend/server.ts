import { CommonEngine } from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import bootstrap from './src/main.server';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, 'index.server.html');

const app = express();
const commonEngine = new CommonEngine({
  allowedHosts: [
    'giercujemy.pl',
    'www.giercujemy.pl',
    'giercujemy-staa.duckdns.org',
    'localhost',
    '127.0.0.1'
  ]
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
    setHeaders: (res, path) => {
      if (path.endsWith('.mjs')) {
        res.setHeader('Content-Type', 'text/javascript');
      }
      if (path.endsWith('.geojson')) {
        res.setHeader('Content-Type', 'application/json');
      }
    },
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  const { protocol, originalUrl, headers } = req;

  commonEngine
    .render({
      bootstrap,
      documentFilePath: indexHtml,
      url: `${protocol}://${headers.host}${originalUrl}`,
      publicPath: browserDistFolder,
    })
    .then((html) => res.send(html))
    .catch((err) => {
      console.error('SSR error, serving client-side fallback:', err);
      res.sendFile(indexHtml);
    });
});

const port = process.env['PORT'] || 4000;
app.listen(port, () => {
  console.log(`Angular SSR server listening on http://localhost:${port}`);
});

export default app;
