export interface SearchFilterDto {
  field: string;
  operator: string;
  value: any;
}

export interface SearchCriteriaDto {
  query?: string;
  filters?: SearchFilterDto[];
  logicalOperator?: string;
}

export interface SearchPaginationDto {
  page: number;
  limit: number;
}

export interface SearchSortingDto {
  field: string;
  direction: string;
}

export interface SearchRequestDto {
  scope: string;
  criteria: SearchCriteriaDto;
  pagination: SearchPaginationDto;
  sorting?: SearchSortingDto;
}

export interface SearchTargetReferenceDto {
  entityNamespace: string;
  resourceKey: string;
}

export interface SearchMatchDto {
  target: SearchTargetReferenceDto;
  score: number;
  payload: Record<string, any>;
}

export interface SearchResultDto {
  requestId: string;
  reference: string;
  matches: SearchMatchDto[];
  totalCount: number;
  executionTimeMs: number;
}
