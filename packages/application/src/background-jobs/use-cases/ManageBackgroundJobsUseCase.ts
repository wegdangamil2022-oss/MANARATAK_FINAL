import {
  BackgroundJob,
  BackgroundJobId,
  JobReference,
  JobOwnerReference,
  JobDefinition,
  JobParameters,
  JobPriority,
  JobScheduleMetadata,
  JobExecutionPolicy,
  JobRetryPolicy,
  JobMetadata,
  IBackgroundJobRepository,
  BackgroundJobSpecification
} from '@manaratak/domain';
import { IBackgroundJobExecutionGateway } from '../gateways/IBackgroundJobExecutionGateway';
import {
  EnqueueJobDto,
  CancelJobDto,
  GetJobStatusDto,
  StartJobDto,
  CompleteJobDto,
  FailJobDto
} from '../dtos/BackgroundJobsDtos';

export class ManageBackgroundJobsUseCase {
  constructor(
    private readonly jobRepository: IBackgroundJobRepository,
    private readonly executionGateway: IBackgroundJobExecutionGateway
  ) {}

  public async enqueueJob(dto: EnqueueJobDto): Promise<string> {
    const id = BackgroundJobId.generate();
    const reference = JobReference.generate();
    const definition = JobDefinition.create(dto.jobType);
    const parameters = JobParameters.create(dto.parameters);

    const ownerReference = dto.ownerReference ? JobOwnerReference.from(dto.ownerReference) : undefined;
    const priority = JobPriority.create(dto.priority || 0);

    let schedule: JobScheduleMetadata;
    if (dto.cronExpression) {
      schedule = JobScheduleMetadata.recurring(dto.cronExpression);
    } else if (dto.runAt) {
      schedule = JobScheduleMetadata.scheduled(new Date(dto.runAt));
    } else {
      schedule = JobScheduleMetadata.immediate();
    }

    const executionPolicy = JobExecutionPolicy.create(dto.timeoutSeconds, dto.concurrentLimits);
    const retryPolicy = JobRetryPolicy.create(dto.maxAttempts, dto.backoffType);
    const metadata = JobMetadata.create(priority, schedule, executionPolicy, retryPolicy);

    const job = BackgroundJob.create(id, reference, definition, parameters, metadata, ownerReference);
    await this.jobRepository.save(job);

    const runAt = schedule.getRunAt();
    if (runAt && runAt.getTime() > Date.now()) {
      job.schedule();
      await this.jobRepository.save(job);
      await this.executionGateway.schedule(reference.getValue(), runAt);
    } else {
      await this.executionGateway.enqueue(reference.getValue(), dto.parameters, priority.getLevel());
    }

    return reference.getValue();
  }

  public async cancelJob(dto: CancelJobDto): Promise<void> {
    const spec = BackgroundJobSpecification.byReference(JobReference.from(dto.jobReference));
    const jobs = await this.jobRepository.findBy(spec);
    
    if (jobs.length === 0) {
      throw new Error('Job not found');
    }

    const job = jobs[0];
    job.cancel();
    await this.jobRepository.save(job);
    await this.executionGateway.cancel(job.getReference().getValue());
  }

  public async getJobStatus(dto: GetJobStatusDto): Promise<string> {
    const spec = BackgroundJobSpecification.byReference(JobReference.from(dto.jobReference));
    const jobs = await this.jobRepository.findBy(spec);

    if (jobs.length === 0) {
      throw new Error('Job not found');
    }

    return jobs[0].getStatus();
  }

  public async markJobStarted(dto: StartJobDto): Promise<void> {
    const spec = BackgroundJobSpecification.byReference(JobReference.from(dto.jobReference));
    const jobs = await this.jobRepository.findBy(spec);

    if (jobs.length > 0) {
      const job = jobs[0];
      job.start();
      await this.jobRepository.save(job);
    }
  }

  public async markJobCompleted(dto: CompleteJobDto): Promise<void> {
    const spec = BackgroundJobSpecification.byReference(JobReference.from(dto.jobReference));
    const jobs = await this.jobRepository.findBy(spec);

    if (jobs.length > 0) {
      const job = jobs[0];
      job.complete();
      await this.jobRepository.save(job);
    }
  }

  public async markJobFailed(dto: FailJobDto): Promise<void> {
    const spec = BackgroundJobSpecification.byReference(JobReference.from(dto.jobReference));
    const jobs = await this.jobRepository.findBy(spec);

    if (jobs.length > 0) {
      const job = jobs[0];
      job.fail(dto.reason);
      await this.jobRepository.save(job);
    }
  }
}
