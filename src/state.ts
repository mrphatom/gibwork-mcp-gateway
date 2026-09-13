import fs from 'fs';
import path from 'path';
import { config } from './config.js';
import type { GatewayState } from './types.js';

const FILE = 'gateway-state.json';

function dayKey() {
  return new Date().toISOString().slice(0, 10);
}

function ensure() {
  if (!fs.existsSync(config.stateDir)) fs.mkdirSync(config.stateDir, { recursive: true });
}

export function loadState(): GatewayState {
  ensure();
  const p = path.join(config.stateDir, FILE);
  const today = dayKey();
  if (!fs.existsSync(p)) {
    return { dayKey: today, spendToday: 0, tasksCreatedToday: 0, submissionsToday: 0, lastResetAt: new Date().toISOString() };
  }
  const s = JSON.parse(fs.readFileSync(p, 'utf-8')) as GatewayState;
  if (s.dayKey !== today) {
    return { dayKey: today, spendToday: 0, tasksCreatedToday: 0, submissionsToday: 0, lastResetAt: new Date().toISOString() };
  }
  return s;
}

export function saveState(state: GatewayState) {
  ensure();
  fs.writeFileSync(path.join(config.stateDir, FILE), JSON.stringify(state, null, 2));
}

export function checkBudgets(policyBudgets?: { dailySpendLimit?: number; maxTasksPerDay?: number; maxSubmissionsPerDay?: number }) {
  const state = loadState();
  const spendLimit = policyBudgets?.dailySpendLimit ?? config.dailySpendLimit;
  const taskLimit = policyBudgets?.maxTasksPerDay ?? config.maxTasksPerDay;
  const subLimit = policyBudgets?.maxSubmissionsPerDay ?? config.maxSubmissionsPerDay;
  return {
    state,
    ok: state.spendToday <= spendLimit && state.tasksCreatedToday <= taskLimit && state.submissionsToday <= subLimit,
    spendLimit,
    taskLimit,
    subLimit,
  };
}

export function recordSpend(amount: number) {
  const s = loadState();
  s.spendToday += amount;
  saveState(s);
}

export function recordTaskCreated() {
  const s = loadState();
  s.tasksCreatedToday += 1;
  saveState(s);
}

export function recordSubmission() {
  const s = loadState();
  s.submissionsToday += 1;
  saveState(s);
}
