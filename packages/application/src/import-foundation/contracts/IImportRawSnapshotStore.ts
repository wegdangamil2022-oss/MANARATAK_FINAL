import type { SourceAcquisitionResult } from './ISourceConnector';
export interface StoredImportRawSnapshot { artifactId: string; rawArtifactReference: string; contentHash: string; byteSize: number; storedAt: Date; }
export interface IImportRawSnapshotStore { store(result: SourceAcquisitionResult): Promise<StoredImportRawSnapshot>; }
