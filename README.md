# gibwork-mcp-gateway

**Enterprise MCP Control Plane for Gibwork.**

Policy engine · Budgets · Audit logging · Safe multi-agent access.

The missing backend layer between AI agents and the official Gibwork MCP/SDK. Built for easy acquisition and integration.

## Why it exists

| Gap in official stack | What the Gateway adds |
|-----------------------|------------------------|
| No action policy | Declarative allow/deny rules |
| No spend limits | Daily budgets |
| No audit trail | Append-only JSONL audit log |
| Single-user focus | Safe defaults for agent fleets / CI |
| No pre-flight check | `check` command with exit codes |

## Quick Start

```bash
git clone https://github.com/mrphatom/gibwork-mcp-gateway.git
cd gibwork-mcp-gateway
npm install && npm run build

# Scaffold a policy
npx tsx src/cli.ts init

# Diagnostics
npx tsx src/cli.ts doctor
npx tsx src/cli.ts doctor --json

# List actions & check policy
npx tsx src/cli.ts actions
npx tsx src/cli.ts check --action tasks.create --amount 25
npx tsx src/cli.ts check --action submissions.approve --json

# Status & audit
npx tsx src/cli.ts status --json
npx tsx src/cli.ts audit
```

## Commands

| Command | Purpose |
|---------|--------|
| `doctor` | Config + policy health (`--json`) |
| `init` | Scaffold a safe-by-default policy |
| `actions` | List supported policy actions |
| `policy` | Dump active policy JSON |
| `check` | Pre-flight allow/deny + budget (`--json`) |
| `status` | Current day budgets (`--json`) |
| `audit` | Recent audit events (`--json`) |

## Architecture

```
AI Agent / CI / Custom Tool
          │
          ▼
   gibwork-mcp-gateway     ← policy + budget + audit
          │
          ▼
  Official @gibwork/mcp  or  @gibwork/sdk
```

Does **not** replace the official MCP. Adds the control plane enterprises need.

## License

MIT
