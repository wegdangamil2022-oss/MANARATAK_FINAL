import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function disableHmrPlugin(): Plugin {
  return {
    name: 'disable-hmr-plugin',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        if (process.env.DISABLE_HMR === 'true') {
          return html.replace(/<script type="module" src="\/@vite\/client"><\/script>/g, '');
        }
        return html;
      }
    }
  };
}

function expressApiPlugin(): Plugin {
  let cachedApp: any = null;
  return {
    name: 'express-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && (req.url === '/api' || req.url.startsWith('/api/') || req.url.startsWith('/api?'))) {
          const method = (req.method || 'GET').toUpperCase();
          const localReadOnly = process.env.VITE_LOCAL_ADMIN_READ_ONLY === 'true';
          if (localReadOnly && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
            res.statusCode = 423;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              error: 'READ_ONLY_PREVIEW',
              message: 'Database mutations are blocked in local admin preview mode.',
            }));
            return;
          }
          try {
            if (!cachedApp) {
              const apiModule = await server.ssrLoadModule(path.resolve(__dirname, '../api/src/app.ts'));
              cachedApp = await apiModule.createApiApp({ resetCache: false });
            }
            cachedApp(req, res, next);
          } catch (err) {
            cachedApp = null;
            console.error('[Vite Api Plugin Error]', err);
            next(err);
          }
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig(() => {
  const rootDir = path.resolve(__dirname, '../..');
  process.env.PRISMA_TELEMETRY_DISABLED = '1';
  console.log('DISABLE_HMR is:', process.env.DISABLE_HMR);
  return {
    root: __dirname,
    plugins: [react(), tailwindcss(), expressApiPlugin(), disableHmrPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@manaratak/application': path.resolve(rootDir, 'packages/application/src/index.ts'),
        '@manaratak/config': path.resolve(rootDir, 'packages/config/src/index.ts'),
        '@manaratak/core': path.resolve(rootDir, 'packages/core/src/index.ts'),
        '@manaratak/domain': path.resolve(rootDir, 'packages/domain/src/index.ts'),
        '@manaratak/infrastructure': path.resolve(rootDir, 'packages/infrastructure/src/index.ts'),
        '@manaratak/shared': path.resolve(rootDir, 'packages/shared/src/index.ts'),
        '@manaratak/types': path.resolve(rootDir, 'packages/types/src/index.ts'),
        '@manaratak/ui': path.resolve(rootDir, 'packages/ui/src/index.tsx'),
      },
    },
    build: { 
      sourcemap: false,
      minify: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('admin-preview')) {
              return 'admin-preview-data';
            }
          }
        }
      }
    },
    server: {
      hmr: process.env.DISABLE_HMR === 'true' ? false : { clientPort: 443 },
      port: 3000,
      host: '0.0.0.0',
      watch: {
        ignored: ['**/tmp/**', '**/*.log', '**/dist/**', '**/.prisma/**']
      }
    },
    ssr: {
      external: ['@prisma/client', 'bcrypt', 'jsonwebtoken']
    }
  };
});
