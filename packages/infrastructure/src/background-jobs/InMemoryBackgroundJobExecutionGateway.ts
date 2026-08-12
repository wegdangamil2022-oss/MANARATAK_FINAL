import { IBackgroundJobExecutionGateway } from '@manaratak/application';

export class InMemoryBackgroundJobExecutionGateway implements IBackgroundJobExecutionGateway {
  private readonly enqueued: { jobReference: string; payload: any; priority: number }[] = [];
  private readonly scheduledJobs = new Map<string, Date>();

  public async schedule(jobReference: string, runAt: Date): Promise<void> {
    this.scheduledJobs.set(jobReference, runAt);
  }

  public async enqueue(jobReference: string, payload: any, priority: number): Promise<void> {
    this.enqueued.push({ jobReference, payload, priority });
  }

  public async cancel(jobReference: string): Promise<void> {
    this.scheduledJobs.delete(jobReference);
    const index = this.enqueued.findIndex(j => j.jobReference === jobReference);
    if (index !== -1) {
      this.enqueued.splice(index, 1);
    }
  }

  public getEnqueued() {
    return [...this.enqueued];
  }

  public getScheduled() {
    return new Map(this.scheduledJobs);
  }

  public clear(): void {
    this.enqueued.length = 0;
    this.scheduledJobs.clear();
  }
}
