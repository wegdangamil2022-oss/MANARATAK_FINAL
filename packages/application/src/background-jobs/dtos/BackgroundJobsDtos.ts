export interface EnqueueJobDto {
  jobType: string;
  parameters: Record<string, any>;
  priority?: number;
  runAt?: string;
  cronExpression?: string;
  timeoutSeconds?: number;
  concurrentLimits?: number;
  maxAttempts?: number;
  backoffType?: string;
  ownerReference?: string;
}

export interface CancelJobDto {
  jobReference: string;
}

export interface GetJobStatusDto {
  jobReference: string;
}

export interface CompleteJobDto {
  jobReference: string;
}

export interface FailJobDto {
  jobReference: string;
  reason?: string;
}

export interface StartJobDto {
  jobReference: string;
}
