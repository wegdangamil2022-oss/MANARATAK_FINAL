export interface IBackgroundJobExecutionGateway {
  schedule(jobReference: string, runAt: Date): Promise<void>;
  enqueue(jobReference: string, payload: any, priority: number): Promise<void>;
  cancel(jobReference: string): Promise<void>;
}
