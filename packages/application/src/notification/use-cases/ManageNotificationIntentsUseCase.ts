import { INotificationIntentRepository } from '@manaratak/domain';
import { INotificationPreferenceGateway } from '@manaratak/domain';
import { NotificationIntent } from '@manaratak/domain';
import { NotificationId } from '@manaratak/domain';
import { NotificationReference } from '@manaratak/domain';
import { TemplateId } from '@manaratak/domain';
import { NotificationRecipientReference } from '@manaratak/domain';
import { TemplateVariable } from '@manaratak/domain';
import { SchedulingMetadata } from '@manaratak/domain';
import { ExpirationMetadata } from '@manaratak/domain';
import { RetryMetadata } from '@manaratak/domain';
import { CreateIntentDto } from '../dtos/NotificationDtos';
import { NotificationChannel } from '@manaratak/domain'; // for preference check

export class ManageNotificationIntentsUseCase {
  constructor(
    private readonly intentRepository: INotificationIntentRepository,
    private readonly preferenceGateway: INotificationPreferenceGateway
  ) {}

  public async createIntent(dto: CreateIntentDto): Promise<void> {
    const id = NotificationId.create(dto.id);
    const reference = NotificationReference.create(dto.reference);
    const templateId = TemplateId.create(dto.templateId);
    const recipient = NotificationRecipientReference.create(dto.recipientReference);
    
    const variables = Object.entries(dto.variables).map(([k, v]) => TemplateVariable.create(k, v));
    
    const schedulingMetadata = dto.scheduledAt ? SchedulingMetadata.create(dto.scheduledAt) : undefined;
    const expirationMetadata = dto.expiresAt ? ExpirationMetadata.create(dto.expiresAt) : undefined;
    const retryMetadata = (dto.retryMaxRetries !== undefined && dto.retryBackoffMs !== undefined) 
      ? RetryMetadata.create(dto.retryMaxRetries, dto.retryBackoffMs) 
      : undefined;

    // Default generic channel for preference check (In a real app, this would be derived from the intent/template constraints)
    const defaultChannel = NotificationChannel.create('ANY');
    const optedOut = await this.preferenceGateway.hasOptedOut(recipient, defaultChannel);

    if (optedOut) {
      // Create and immediately cancel or just don't create? The domain might say create and cancel.
      const intent = NotificationIntent.create(
        id, reference, templateId, recipient, variables, schedulingMetadata, expirationMetadata, retryMetadata
      );
      intent.cancel();
      await this.intentRepository.save(intent);
      return;
    }

    const intent = NotificationIntent.create(
      id, reference, templateId, recipient, variables, schedulingMetadata, expirationMetadata, retryMetadata
    );

    await this.intentRepository.save(intent);
  }
}
