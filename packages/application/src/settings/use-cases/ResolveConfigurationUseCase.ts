import { ConfigurationResolutionService, NamespacedKey, ResolutionOptions } from '@manaratak/domain';

export class ResolveConfigurationUseCase {
  constructor(private resolutionService: ConfigurationResolutionService) {}

  public async resolveSetting(
    keyStr: string,
    identityId?: string,
    scopeIdOrTenantId?: string,
    options?: ResolutionOptions
  ): Promise<unknown> {
    const key = new NamespacedKey(keyStr);
    return await this.resolutionService.resolve(key, identityId, scopeIdOrTenantId, options);
  }
}

