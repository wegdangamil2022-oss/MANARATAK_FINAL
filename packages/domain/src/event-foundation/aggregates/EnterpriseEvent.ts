import { EnterpriseEventId } from '../value-objects/EnterpriseEventId';
import { EventReference } from '../value-objects/EventReference';
import { EventOwnerReference } from '../value-objects/EventOwnerReference';
import { EventDefinition } from '../value-objects/EventDefinition';
import { EventPayloadMetadata } from '../value-objects/EventPayloadMetadata';
import { EventVersion } from '../value-objects/EventVersion';
import { EventMetadata } from '../value-objects/EventMetadata';
import { EventCorrelationReference } from '../value-objects/EventCorrelationReference';
import { EventCausationReference } from '../value-objects/EventCausationReference';
import { EventLifecycleState } from '../enums/EventLifecycleState';
import { EnterpriseEventCreatedEvent } from '../events/EnterpriseEventCreatedEvent';
import { EnterpriseEventRegisteredEvent } from '../events/EnterpriseEventRegisteredEvent';
import { EnterpriseEventPublishedEvent } from '../events/EnterpriseEventPublishedEvent';
import { EnterpriseEventArchivedEvent } from '../events/EnterpriseEventArchivedEvent';

export class EnterpriseEvent {
  private _domainEvents: any[] = [];
  private _lifecycleState: EventLifecycleState;

  private constructor(
    private readonly id: EnterpriseEventId,
    private readonly reference: EventReference,
    private readonly ownerReference: EventOwnerReference,
    private readonly definition: EventDefinition,
    private readonly payloadMetadata: EventPayloadMetadata,
    private readonly version: EventVersion,
    private readonly metadata: EventMetadata,
    private readonly correlationReference?: EventCorrelationReference,
    private readonly causationReference?: EventCausationReference
  ) {
    this._lifecycleState = EventLifecycleState.CREATED;
  }

  public static create(
    reference: EventReference,
    ownerReference: EventOwnerReference,
    definition: EventDefinition,
    payloadMetadata: EventPayloadMetadata,
    version: EventVersion,
    metadata: EventMetadata,
    correlationReference?: EventCorrelationReference,
    causationReference?: EventCausationReference
  ): EnterpriseEvent {
    const event = new EnterpriseEvent(
      EnterpriseEventId.generate(),
      reference,
      ownerReference,
      definition,
      payloadMetadata,
      version,
      metadata,
      correlationReference,
      causationReference
    );
    event.addDomainEvent(new EnterpriseEventCreatedEvent(reference));
    return event;
  }

  public register(): void {
    if (this._lifecycleState !== EventLifecycleState.CREATED) {
      throw new Error(`Cannot register event from state ${this._lifecycleState}`);
    }
    this._lifecycleState = EventLifecycleState.REGISTERED;
    this.addDomainEvent(new EnterpriseEventRegisteredEvent(this.reference));
  }

  public markAsPublished(): void {
    if (this._lifecycleState !== EventLifecycleState.REGISTERED) {
      throw new Error(`Cannot publish event from state ${this._lifecycleState}`);
    }
    this._lifecycleState = EventLifecycleState.PUBLISHED;
    this.addDomainEvent(new EnterpriseEventPublishedEvent(this.reference));
  }

  public archive(): void {
    if (this._lifecycleState === EventLifecycleState.ARCHIVED) {
      return;
    }
    this._lifecycleState = EventLifecycleState.ARCHIVED;
    this.addDomainEvent(new EnterpriseEventArchivedEvent(this.reference));
  }

  // Getters
  public getId(): EnterpriseEventId { return this.id; }
  public getReference(): EventReference { return this.reference; }
  public getOwnerReference(): EventOwnerReference { return this.ownerReference; }
  public getDefinition(): EventDefinition { return this.definition; }
  public getPayloadMetadata(): EventPayloadMetadata { return this.payloadMetadata; }
  public getVersion(): EventVersion { return this.version; }
  public getMetadata(): EventMetadata { return this.metadata; }
  public getCorrelationReference(): EventCorrelationReference | undefined { return this.correlationReference; }
  public getCausationReference(): EventCausationReference | undefined { return this.causationReference; }
  public getLifecycleState(): EventLifecycleState { return this._lifecycleState; }

  // Event handling
  public getDomainEvents(): any[] {
    return [...this._domainEvents];
  }

  public clearDomainEvents(): void {
    this._domainEvents = [];
  }

  private addDomainEvent(event: any): void {
    this._domainEvents.push(event);
  }
}
