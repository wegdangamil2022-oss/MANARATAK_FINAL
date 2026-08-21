import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');
const requireText = (source: string, needle: string, label: string) => {
  if (!source.includes(needle)) throw new Error(`${label}: missing ${needle}`);
};
const forbidText = (source: string, needle: string, label: string) => {
  if (source.includes(needle)) throw new Error(`${label}: forbidden ${needle}`);
};

const atomic = read('packages/application/src/scholarships/import-center/ScholarshipImportAtomicTransferUseCase.ts');
const codec = read('packages/application/src/scholarships/import-center/ScholarshipImportReviewDecisionCodec.ts');
const center = read('packages/application/src/scholarships/import-center/ScholarshipImportCenterUseCases.ts');
const contracts = read('packages/application/src/scholarships/import-center/ScholarshipImportCenterContracts.ts');
const router = read('apps/api/src/presentation/api/router/ScholarshipAdminRouter.ts');
const importRepository = read('packages/infrastructure/src/import-foundation/PrismaImportRepository.ts');

requireText(atomic, 'atomicMutations.execute', 'ATOMIC_TRANSFER');
requireText(atomic, 'repository.withTransaction(context)', 'SCHOLARSHIP_TRANSACTION');
requireText(atomic, 'this.importGateway.withTransaction(context)', 'IMPORT_TRANSACTION');
requireText(atomic, 'SCHOLARSHIP_IMPORT_REVIEW_DECISION_REQUIRED', 'EXPLICIT_MERGE_DECISION');
requireText(atomic, 'SCHOLARSHIP_IMPORT_REVIEW_DECISION_STALE', 'STALE_DECISION_GUARD');
requireText(atomic, 'SCHOLARSHIP_IMPORT_TARGET_PUBLICATION_LOCKED', 'PUBLICATION_LOCK');
requireText(atomic, 'ScholarshipStatus.IMPORTED', 'NON_PUBLISHED_CREATE');
requireText(atomic, 'sourceImportRecordId: plan.record.id', 'PROVENANCE_LINK');
requireText(atomic, 'sourceEvidence:', 'SOURCE_EVIDENCE');
requireText(atomic, 'SCHOLARSHIP_IMPORT_CANONICAL_IDENTITY_CHANGED', 'ID_STABILITY_GUARD');
requireText(codec, 'SCHOLARSHIP_IMPORT_REVIEW_DECISION_V1', 'DURABLE_REVIEW_ENVELOPE');
requireText(center, 'readScholarshipImportReviewDecision', 'READY_TO_TRANSFER_DECISION_AWARE');
requireText(contracts, 'IScholarshipImportAtomicGateway', 'ATOMIC_IMPORT_PORT');
requireText(importRepository, 'withTransaction(context: AtomicPersistenceContext)', 'PRISMA_IMPORT_TRANSACTION_BINDING');
requireText(router, 'new ScholarshipImportAtomicTransferUseCase', 'PRODUCTION_ROUTER_WIRING');
requireText(router, "router.post('/imported-records/:id/promote'", 'LEGACY_ROUTE_COMPATIBILITY');

forbidText(router, 'SCHOLARSHIP_IMPORT_TRANSFER_DEFERRED_TO_WP12_10', 'DEFERRED_422_PROMOTION_PATH');
forbidText(router, 'DOMAIN_PROMOTION_DEFERRED_TO_OWNER_PHASE', 'DEFERRED_OWNER_PROMOTION_PATH');
forbidText(atomic, "status: ScholarshipStatus.PUBLISHED", 'TRANSFER_AUTO_PUBLISH');
forbidText(atomic, "status: ScholarshipStatus.READY_TO_PUBLISH", 'TRANSFER_AUTO_READY_TO_PUBLISH');
forbidText(atomic, '@prisma/client', 'APPLICATION_DIRECT_PRISMA');
forbidText(atomic, '.university.create(', 'FAKE_CANONICAL_ENTITY_CREATION');
forbidText(atomic, '.major.create(', 'FAKE_CANONICAL_ENTITY_CREATION');
forbidText(atomic, '.internationalTest.create(', 'FAKE_CANONICAL_ENTITY_CREATION');

console.log('ATOMIC_TRANSFER_SOURCE = PASS');
console.log('DEFERRED_422_PROMOTION_PATH = REMOVED');
console.log('TRANSFER_AUTO_PUBLISH = 0');
console.log('DIRECT_APPLICATION_PRISMA = 0');
console.log('FAKE_CANONICAL_ENTITY_CREATION = 0');
