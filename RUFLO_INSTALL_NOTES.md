# Ruflo install notes — what we learned wiring it in (2026-06-19)

Quick notes for future sessions / future Tohid so you don't repeat the dead-ends.

## Version reality

| Source | Version |
|---|---|
| Initial brief | "3.7.0-alpha+" (out of date) |
| `npm view ruflo dist-tags.latest` (2026-06-19) | **3.12.4** |
| `npm view ruflo dist-tags.alpha`                | 3.12.4 (same — alpha and latest are pinned together) |
| Published by | `ruvnet` (verified author on github.com/ruvnet) |
| License | MIT |
| Unpacked size | 10.3 MB |
| Transitive deps | 442+ packages (heavy: better-sqlite3, OpenTelemetry, AgentDB, agentic-flow, metaharness WASM) |

Always pin a major + minor in CI (`ruflo@3.12.x`) so a breaking alpha doesn't ship overnight.

## Install cost

A cold-cache `npm install ruflo` takes ~60–90 seconds on a fast connection
(Tohid's Windows box) and pulls ~440 packages. Inside our 45-second bash
sandbox the install gets killed mid-flight, which is why you'll see
`Cannot find module '@claude-flow/cli/dist/src/suggest.js'` errors if you try
to run `node node_modules/ruflo/bin/ruflo.js` on a partial install — that's
the symptom of an incomplete extraction, not a bug in the package.

**Mitigation in CI/sandboxes:** install ruflo once into a persistent cache
volume, or use `npx -y ruflo@latest` and pre-warm the npm cache before the
test runs that need it.

## Why we don't add ruflo to `dependencies`

1. It would balloon the install size of the mnnr-complete2025 PR pipeline.
2. The 442-package transitive tree drags in native modules (better-sqlite3)
   that need rebuilding on every CI runner OS.
3. Ruflo is a **developer tool**, not a runtime dependency of the app. Vercel
   doesn't need it. Production doesn't need it. Only the dev's machine + the
   `scripts/` cron host need it.

We `npx -y ruflo@latest` in `package.json` scripts so devs don't have to think
about install, and they can override with a global install (`npm i -g ruflo`)
for speed if they use it daily.

## Claude Code wiring verification

Tested on the sandbox (claude-code 2.1.181):

```
$ claude mcp add ruflo --scope user -- npx -y ruflo@latest mcp start
Added stdio MCP server ruflo with command: npx -y ruflo@latest mcp start to user config

$ claude mcp list
ruflo: npx -y ruflo@latest mcp start - ✘ Failed to connect
```

The "Failed to connect" is the cold-cache install issue from above — on
Tohid's Windows machine, run `npx -y ruflo@latest --version` once first to
warm the cache, then `claude mcp list` will show `✓ Connected`.

## Claude Desktop wiring (Tohid does this manually)

Settings → Capabilities → MCP servers → Add stdio server:
- Command: `npx`
- Args: `["-y", "ruflo@latest", "mcp", "start"]`

Per the integration brief constraint, this session did **not** touch
Claude Desktop's MCP config. Tohid: do it once, restart Claude Desktop,
the 313 ruflo tools will show up under the MCP tool prefix.

## What was committed in the integration PR

- `RUFLO_INTEGRATION.md` — overview, invocations, wiring guide
- `RUFLO_FIRST_SWARM_SPEC.md` — first hive-mind we plan to spawn
- `RUFLO_INSTALL_NOTES.md` — this file
- `package.json` — adds 5 `ruflo:*` scripts (no deps changed)
- `.gitignore` — adds `.ruflo/cache/`, `.ruflo/logs/`, `.ruflo/runs/`, `.ruflo/state.db*`, `.claude-flow/`, `claude-flow.log`

Nothing else was touched. No swarms were spawned. No secrets committed.
