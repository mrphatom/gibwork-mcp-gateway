import fs from 'fs';
import YAML from 'yaml';
import { PolicySchema, type Policy, type Action } from './types.js';
import { config } from './config.js';

export function loadPolicy(file = config.policyFile): Policy {
  if (!fs.existsSync(file)) {
    return PolicySchema.parse({
      name: 'safe-default',
      description: 'Deny write actions; allow read-only',
      defaultEffect: 'deny',
      rules: [
        { action: 'tasks.list', effect: 'allow' },
        { action: 'tasks.get', effect: 'allow' },
        { action: 'submissions.list', effect: 'allow' },
        { action: 'wallet.read', effect: 'allow' },
      ],
      budgets: {
        dailySpendLimit: config.dailySpendLimit,
        maxTasksPerDay: config.maxTasksPerDay,
        maxSubmissionsPerDay: config.maxSubmissionsPerDay,
      },
    });
  }
  const raw = fs.readFileSync(file, 'utf-8');
  const data = file.endsWith('.json') ? JSON.parse(raw) : YAML.parse(raw);
  return PolicySchema.parse(data);
}

export interface Decision {
  allowed: boolean;
  reason: string;
  matchedRule?: string;
}

export function evaluate(
  policy: Policy,
  action: Action,
  ctx: { amount?: number; tags?: string[]; environment?: string } = {}
): Decision {
  const env = ctx.environment || config.gibworkEnvironment;

  for (const rule of policy.rules) {
    const actionMatch = rule.action === '*' || rule.action === action;
    if (!actionMatch) continue;

    if (rule.conditions?.environment && !rule.conditions.environment.includes(env as any)) continue;
    if (rule.conditions?.maxAmount != null && ctx.amount != null && ctx.amount > rule.conditions.maxAmount) {
      return {
        allowed: false,
        reason: `Amount ${ctx.amount} exceeds rule maxAmount ${rule.conditions.maxAmount}`,
        matchedRule: `${rule.action}:${rule.effect}`,
      };
    }
    if (rule.conditions?.tags && ctx.tags) {
      const ok = rule.conditions.tags.some(t => ctx.tags!.map(x => x.toLowerCase()).includes(t.toLowerCase()));
      if (!ok) continue;
    }

    return {
      allowed: rule.effect === 'allow',
      reason: rule.effect === 'allow' ? 'Matched allow rule' : 'Matched deny rule',
      matchedRule: `${rule.action}:${rule.effect}`,
    };
  }

  return {
    allowed: policy.defaultEffect === 'allow',
    reason: `Fell through to defaultEffect=${policy.defaultEffect}`,
  };
}
