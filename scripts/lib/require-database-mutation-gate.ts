export function requireDatabaseMutationGate(operation: string): void {
  const recoveryGateClosed = process.env.WP1_RECOVERY_GATE === 'CLOSED';
  const mutationsAllowed = process.env.ALLOW_DATABASE_MUTATIONS === 'YES';

  if (!recoveryGateClosed || !mutationsAllowed) {
    throw new Error(
      `DATABASE_MUTATION_BLOCKED: ${operation} requires ` +
      'WP1_RECOVERY_GATE=CLOSED and ALLOW_DATABASE_MUTATIONS=YES'
    );
  }
}
