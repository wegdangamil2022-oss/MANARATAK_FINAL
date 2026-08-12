import { NamespacedKey } from '../value-objects/NamespacedKey';
import { ScopeIdentifier } from '../value-objects/ScopeIdentifier';
import { ScopeLevel } from '../enums/ScopeLevel';
import { ISettingDefinitionRepository } from '../repositories/ISettingDefinitionRepository';
import { ISettingAssignmentRepository } from '../repositories/ISettingAssignmentRepository';

export interface ResolutionOptions {
  allowSecrets?: boolean;
}

export class ConfigurationResolutionService {
  constructor(
    private readonly definitionRepo?: ISettingDefinitionRepository,
    private readonly assignmentRepo?: ISettingAssignmentRepository
  ) {}

  public async resolve(
    key: NamespacedKey,
    identityId?: string,
    scopeIdOrTenantId?: string,
    options?: ResolutionOptions
  ): Promise<unknown> {
    if (!this.definitionRepo || !this.assignmentRepo) {
      return null;
    }

    const definition = await this.definitionRepo.findByKey(key);
    if (!definition) {
      return null;
    }

    const isSecret = definition.isSecret;
    if (isSecret && !options?.allowSecrets) {
      return '********';
    }

    // 1. Check Identity scope
    if (identityId && identityId.trim() !== '') {
      const identityScope = new ScopeIdentifier(ScopeLevel.IDENTITY, identityId);
      const identityAssignment = await this.assignmentRepo.findByScopeAndKey(identityScope, key);
      if (identityAssignment) {
        return identityAssignment.getCurrentVersion().value.getValue();
      }
    }

    // 2. Check Tenant/Domain scope
    if (scopeIdOrTenantId && scopeIdOrTenantId.trim() !== '') {
      const tenantScope = new ScopeIdentifier(ScopeLevel.TENANT, scopeIdOrTenantId);
      const tenantAssignment = await this.assignmentRepo.findByScopeAndKey(tenantScope, key);
      if (tenantAssignment) {
        return tenantAssignment.getCurrentVersion().value.getValue();
      }

      const domainScope = new ScopeIdentifier(ScopeLevel.DOMAIN, scopeIdOrTenantId);
      const domainAssignment = await this.assignmentRepo.findByScopeAndKey(domainScope, key);
      if (domainAssignment) {
        return domainAssignment.getCurrentVersion().value.getValue();
      }
    }

    // 3. Check Global scope
    const globalScope = new ScopeIdentifier(ScopeLevel.GLOBAL);
    const globalAssignment = await this.assignmentRepo.findByScopeAndKey(globalScope, key);
    if (globalAssignment) {
      return globalAssignment.getCurrentVersion().value.getValue();
    }

    // 4. Return default value if present
    return definition.defaultValue ?? null;
  }
}

