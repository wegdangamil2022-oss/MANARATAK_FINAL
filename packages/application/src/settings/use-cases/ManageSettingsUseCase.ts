import {
  ISettingDefinitionRepository,
  ISettingAssignmentRepository,
  ConfigurationValidationService,
  SettingDefinition,
  SettingAssignment,
  NamespacedKey,
  ScopeIdentifier,
  SettingVersion,
  StringValue,
  NumberValue,
  BooleanValue,
  JsonValue,
  ValueType,
  SettingValueData
} from '@manaratak/domain';
import { DomainEvents, IAggregateRoot } from '@manaratak/core';
import { CreateSettingDefinitionInput, AssignSettingValueInput, RollbackSettingValueInput } from '../dtos/SettingsDtos';

export class ManageSettingsUseCase {
  constructor(
    private definitionRepo: ISettingDefinitionRepository,
    private assignmentRepo: ISettingAssignmentRepository,
    private validationService: ConfigurationValidationService
  ) {}

  public async createDefinition(input: CreateSettingDefinitionInput): Promise<void> {
    const key = new NamespacedKey(input.key);
    const existing = await this.definitionRepo.findByKey(key);
    if (existing) {
      throw new Error(`Setting definition for key ${input.key} already exists.`);
    }

    const definition = new SettingDefinition({
      id: input.id,
      key,
      valueType: input.valueType,
      description: input.description,
      defaultValue: input.defaultValue,
      isFeatureFlag: input.isFeatureFlag || false,
      isDeprecated: false,
      isSecret: input.isSecret || false
    }, true);

    await this.definitionRepo.save(definition);
    DomainEvents.markAggregateForDispatch(definition as unknown as IAggregateRoot);
    DomainEvents.dispatchEventsForAggregate(definition.id);
  }

  private createValueData(type: ValueType, value: unknown): SettingValueData {
    switch (type) {
      case ValueType.String: return new StringValue(value as string);
      case ValueType.Number: return new NumberValue(value as number);
      case ValueType.Boolean: return new BooleanValue(value as boolean);
      case ValueType.Json: return new JsonValue(value as Record<string, unknown>);
      default: throw new Error(`Unsupported value type: ${type}`);
    }
  }

  public async assignValue(input: AssignSettingValueInput): Promise<void> {
    const key = new NamespacedKey(input.key);
    const definition = await this.definitionRepo.findByKey(key);
    if (!definition) {
      throw new Error(`Setting definition ${input.key} not found.`);
    }

    const scope = new ScopeIdentifier(input.level, input.scopeId);
    const valueData = this.createValueData(input.type, input.value);

    this.validationService.validate(definition, valueData);

    let assignment = await this.assignmentRepo.findByScopeAndKey(scope, key);
    if (assignment) {
      assignment.updateValue(input.versionId, valueData, input.authorId);
    } else {
      const version = new SettingVersion(input.versionId, valueData, new Date(), input.authorId);
      assignment = new SettingAssignment({
        id: input.assignmentId,
        key,
        scope,
        versions: [version]
      }, true);
    }

    await this.assignmentRepo.save(assignment);
    DomainEvents.markAggregateForDispatch(assignment as unknown as IAggregateRoot);
    DomainEvents.dispatchEventsForAggregate(assignment.id);
  }

  public async rollbackValue(input: RollbackSettingValueInput): Promise<void> {
    const assignments = await this.assignmentRepo.findBy({
      isSatisfiedBy: (a: SettingAssignment) => a.id === input.assignmentId
    });
    const assignment = assignments[0];

    if (!assignment) {
      throw new Error('Assignment not found');
    }

    assignment.rollbackTo(input.previousVersionId, input.newVersionId, input.authorId);
    await this.assignmentRepo.save(assignment);
    DomainEvents.markAggregateForDispatch(assignment as unknown as IAggregateRoot);
    DomainEvents.dispatchEventsForAggregate(assignment.id);
  }
}
