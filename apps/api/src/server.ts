import { createApiApp } from './app.js';
import { container } from './infrastructure/di/container.js';
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

  // P6 source closure: runtime scheduling is explicit and opt-in. The worker
  // consumes only P13 CourseCompleted/LearningPathCompleted outbox records and
  // delivers them through the P14 idempotent issuance inbox boundary.
  if (process.env.CERTIFICATE_COMPLETION_WORKER_ENABLED === 'true') {
    const intervalMs = Math.max(1_000, Number(process.env.CERTIFICATE_COMPLETION_WORKER_INTERVAL_MS ?? 5_000));
    const worker = container.resolve<any>('certificateCompletionOutboxWorker');
    const workerId = `certificate-completion-${process.pid}`;
    let running = false;
    const tick = async () => {
      if (running) return;
      running = true;
      try {
        await worker.runOnce(workerId);
      } catch {
        console.error('[Certificates] Completion worker iteration failed. Review restricted service logs.');
      } finally {
        running = false;
      }
    };
    void tick();
    const timer = setInterval(() => { void tick(); }, intervalMs);
    timer.unref?.();
    server.on('close', () => clearInterval(timer));
  }
}

bootstrap().catch(() => {
  console.error('[Bootstrap] Fatal error during API startup. Review restricted service logs.');
  process.exit(1);
});
