# Ruflo Integration — Agent Orchestration for mnnr-complete2025

**Status:** Wired in 2026-06-19 on branch `chore/ruflo-integration-20260619`.
**Version verified:** `ruflo@3.12.4` (npm `dist-tags.latest`, MIT, published by `ruvnet`).
**Upstream:** https://github.com/ruvnet/claude-flow

---

## What ruflo is

Ruflo is the npm-published enterprise distribution of the open-source `claude-flow`
project. It is an agent-orchestration framework that sits between Claude (Sonnet,
Haiku, Opus) and a long-running development workflow. Three things matter for us:

1. **Hierarchical "hive-mind" swarms.** A queen agent decomposes a task and spawns
   role-specialized workers (architect, coder, tester, reviewer, security-auditor,
   release-coordinator, etc.). The workers run in parallel, share state via a
   vector-memory store (AgentDB), and re-converge through the queen.
2. **SONA persistent learning.** Outcomes of each swarm run are written back to
   AgentDB. A Thompson-sampling router learns which model tier (Haiku / Sonnet /
   Opus) maximizes reward for each task class, so cost-per-task trends down while
   completion-rate trends up across runs.
3. **MCP-native.** Ruflo speaks Model Context Protocol both ways: it exposes its
   313 tools as an MCP server (so Claude Code / Claude Desktop can drive it as a
   tool surface), AND it consumes MCP servers (so swarm workers can call any MCP
   tool the host has registered).

It is heavy software — installing it pulls AgentDB (better-sqlite3 native), the
agentic-flow runtime, several OpenTelemetry exporters, and the metaharness WASM
kernel. We do **not** add ruflo to `dependencies`; we shell out to `npx -y ruflo@latest`
so the install lives in the npm cache, not in our `node_modules`.

---

## Why this matters for mnnr-complete2025

Three pain points ruflo addresses for this codebase:

| Pain point | Today | With ruflo |
|---|---|---|
| Cross-cutting features (DB migration + API route + UI + test + analytics in one PR) require manually steering Claude through every file | A single Claude session juggles 8+ contexts, drifts | A swarm spawns one agent per file domain, queen reconciles |
| Repetitive maintenance loops (dep upgrades, schema drift checks, broken-link audits) eat a real-Claude session every time | Manual, sporadic | Schedule a swarm to run on cron, file PRs when it finds drift |
| Court-ruling auto-ingest loop (see [`RUFLO_FIRST_SWARM_SPEC.md`](./RUFLO_FIRST_SWARM_SPEC.md)) is a perfect "AI has the data + tools" candidate but currently runs as ad-hoc subagent spawns | Each ruling triggers a separate one-off prompt | One always-on swarm watches the inbox, writes to disk + ledger + calendar |

---

## Common invocations

All scripts are wired in `package.json`. You can also call ruflo directly via
`npx -y ruflo@latest <subcommand>`.

```bash
# One-shot specialized agent (the simplest building block)
npm run ruflo:agent -- -t coder --name api-key-rotation-worker \
  --task "Rotate the Stripe restricted key in src/lib/stripe.ts \
          and add a 14-day expiry warning to the Sentry breadcrumb."

# Multi-agent hive-mind for a feature
npm run ruflo:swarm -- "Implement Stripe subscription tier 'studio' \
  in mnnr-app: schema migration, /api/checkout route, /pricing UI section, \
  Playwright e2e covering checkout + cancel, PostHog event 'subscription_upgraded'."
# → Spawns architect → coder × N (one per file class) → tester → reviewer → security-auditor
# → Queen reconciles, opens a single PR.

# List all agent types ruflo knows about
npx -y ruflo@latest agent list

# Start ruflo as an MCP server for Claude Code / Claude Desktop
npm run ruflo:mcp
# (Backgrounded by the MCP client; see "Wiring into Claude Code" below.)
```

---

## Wiring into Claude Code (CLI)

Tohid: run this **once** on the Windows machine where you use `claude` from the
terminal. It registers ruflo as an MCP server in your user config so every Claude
Code session — in any directory — can call ruflo's 313 tools.

```bash
# 1. Make sure ruflo is reachable (cold-cache install of ~440 packages; takes ~60s)
npx -y ruflo@latest --version
# Expected: ruflo v3.12.4 (or later)

# 2. Register as a user-scope MCP server (--scope user = available everywhere)
claude mcp add ruflo --scope user -- npx -y ruflo@latest mcp start

# 3. Confirm
claude mcp list
# Expected line:
#   ruflo: npx -y ruflo@latest mcp start - ✓ Connected
```

If the health check shows `✘ Failed to connect` immediately after registration,
that's usually the cold-cache npm install taking longer than the health timeout.
Run `npx -y ruflo@latest --version` once interactively to warm the cache, then
`claude mcp list` again.

---

## Wiring into Claude Desktop (alternative, GUI)

Tohid handles this step himself (Settings → Capabilities → MCP servers). The
server entry should be:

- **Name:** `ruflo`
- **Type:** `stdio`
- **Command:** `npx`
- **Args:** `["-y", "ruflo@latest", "mcp", "start"]`

Note for Claude Desktop on Windows: if `npx` is not on the PATH the GUI process
inherits, point the command at the full path
(`C:\Program Files\nodejs\npx.cmd`) and keep the args identical.

---

## Wiring as a Claude Code plugin (third option, marketplace)

The upstream repo publishes a plugin manifest. Inside any Claude Code session:

```
/plugin marketplace add ruvnet/ruflo
/plugin install ruflo
```

This is functionally equivalent to the `claude mcp add` path; pick whichever
you'd rather manage from.

---

## Local files & .gitignore

`ruflo init` (run **once** per repo on dev machines, NOT in CI) creates:

```
.ruflo/
├── config.json          # committed if you want — small, declarative
├── state.db             # SQLite vector memory — gitignored
├── cache/               # model-response cache — gitignored
├── logs/                # per-swarm logs — gitignored
└── runs/                # per-swarm artifacts — gitignored
```

`.gitignore` has been updated. Run `npm run ruflo:init` after pulling this branch
to materialize `.ruflo/config.json` for your local stack — pick swarm defaults
(parallelism, model-tier ceiling, telemetry on/off) and commit the result if you
want the team on the same defaults.

---

## Cost & safety notes

- Ruflo defaults the Thompson router to **Haiku** for cheap exploration and
  promotes to **Sonnet / Opus** only when reward signal warrants. Expect first
  10–20 runs to be cost-noisy as the router calibrates.
- Swarm runs by default write to the working directory and can commit. **Always
  run swarms inside a clean git worktree or a feature branch** so output is
  reviewable as a diff.
- The MCP server exposes filesystem + shell + git tools to whatever model is
  driving it. If you register ruflo into Claude Desktop, treat any swarm
  invocation as equivalent to handing Claude direct shell access — which it
  already is when you approve a Cowork session.

---

## See also

- [`RUFLO_FIRST_SWARM_SPEC.md`](./RUFLO_FIRST_SWARM_SPEC.md) — first
  hive-mind workflow we'll spin up: the court-ruling auto-ingest loop.
- Upstream: https://github.com/ruvnet/claude-flow
- AgentDB (vector memory): https://github.com/ruvnet/agentdb
- Agentic-flow runtime: https://github.com/ruvnet/agentic-flow
