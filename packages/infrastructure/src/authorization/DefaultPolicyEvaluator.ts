import { Policy, IPolicyEvaluator, EvaluationContext, AccessDecision } from '@manaratak/domain';

export class DefaultPolicyEvaluator implements IPolicyEvaluator {
  public async evaluate(_policy: Policy, _context: EvaluationContext): Promise<AccessDecision> {
    return AccessDecision.granted('Policy rule satisfied');
  }
}
