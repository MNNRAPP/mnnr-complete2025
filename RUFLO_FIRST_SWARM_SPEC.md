# Ruflo First Swarm Spec — Court-Ruling Auto-Ingest Loop

**Drafted:** 2026-06-19 alongside the ruflo integration PR.
**Status:** Spec only. Do **not** spawn this swarm until Tohid greenlights.

This document specifies the **first** production hive-mind we plan to run after
ruflo is wired in. It is intentionally chosen for the easiest possible "loop
worth automating" profile:

| Criterion | Court-ruling auto-ingest |
|---|---|
| Happens repeatedly | Yes — court orders + opposing-counsel e-service PDFs land in `siliconhillspr@gmail.com` near-daily |
| Has a rule-decidable done-state | Yes — PDF saved to canonical `OneDrive\2026\{case}\receipts\` + entry appended to `MASTER_DEADLINE_LEDGER.md` + Google Calendar event created |
| Each pass is bounded in cost | Yes — at most a few Gmail reads + one OCR + one calendar write per ruling |
| Tolerates a wasted run | Yes — read-only on Gmail, idempotent writes on disk + calendar (dedupe by Tx# / docket #) |
| AI has the data + tools | Yes — Gmail MCP + `pdftotext` / `tesseract` + Google Calendar MCP + filesystem write |
| Self-improvement signal exists | Yes — extraction accuracy can be scored against Tohid's corrections to the ledger entry; SONA learns better regex / parsing prompts |

This is the "12 out of 12" candidate from the earlier loop-audit subagent.
Standing rule [`feedback_always_pull_court_rulings`] already commits to doing
this work manually; ruflo just makes it always-on.

---

## Hive-mind structure

```
Queen (orchestrator)
├── Worker 1 — gmail-watcher        (Gmail MCP, polls every 15 min)
├── Worker 2 — attachment-downloader (Gmail MCP + filesystem write)
├── Worker 3 — pdf-extractor         (pdftotext, OCR fallback via tesseract)
├── Worker 4 — deadline-extractor    (regex + Claude reasoning on extracted text)
├── Worker 5 — calendar-writer       (Google Calendar MCP, 7/3/1-day reminders)
├── Worker 6 — ledger-appender       (filesystem append + idempotency check)
└── Worker 7 — summary-writer        (writes a per-ruling note to agent memory)
```

The queen does the gating: a ruling is only marked "processed" when all 7
workers report success. Failures route back to the queen, which retries the
failing worker once with a different model tier (Haiku → Sonnet) before paging
Tohid via siliconhillspr.

---

## Worker contracts

### Worker 1 — `gmail-watcher`

**Trigger:** Cron (every 15 min during 06:00–22:00 PT) OR push from Gmail MCP
watch endpoint when configured.

**Reads:** Gmail label `Inbox` + label `LegalEService` + label `LASC`. Filter:
unread, `has:attachment`, `filename:pdf`, sender in court-counsel domain
allowlist (lasc.org, fmglaw.com, mslt.com, zelllaw.com, etc.).

**Emits:** List of `{thread_id, message_id, attachment_filename, sender_domain,
subject_line}` tuples to the queen's scratchpad.

**Idempotency:** A thread_id already present in `OneDrive\2026\_ruflo_state\seen_threads.txt`
is skipped.

### Worker 2 — `attachment-downloader`

**Reads:** Each tuple from Worker 1.

**Writes:** PDF to `OneDrive\2026\{case_number_extracted_from_subject_or_sender}\receipts\YYYYMMDD_{case}_{type}_E_FILING_RECEIPT.pdf`
per [`reference_storage_and_protocols.md`] naming convention.

**Emits:** `{local_path, case_number, original_filename}` tuples.

**Edge case:** Subject line doesn't contain a case number → quarantine the PDF
to `OneDrive\2026\_INBOX_TRIAGE\` and emit a "needs_human" event to the queen.

### Worker 3 — `pdf-extractor`

**Reads:** Each `{local_path}` from Worker 2.

**Pipeline:** `pdftotext -layout` → if output < 200 chars (probably scanned),
fall back to `tesseract --dpi 300 -l eng`.

**Emits:** `{local_path, plain_text}` to a shared memory blob (AgentDB).

### Worker 4 — `deadline-extractor`

**Reads:** `{plain_text}` from Worker 3.

**Model:** Sonnet (this is the only worker where reasoning quality matters
enough to default-promote off Haiku). Prompt: extract every date that triggers
a Tohid obligation — hearing dates, response deadlines, discovery cutoffs,
trial dates. Apply CCP §12a if the order specifies a service-add-on
(e.g. "5 court days from service" → add 5 court days, account for weekends and
LASC holidays).

**Emits:** Structured JSON: `[{trigger: "MSJ opposition", date_due: "2026-07-15", source_quote: "...", case: "24STCV04538"}]`.

### Worker 5 — `calendar-writer`

**Reads:** Each deadline from Worker 4.

**Writes:** Google Calendar event on `siliconhillspr@gmail.com`'s calendar
named `Tohid — Litigation Deadlines`. Reminders at 7 / 3 / 1 days before.
Event description = `source_quote` + link to the local PDF path.

**Idempotency:** Dedupe by `{case, trigger, date_due}` tuple hash.

### Worker 6 — `ledger-appender`

**Reads:** Each deadline from Worker 4.

**Writes:** Append a row to `F:\AGENT_RESOURCES\MASTER_DEADLINE_LEDGER.md`.
Format: `| YYYY-MM-DD | CASE | TRIGGER | SOURCE_PDF_PATH | STATUS |`.

**Idempotency:** Skip if the same `{case, trigger, date_due}` tuple already
appears in the ledger.

### Worker 7 — `summary-writer`

**Reads:** The full set of deadlines + the original PDF text.

**Writes:** A markdown note at
`C:\Users\pusse\AppData\Roaming\Claude\local-agent-mode-sessions\…\agent\memory\rulings_inbox\YYYYMMDD_{case}_{type}_summary.md`
with: substance (3–5 bullets), deadlines extracted, defense-counsel spin (if any)
vs. what the order actually says, and a one-line "what Tohid needs to decide"
prompt. This is what Tohid actually reads in the morning.

---

## Cost ceiling

Per ruling, expected:
- Worker 1: ~$0.00 (Gmail MCP read)
- Worker 2: ~$0.00 (file write)
- Worker 3: ~$0.00 (local pdftotext/tesseract)
- Worker 4: ~$0.02 (Sonnet, ~3K tokens in + ~500 out)
- Worker 5: ~$0.00 (Google Calendar MCP)
- Worker 6: ~$0.00 (file append)
- Worker 7: ~$0.005 (Haiku, ~2K tokens in + ~800 out)

**Per-ruling total:** ~$0.025. At a peak of 5 rulings/day, monthly bill is
under $4.00 even before SONA optimizes Worker 4's model selection downward.

---

## Greenlight gating

Per the standing "DO NOT trigger any ruflo swarm spawns yet" constraint, this
spec is **drafting only**. Before spawning, Tohid will:

1. Approve the spec (this document).
2. Approve the Gmail MCP scopes ruflo requests (read attachments, list threads).
3. Approve the Google Calendar MCP scope ruflo requests (events.write).
4. Confirm the canonical paths above are still current.
5. Pick a model-tier ceiling for Worker 4 (Sonnet is default; Opus available).

After greenlight, spawn with:

```bash
npm run ruflo:swarm -- "Court-ruling auto-ingest loop — see RUFLO_FIRST_SWARM_SPEC.md" \
  --topology hive-mind \
  --queen-model sonnet \
  --worker-model-default haiku \
  --worker-model-override "deadline-extractor=sonnet" \
  --cron "*/15 6-22 * * *" \
  --idempotency-key court-ruling-ingest-v1
```

---

## Reasonable next swarms after this one

Listed in order of expected value, smallest-blast-radius first. Each gets its
own spec document when we reach it.

1. **Dependabot PR triage swarm** — when GitHub Dependabot opens a PR on
   mnnr-complete2025, swarm reads the changelog, runs `npm test`, runs Playwright
   smoke, posts a thumbs-up/thumbs-down review with the test diff inline.
2. **mnnr.app broken-link auditor** — weekly cron, crawl
   takeyourpower.org + properprose.diy + mnnr.app + oursly.diy, file a single
   PR per site with link fixes.
3. **Stripe Payment Link drift detector** — daily cron, diff the live Stripe
   catalog against `reference_stripe_live_payment_links.md`, open a PR if the
   reference is stale.
4. **OneDrive case-folder janitor** — nightly, find duplicate PDFs in
   `OneDrive\2026\*\receipts\`, dedupe by SHA-256, write a janitor log.
5. **LASC docket surge swarm** — for each active case, pull the public docket
   nightly, diff against the previous pull, alert on new entries within 1 hour
   of court posting them.

