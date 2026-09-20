import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  publicDir: false,
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'react/jsx-dev-runtime']
  },
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        { src: 'src/js', dest: '.' },
        { src: 'src/data', dest: '.' },
        // The app uses root-relative URLs such as /images/products/..., so keep
        // the deployed asset directory aligned with those URLs.
        { src: 'src/assets/images/**/*', dest: 'images', rename: { stripBase: 3 } },
        { src: 'src/assets/images/banners/hero-scan-ai.jpg', dest: '.', rename: { stripBase: 4, name: 'og-image.jpg' } },
      ]
    })
  ],
  build: {
    rollupOptions: {
      input: {
        app: resolve(import.meta.dirname, 'index.html')
      }
    },
  }
});
