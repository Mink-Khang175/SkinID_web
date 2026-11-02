import fs from 'node:fs';
import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { apiDevPlugin } from './scripts/dev/api-plugin.mjs';

function staticAssetsDevPlugin() {
  return {
    name: 'static-assets-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = (req.url || '').split('?')[0];

        // 1. Serve videos
        if (pathname.startsWith('/videos/')) {
          const relativePath = pathname.slice('/videos/'.length);
          const filePath = resolve(import.meta.dirname, 'src/assets/videos', relativePath);
          if (!fs.existsSync(filePath)) return next();
          const ext = filePath.split('.').pop().toLowerCase();
          const mimeMap = { mp4: 'video/mp4', webm: 'video/webm', ogg: 'video/ogg' };
          const mime = mimeMap[ext] || 'application/octet-stream';
          const stat = fs.statSync(filePath);
          const range = req.headers.range;
          if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
            res.writeHead(206, {
              'Content-Range': `bytes ${start}-${end}/${stat.size}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': end - start + 1,
              'Content-Type': mime,
            });
            fs.createReadStream(filePath, { start, end }).pipe(res);
          } else {
            res.writeHead(200, { 'Content-Type': mime, 'Content-Length': stat.size, 'Accept-Ranges': 'bytes' });
            fs.createReadStream(filePath).pipe(res);
          }
          return;
        }

        // 2. Serve images (supports direct paths, brand subfolders, and fallback search)
        if (pathname.startsWith('/images/')) {
          const relativePath = pathname.slice('/images/'.length);
          let filePath = resolve(import.meta.dirname, 'src/assets/images', relativePath);

          if (!fs.existsSync(filePath) && relativePath.startsWith('products/')) {
            const fileName = relativePath.slice('products/'.length);
            for (const brand of ['rilastil', 'dvah', 'twon']) {
              const candidate = resolve(import.meta.dirname, 'src/assets/images/products', brand, fileName);
              if (fs.existsSync(candidate)) {
                filePath = candidate;
                break;
              }
            }
          }

          if (!fs.existsSync(filePath)) return next();
          const ext = filePath.split('.').pop().toLowerCase();
          const mimeMap = {
            png: 'image/png',
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            avif: 'image/avif',
            webp: 'image/webp',
            svg: 'image/svg+xml',
            gif: 'image/gif'
          };
          const mime = mimeMap[ext] || 'application/octet-stream';
          const stat = fs.statSync(filePath);
          res.writeHead(200, {
            'Content-Type': mime,
            'Content-Length': stat.size,
            'Cache-Control': 'public, max-age=31536000'
          });
          fs.createReadStream(filePath).pipe(res);
          return;
        }

        return next();
      });
    }
  };
}


export default defineConfig({
  publicDir: false,
  server: {
    fs: {
      deny: ['.env', '.env.*', '**/.dev.vars*', '**/*firebase-adminsdk*.json', '**/service-account*.json', '**/credentials/**', '**/*.{crt,pem,key}', '**/.git/**']
    }
  },
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'react/jsx-dev-runtime']
  },
  plugins: [
    staticAssetsDevPlugin(),
    apiDevPlugin(),
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        { src: 'src/js', dest: '.' },
        { src: 'src/data', dest: '.' },
        // The app uses root-relative URLs such as /images/products/..., so keep
        // the deployed asset directory aligned with those URLs.
        { src: 'src/assets/images/**/*', dest: 'images', rename: { stripBase: 3 } },
        { src: 'src/assets/images/products/*/*', dest: 'images/products', rename: { stripBase: 5 } },
        { src: 'src/assets/images/banners/hero-scan-ai.jpg', dest: '.', rename: { stripBase: 4, name: 'og-image.jpg' } },
        // Video assets served at /videos/* in both dev and prod
        { src: 'src/assets/videos/*', dest: 'videos', rename: { stripBase: 3 } },
      ]
    })
  ],
  build: {
    rollupOptions: {
      input: {
        app: resolve(import.meta.dirname, 'index.html')
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@firebase/firestore')) return 'firebase-firestore';
          if (id.includes('node_modules/@firebase/auth')) return 'firebase-auth';
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) return 'firebase-core';
          return undefined;
        }
      }
    },
  }
});
