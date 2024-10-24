import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    svgr(),
    react()
  ],
  server: {
    port: 3000,
    proxy: {
      '/api/': {
        target: 'http://localhost:8004',  // Your local WordPress URL
        changeOrigin: true,
        secure: false
      }
    }
  }
});
