import { IMetrics } from './IMetrics';
import { HealthCheckResult, IHealthIndicator } from './HealthStatus';

export interface IMonitoringProvider {
  getMetrics(): IMetrics;
  getLiveness(): Promise<HealthCheckResult>;
  getReadiness(): Promise<HealthCheckResult>;
  checkHealth(): Promise<HealthCheckResult>;
  registerIndicator(indicator: IHealthIndicator): void;
}
