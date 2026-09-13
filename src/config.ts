import 'dotenv/config';
import { z } from 'zod';

const Schema = z.object({
  solanaPrivateKey: z.string().optional(),
  gibworkEnvironment: z.enum(['stage', 'production']).default('stage'),
  dryRun: z.boolean().default(true),
  policyFile: z.string().default('./policies/default.yaml'),
  auditDir: z.string().default('./audit'),
  stateDir: z.string().default('./state'),
  dailySpendLimit: z.number().default(100),
  maxTasksPerDay: z.number().default(50),
  maxSubmissionsPerDay: z.number().default(100),
  gatewayName: z.string().default('gibwork-mcp-gateway'),
  gatewayVersion: z.string().default('1.0.0'),
});

export const config = Schema.parse({
  solanaPrivateKey: process.env.SOLANA_PRIVATE_KEY || process.env.GIBWORK_PRIVATE_KEY,
  gibworkEnvironment: (process.env.GIBWORK_ENVIRONMENT as any) || 'stage',
  dryRun: process.env.DRY_RUN === 'true' || process.env.DRY_RUN === '1' || !process.env.SOLANA_PRIVATE_KEY,
  policyFile: process.env.POLICY_FILE || './policies/default.yaml',
  auditDir: process.env.AUDIT_DIR || './audit',
  stateDir: process.env.STATE_DIR || './state',
  dailySpendLimit: Number(process.env.DAILY_SPEND_LIMIT || 100),
  maxTasksPerDay: Number(process.env.MAX_TASKS_PER_DAY || 50),
  maxSubmissionsPerDay: Number(process.env.MAX_SUBMISSIONS_PER_DAY || 100),
  gatewayName: process.env.GATEWAY_NAME || 'gibwork-mcp-gateway',
  gatewayVersion: process.env.GATEWAY_VERSION || '1.0.0',
});

export function doctorReport(): string[] {
  return [
    `Gateway        : ${config.gatewayName}@${config.gatewayVersion}`,
    `Environment    : ${config.gibworkEnvironment}`,
    `Dry-run        : ${config.dryRun}`,
    `Wallet present : ${config.solanaPrivateKey ? 'yes' : 'no'}`,
    `Policy file    : ${config.policyFile}`,
    `Audit dir      : ${config.auditDir}`,
    `Daily spend    : ${config.dailySpendLimit}`,
    `Max tasks/day  : ${config.maxTasksPerDay}`,
    `Max submits/day: ${config.maxSubmissionsPerDay}`,
  ];
}
