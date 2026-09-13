# gibwork-mcp-gateway

**Enterprise MCP Control Plane for Gibwork.**

Policy engine · Budgets · Audit logging · Safe multi-agent access.

This is the missing backend layer between AI agents and the official Gibwork MCP/SDK. Designed for easy acquisition and integration.

## Why it exists

| Gap in official stack | What the Gateway adds |
|-----------------------|------------------------|
| No action policy | Declarative allow/deny rules |
| No spend limits | Daily budgets |
| No audit trail | Append-only JSONL audit log |
| Single-user focus | Safe defaults for agent fleets / CI |
| No pre-flight check | `check` command |

## Quick Start

```bash
git clone https://github.com/mrphatom/gibwork-mcp-gateway.git
cd gibwork-mcp-gateway
npm install && npm run build
npx tsx src/cli.ts doctor
npx tsx src/cli.ts check --action tasks.create --amount 25
npx tsx src/cli.ts audit
```

## Architecture

```
AI Agent / CI
      │
      ▼
gibwork-mcp-gateway   ← policy + budget + audit
      │
      ▼
Official @gibwork/mcp or @gibwork/sdk
```

Does not replace the official MCP — adds the control plane enterprises need.

## License

MIT
