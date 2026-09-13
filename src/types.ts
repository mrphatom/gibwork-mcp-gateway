import { z } from 'zod';

export const ActionSchema = z.enum([
  'tasks.list', 'tasks.get', 'tasks.create', 'tasks.update', 'tasks.refund',
  'submissions.create', 'submissions.list', 'submissions.approve', 'submissions.reject', 'submissions.comment',
  'wallet.read', 'proof.run', 'proof.submit',
]);

export type Action = z.infer<typeof ActionSchema>;

export const PolicyRuleSchema = z.object({
  action: ActionSchema.or(z.literal('*')),
  effect: z.enum(['allow', 'deny']),
  conditions: z.object({
    maxAmount: z.number().optional(),
    tags: z.array(z.string()).optional(),
    environment: z.array(z.enum(['stage', 'production'])).optional(),
  }).optional(),
});

export const PolicySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  defaultEffect: z.enum(['allow', 'deny']).default('deny'),
  rules: z.array(PolicyRuleSchema),
  budgets: z.object({
    dailySpendLimit: z.number().optional(),
    maxTasksPerDay: z.number().optional(),
    maxSubmissionsPerDay: z.number().optional(),
  }).optional(),
});

export type Policy = z.infer<typeof PolicySchema>;
export type PolicyRule = z.infer<typeof PolicyRuleSchema>;

export interface AuditEvent {
  id: string;
  ts: string;
  action: string;
  effect: 'allow' | 'deny' | 'executed' | 'error';
  actor?: string;
  taskId?: string;
  amount?: number;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface GatewayState {
  dayKey: string;
  spendToday: number;
  tasksCreatedToday: number;
  submissionsToday: number;
  lastResetAt: string;
}
