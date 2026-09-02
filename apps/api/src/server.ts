import { createApiApp } from './app.js';
import { ConfigurationRegistry, EnvironmentLoader, EnvironmentConfigurationProvider, ZodEnvironmentValidator } from '@manaratak/config';

async function bootstrap() {
  const envProvider = new EnvironmentConfigurationProvider();
  const loader = new EnvironmentLoader([envProvider]);
  const config = await ConfigurationRegistry.bootstrap(loader, new ZodEnvironmentValidator());

  const app = await createApiApp();
  const rawPort = config.getOptional<string | number>('PORT');
  const PORT = rawPort ? Number(rawPort) : 3000;

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Bootstrap] Server successfully started on port ${PORT}`);
  });
  server.requestTimeout = 30_000;
  server.headersTimeout = 15_000;
  server.keepAliveTimeout = 5_000;
}

bootstrap().catch(() => {
  console.error('[Bootstrap] Fatal error during API startup. Review restricted service logs.');
  process.exit(1);
});
