import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function disableHmrPlugin(): Plugin {
  return {
    name: 'disable-hmr-plugin',
    enforce: 'post',
    transformIndexHtml(html) {
      if (process.env.DISABLE_HMR === 'true') {
        return html.replace(/<script type="module" src="\/@vite\/client"><\/script>/, '');
      }
      return html;
    }
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), disableHmrPlugin()],
  server: {
    hmr: process.env.DISABLE_HMR === 'true' ? false : { clientPort: 443 },
    port: 3001,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
