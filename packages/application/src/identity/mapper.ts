// @ts-nocheck
import { Identity, IdentityType } from '@manaratak/domain';
import { IdentityDto } from './dtos';

export class IdentityDtoMapper {
  public static toDto(identity: Identity): IdentityDto {
    const dto: IdentityDto = {
      id: identity.id.toString(),
      type: identity.type,
      status: identity.status,
      account: {
        accessState: identity.account.accessState,
        storageQuotaBytes: identity.account.storageQuotaBytes,
        rateLimitMax: identity.account.rateLimitMax,
        rateLimitWindowMs: identity.account.rateLimitWindowMs,
        configurationFlags: identity.account.configurationFlags
      },
      technicalMetadata: identity.technicalMetadata as any|identity.technicalMetadata as any|identity.technicalMetadata as any|identity.technicalMetadata as any.props
    };

    if (identity.type === IdentityType.Human && identity.user) {
      dto.user = {
        profile: {
          displayName: identity.user.profile.displayName,
          avatarUrl: identity.user.profile.avatarUrl,
          preferredLanguage: identity.user.profile.preferredLanguage,
          timeZone: identity.user.profile.timeZone
        },
        contactRegistry: {
          primaryEmail: identity.user.contactRegistry.primaryEmail,
          isEmailVerified: identity.user.contactRegistry.isEmailVerified,
          primaryPhone: identity.user.contactRegistry.primaryPhone,
          isPhoneVerified: identity.user.contactRegistry.isPhoneVerified,
          alternativeContacts: identity.user.contactRegistry.alternativeContacts
        }
      };
    }

    return dto;
  }
}
