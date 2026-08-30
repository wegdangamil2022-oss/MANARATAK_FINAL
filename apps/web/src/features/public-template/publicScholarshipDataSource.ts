import { ApiClient, type PublicScholarshipDto } from '../../api/client';
import type { DegreeLevel, Scholarship } from './types';

export type PublicTemplateDataMode = 'prototype' | 'api';
export type PublicScholarshipDataStatus = 'prototype' | 'loading' | 'ready' | 'unavailable';

const DEGREE_LEVELS: Array<Exclude<DegreeLevel, 'all'>> = [
  'بكالوريوس',
  'ماجستير',
  'دكتوراه',
  'دورات تدريبية',
  'زمالة أبحاث',
];

export function resolvePublicTemplateDataMode(value: unknown): PublicTemplateDataMode {
  return value === 'api' ? 'api' : 'prototype';
}

function toTextList(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value.map((item) => item.trim()).filter(Boolean);
  if (!value) return [];
  return value
    .split(/[,،;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeDegreeLevels(value: string): Array<Exclude<DegreeLevel, 'all'>> {
  const normalized = value.toLowerCase();
  return DEGREE_LEVELS.filter((level) => {
    if (normalized.includes(level.toLowerCase())) return true;
    if (level === 'بكالوريوس') return /bachelor|undergraduate/.test(normalized);
    if (level === 'ماجستير') return /master|postgraduate/.test(normalized);
    if (level === 'دكتوراه') return /doctor|phd/.test(normalized);
    if (level === 'زمالة أبحاث') return /fellowship|research/.test(normalized);
    return /course|training/.test(normalized);
  });
}

function daysUntil(deadline: string | null | undefined, now: Date): number {
  if (!deadline) return 0;
  const value = new Date(deadline);
  if (Number.isNaN(value.getTime())) return 0;
  return Math.max(0, Math.ceil((value.getTime() - now.getTime()) / 86_400_000));
}

export function mapPublicScholarshipDto(dto: PublicScholarshipDto, now = new Date()): Scholarship {
  const universities = toTextList(dto.targetUniversities);
  const fields = toTextList(dto.eligibleMajorsOrFields);
  const deadline = dto.applicationDeadline ?? '';
  const deadlineDate = deadline ? new Date(deadline) : null;
  const isClosed =
    deadlineDate !== null && !Number.isNaN(deadlineDate.getTime()) && deadlineDate < now;

  return {
    id: dto.publicId,
    title: dto.displayName,
    titleEn: dto.canonicalName,
    country: dto.studyCountry ?? '',
    countryEn: dto.studyCountry ?? '',
    countryFlag: '',
    university: universities[0] ?? dto.sponsorName ?? '',
    universityEn: universities[0] ?? dto.sponsorName ?? '',
    degreeLevel: normalizeDegreeLevels(dto.degreeLevel),
    fundingType: dto.fundingCoverage,
    financialCoverage: toTextList(dto.coverageDetails),
    deadline,
    daysLeft: daysUntil(deadline, now),
    featured: false,
    tag: 'منحة منشورة',
    imageUrl: '',
    field: fields.join('، '),
    requirements: toTextList(dto.eligibilityCriteria),
    description: dto.coverageDetails || dto.eligibilityCriteria || '',
    applicationUrl: dto.applicationLink ?? dto.officialSourceUrl ?? '',
    withoutIelts: false,
    status: isClosed ? 'مغلقة' : 'مفتوحة الآن',
    participatingUniversities: universities.map((name, index) => ({
      id: `${dto.publicId}:university:${index}`,
      name,
      nameEn: name,
    })),
  };
}

/** Reads the published Phase 12 projection without a prototype-data fallback. */
export async function loadPublishedScholarships(): Promise<Scholarship[]> {
  const result = await ApiClient.getScholarships({ page: 1, pageSize: 100 });
  return result.data.map((item) => mapPublicScholarshipDto(item));
}
