import { LocalizationScopeType } from '@manaratak/domain';

export interface CreateLocalizationDto {
  reference: string;
  ownerReference: string;
  locale: string;
  definition: {
    name: string;
    description: string;
  };
  translationDefinition: {
    translations: Record<string, string>;
  };
  classification: {
    scope: LocalizationScopeType;
  };
  intent: {
    goal: string;
    businessJustification: string;
  };
  metadata: Record<string, string>;
}

export interface UpdateLocalizationDto {
  definition: {
    name: string;
    description: string;
  };
  translationDefinition: {
    translations: Record<string, string>;
  };
  classification: {
    scope: LocalizationScopeType;
  };
  intent: {
    goal: string;
    businessJustification: string;
  };
}

export interface LocalizationResponseDto {
  reference: string;
  ownerReference: string;
  locale: string;
  version: string;
  lifecycleState: string;
  definition: {
    name: string;
    description: string;
  };
  translationDefinition: {
    translations: Record<string, string>;
  };
  classification: {
    scope: string;
  };
  intent: {
    goal: string;
    businessJustification: string;
  };
  metadata: Record<string, string>;
}
