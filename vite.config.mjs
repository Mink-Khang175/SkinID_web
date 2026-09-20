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
        { src: 'src/assets/images', dest: '.' },
        { src: 'src/assets/images/banners/hero-scan-ai.jpg', dest: '.', rename: 'og-image.jpg' },
        { src: 'src/assets/images/logo.png', dest: '.', rename: 'logo.png' }
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
