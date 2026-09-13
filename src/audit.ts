import fs from 'fs';
import path from 'path';
import { config } from './config.js';
import type { AuditEvent } from './types.js';

function ensure() {
  if (!fs.existsSync(config.auditDir)) fs.mkdirSync(config.auditDir, { recursive: true });
}

function dayFile() {
  const d = new Date().toISOString().slice(0, 10);
  return path.join(config.auditDir, `audit-${d}.jsonl`);
}

export function appendAudit(event: Omit<AuditEvent, 'id' | 'ts'> & { id?: string; ts?: string }) {
  ensure();
  const full: AuditEvent = {
    id: event.id || crypto.randomUUID(),
    ts: event.ts || new Date().toISOString(),
    ...event,
  };
  fs.appendFileSync(dayFile(), JSON.stringify(full) + '\n');
  return full;
}

export function readRecent(limit = 50): AuditEvent[] {
  ensure();
  const file = dayFile();
  if (!fs.existsSync(file)) return [];
  const lines = fs.readFileSync(file, 'utf-8').trim().split('\n').filter(Boolean);
  return lines.slice(-limit).map(l => JSON.parse(l)).reverse();
}
