import { createApiApp } from './app.js';
import { ConfigurationRegistry, EnvironmentLoader, EnvironmentConfigurationProvider, ZodEnvironmentValidator } from '@manaratak/config';

async function bootstrap() {
  const envProvider = new EnvironmentConfigurationProvider();
  const loader = new EnvironmentLoader([envProvider]);
  const config = await ConfigurationRegistry.bootstrap(loader, new ZodEnvironmentValidator());

  const app = await createApiApp();
  const rawPort = config.getOptional<string | number>('PORT');
  const PORT = rawPort ? Number(rawPort) : 3000;

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Bootstrap] Server successfully started on port ${PORT}`);
  });
}

bootstrap().catch(err => {
  console.error('[Bootstrap] Fatal error during API startup', err);
  process.exit(1);
});

