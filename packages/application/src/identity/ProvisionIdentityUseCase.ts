// @ts-nocheck
import { UseCase, Result, ResultFactory } from '@manaratak/core';
import { 
  Identity, 
  IdentityType, 
  User, 
  Profile, 
  ContactRegistry, 
  TechnicalMetadata, 
  IIdentityRepository,
  IdentityValidationService 
} from '@manaratak/domain';
import { ProvisionIdentityInput, IdentityDto } from './dtos';
import { IdentityDtoMapper } from './mapper';

export class ProvisionIdentityUseCase implements UseCase<ProvisionIdentityInput, Result<IdentityDto>> {
  private validationService: IdentityValidationService;

  constructor(private readonly identityRepository: IIdentityRepository) {
    this.validationService = new IdentityValidationService(identityRepository);
  }

  public async execute(input: ProvisionIdentityInput): Promise<Result<IdentityDto>> {
    try {
      await this.validationService.validateNewIdentity(
        input.type, 
        input.primaryEmail, 
        input.primaryPhone
      );

      let user: User | null = null;
      if (input.type === IdentityType.Human) {
        const profile = new Profile({
          displayName: input.displayName || 'Unnamed User',
          avatarUrl: input.avatarUrl || '',
          preferredLanguage: input.preferredLanguage || 'en',
          timeZone: input.timeZone || 'UTC'
        });

        const contactRegistry = new ContactRegistry({
          primaryEmail: input.primaryEmail!,
          isEmailVerified: false,
          primaryPhone: input.primaryPhone,
          isPhoneVerified: false
        });

        user = new User({ profile, contactRegistry });
      }

      const technicalMetadata = new TechnicalMetadata(input.technicalMetadata || {});

      const identity = Identity.create(
        input.type,
        user,
        {
          storageQuotaBytes: 10 * 1024 * 1024 * 1024, // 10GB default
          rateLimitMax: 100,
          rateLimitWindowMs: 60000
        },
        technicalMetadata
      );

      await this.identityRepository.save(identity);

      return ResultFactory.success(IdentityDtoMapper.toDto(identity));
    } catch (error: any) {
      return ResultFactory.failure(error.message);
    }
  }
}
