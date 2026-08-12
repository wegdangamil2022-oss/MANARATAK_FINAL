import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CareerEmployerStatus,
  CareerJobStatus,
  CareerOpportunityType,
  EmploymentType,
  ICareerRepository
} from '@manaratak/domain';
import { CareerAdminUseCases } from '../../src/career-alumni/use-cases/CareerAdminUseCases';

describe('CareerAdminUseCases', () => {
  let repository: ICareerRepository;
  let useCases: CareerAdminUseCases;

  const employer = {
    id: 'emp-1',
    publicId: 'career_emp_1',
    slug: 'tech-company',
    canonicalName: 'tech company',
    canonicalDedupKey: 'tech company|Yemen|PRIVATE_COMPANY',
    displayName: 'Tech Company',
    employerType: 'PRIVATE_COMPANY',
    country: 'Yemen',
    verificationStatus: CareerEmployerStatus.UNVERIFIED,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const job = {
    id: 'job-1',
    publicId: 'career_job_1',
    slug: 'software-engineer-tech-company',
    canonicalTitle: 'software engineer',
    canonicalDedupKey: 'software engineer|emp-1|Yemen|Sana’a|FULL_TIME',
    title: 'Software Engineer',
    opportunityType: CareerOpportunityType.JOB,
    employmentType: EmploymentType.FULL_TIME,
    jobCategory: 'Engineering',
    description: 'Build software.',
    country: 'Yemen',
    city: 'Sana’a',
    status: CareerJobStatus.READY_TO_REVIEW,
    employerId: 'emp-1',
    remoteOption: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    repository = {
      createEmployer: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'emp-1', createdAt: new Date(), updatedAt: new Date(), ...data })),
      updateEmployer: vi.fn(),
      findEmployerById: vi.fn().mockResolvedValue(employer),
      findEmployerBySlug: vi.fn(),
      findEmployerByDedupKey: vi.fn().mockResolvedValue(null),
      createJob: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'job-1', createdAt: new Date(), updatedAt: new Date(), ...data })),
      updateJob: vi.fn(),
      findJobById: vi.fn().mockResolvedValue(job),
      findJobBySlug: vi.fn(),
      findJobByDedupKey: vi.fn().mockResolvedValue(null),
      updateJobStatus: vi.fn(),
      listJobs: vi.fn(),
      listPublishedJobs: vi.fn()
    };
    useCases = new CareerAdminUseCases(repository);
  });

  it('creates recruitment employer metadata without raw logo URLs', async () => {
    const result = await useCases.createEmployer({
      displayName: 'Tech Company',
      employerType: 'PRIVATE_COMPANY',
      country: 'Yemen'
    });

    expect(result.slug).toBe('tech-company');
    expect(result.verificationStatus).toBe(CareerEmployerStatus.UNVERIFIED);
  });

  it('creates jobs in READY_TO_REVIEW state', async () => {
    const result = await useCases.createJob({
      title: 'Software Engineer',
      opportunityType: CareerOpportunityType.JOB,
      employmentType: EmploymentType.FULL_TIME,
      jobCategory: 'Engineering',
      description: 'Build software.',
      country: 'Yemen',
      employerId: 'emp-1'
    });

    expect(result.status).toBe(CareerJobStatus.READY_TO_REVIEW);
    expect(repository.createJob).toHaveBeenCalledWith(expect.objectContaining({
      canonicalDedupKey: expect.stringContaining('software engineer|emp-1|Yemen')
    }));
  });

  it('prevents publishing before READY_TO_PUBLISH', async () => {
    await expect(useCases.publish('job-1')).rejects.toThrow('READY_TO_PUBLISH');
  });
});
