#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { config, doctorReport } from './config.js';
import { loadPolicy, evaluate } from './policy.js';
import { appendAudit, readRecent } from './audit.js';
import { checkBudgets, loadState } from './state.js';
import type { Action } from './types.js';

const program = new Command();

program
  .name('gibwork-gateway')
  .description('Enterprise MCP Control Plane for Gibwork')
  .version('1.0.0');

program
  .command('doctor')
  .description('Diagnose gateway configuration and policy')
  .action(() => {
    console.log(chalk.bold.blue('\nGibwork MCP Gateway — Doctor\n'));
    doctorReport().forEach(l => console.log('  ' + l));
    try {
      const p = loadPolicy();
      console.log(chalk.green(`\n  Policy loaded : ${p.name} (${p.rules.length} rules)`));
      console.log(`  Default effect: ${p.defaultEffect}`);
    } catch (e: any) {
      console.log(chalk.red(`\n  Policy error  : ${e.message}`));
    }
    console.log();
  });

program
  .command('policy')
  .description('Show the active policy')
  .option('--file <path>', 'Policy file override')
  .action((opts) => {
    console.log(JSON.stringify(loadPolicy(opts.file), null, 2));
  });

program
  .command('check')
  .description('Evaluate whether an action is allowed under the policy')
  .requiredOption('--action <action>', 'Action name (e.g. tasks.create)')
  .option('--amount <n>', 'Amount involved', parseFloat)
  .option('--tags <tags>', 'Comma-separated tags')
  .action((opts) => {
    const policy = loadPolicy();
    const decision = evaluate(policy, opts.action as Action, {
      amount: opts.amount,
      tags: opts.tags ? opts.tags.split(',').map((t: string) => t.trim()) : undefined,
    });
    const budget = checkBudgets(policy.budgets);

    console.log(chalk.bold.blue('\nPolicy Check\n'));
    console.log(`Action   : ${opts.action}`);
    console.log(`Allowed  : ${decision.allowed ? chalk.green('yes') : chalk.red('no')}`);
    console.log(`Reason   : ${decision.reason}`);
    if (decision.matchedRule) console.log(`Rule     : ${decision.matchedRule}`);
    console.log(`\nBudgets  : spend=${budget.state.spendToday}/${budget.spendLimit}  tasks=${budget.state.tasksCreatedToday}/${budget.taskLimit}  subs=${budget.state.submissionsToday}/${budget.subLimit}`);
    console.log(`Budget OK: ${budget.ok ? chalk.green('yes') : chalk.red('no')}`);

    appendAudit({
      action: opts.action,
      effect: decision.allowed && budget.ok ? 'allow' : 'deny',
      amount: opts.amount,
      reason: decision.reason,
    });

    process.exit(decision.allowed && budget.ok ? 0 : 1);
  });

program
  .command('audit')
  .description('Show recent audit events')
  .option('--limit <n>', 'Max events', '30')
  .action((opts) => {
    const events = readRecent(Number(opts.limit));
    console.log(chalk.bold.blue('\nAudit Log\n'));
    if (!events.length) {
      console.log('  (empty)');
      return;
    }
    events.forEach(e => {
      const mark = e.effect === 'allow' || e.effect === 'executed' ? chalk.green(e.effect) : chalk.red(e.effect);
      console.log(`  ${e.ts}  ${mark}  ${e.action}  ${e.reason || ''}`);
    });
    console.log();
  });

program
  .command('status')
  .description('Show gateway state and budgets')
  .action(() => {
    const state = loadState();
    const policy = loadPolicy();
    const budget = checkBudgets(policy.budgets);
    console.log(chalk.bold.blue('\nGateway Status\n'));
    console.log(`Day              : ${state.dayKey}`);
    console.log(`Spend today      : ${state.spendToday} / ${budget.spendLimit}`);
    console.log(`Tasks created    : ${state.tasksCreatedToday} / ${budget.taskLimit}`);
    console.log(`Submissions      : ${state.submissionsToday} / ${budget.subLimit}`);
    console.log(`Policy           : ${policy.name}`);
    console.log(`Environment      : ${config.gibworkEnvironment}`);
    console.log(`Dry-run          : ${config.dryRun}`);
    console.log();
  });

program.parse();
