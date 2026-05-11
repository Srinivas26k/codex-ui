# Codex UI Product Plan

> Note: This baseline plan is now complemented by the competitive roadmap in `docs/thorx-competitive-oss-roadmap.md`. Use that roadmap as the execution source of truth for feature scope and phased commits.

## Objective
Build a non-technical, local-first Codex desktop product where users can:
- Create and orchestrate AI agents via forms (no prompt engineering needed).
- Attach tools and MCP servers with guided setup.
- Run everything on local machines using Ollama/Hugging Face/local or remote providers.
- Package and distribute as a cross-platform desktop app.

## Why this approach (leverage existing Codex)
This fork already contains critical runtime components that we should reuse:
- `codex-rs/app-server` for UI-facing JSON-RPC session/thread/turn APIs.
- `codex-rs/codex-mcp` for MCP integrations.
- `codex-rs/ollama` for local model provider support.
- `codex-rs/model-provider` for provider abstraction and capabilities.
- `sdk/typescript` for Node-hosted UX integrations.
- `sdk/python` for automation, scripting, and backend assistants.

Do not rebuild agent orchestration from scratch. Build product UX and workflow layers on top of these primitives.

## SDK-first decision
Use the existing SDKs by default:
- Desktop host/runtime code should use `@openai/codex-sdk` where Node process execution is available.
- Local automation and workflow workers can use `sdk/python`.
- UI web layer should remain a presentation layer and communicate through a local host bridge.

Continue with the existing phased plan, but replace any "build protocol client from scratch" scope with "wrap existing SDK/app-server APIs behind ThorX adapters".

## License and Compliance Baseline
Upstream license is Apache-2.0.

Required actions for your redistributed product:
- Keep `LICENSE` and relevant notices.
- Preserve upstream attributions and `NOTICE` handling.
- Mark files you modify with clear change intent in commit history/headers where needed.
- Avoid using OpenAI trademarks in product naming/branding in a way that implies official endorsement.

## Product Architecture

### 1) Runtime layers
- **Engine layer (existing):** `codex-rs/*` crates (threads, turns, tools, providers, MCP).
- **Integration layer (new):** UI adapter service that maps product concepts (Agent Template, Workflow, Tool Bundle) to app-server operations.
- **UI layer (new):** guided form-first app for non-technical users.
- **Desktop shell (new):** Tauri for lightweight cross-platform distribution.

### 2) Client/Server boundary
Use `codex app-server` as the authoritative backend protocol.
- UI connects over local transport (`stdio` via Tauri command bridge, or local websocket/unix socket).
- UI sends:
  - `initialize`
  - `thread/start`, `turn/start`, `turn/steer`, `turn/interrupt`
  - `mcpServerStatus/list`, `mcpServer/tool/call`, `config/mcpServer/reload`
  - model/provider read APIs
- UI subscribes to notifications for streaming output and tool progress.

### 3) Data model (product-facing)
Create simple product entities stored in local app data (SQLite):
- `AgentTemplate`
  - name, role, goals, behavior mode, selected model/provider, safety level.
- `ToolBundle`
  - selected MCP servers, builtin tools, permission profile.
- `Workflow`
  - trigger (manual/scheduled/file-change), steps, handoff rules.
- `ExecutionProfile`
  - local-only, mixed, cloud-enabled policies.

Map these entities to Codex thread and turn settings at runtime.

## Non-Technical UX (core requirement)

### A) Agent creation wizard
A 7-step form flow:
1. Agent identity (name, purpose, language tone).
2. What should this agent do? (checkbox task intents).
3. Data/tool access (files, shell, web, MCP servers).
4. Model/provider choice (recommended defaults + advanced expand).
5. Safety and approvals (Never/Ask/Strict explained in plain language).
6. Test run sandbox (simulate one task).
7. Save and deploy locally.

### B) Orchestration builder
- Visual workflow editor (node list first, graph view optional).
- "When X then Y" templates:
  - "When file added, summarize and tag"
  - "Every morning, generate report"
  - "When issue created, propose implementation plan"
- One-click "Run now" and "Schedule".

### C) MCP setup UX
- "Connect Tool" screen with presets:
  - Filesystem
  - GitHub
  - Browser automation
  - Custom MCP endpoint
- Per-tool permission prompts in plain language.
- Health check and sample tool call test button.

### D) Local model UX
- Auto-detect Ollama install and running daemon.
- Model discovery/list with "Recommended" tags.
- Hugging Face endpoint and token setup wizard.
- Fallback strategy if a selected local model is unavailable.

## Technical Plan by Phase

## Phase 0 - Foundation (Week 1)
- Create new workspace packages:
  - `apps/desktop` (Tauri shell)
  - `apps/ui` (React + TypeScript + Vite)
  - `packages/protocol-client` (typed app-server client)
  - `packages/domain` (agent/workflow/tool schemas)
- Generate TypeScript protocol bindings using app-server schema tools.
- Implement local dev bootstrap script (single command).

Deliverable:
- Desktop window launches and can call `initialize` against local app-server.

## Phase 1 - Core chat/session shell (Weeks 2-3)
- Thread list, create, resume.
- Streaming chat view with turn events and tool events.
- Basic provider selector (read from provider APIs).
- Session persistence and crash recovery.

Deliverable:
- A working non-CLI conversation UI using existing engine.

## Phase 2 - Agent builder (Weeks 4-5)
- Agent wizard + templates.
- Save agent definitions to local DB.
- "Run Agent" maps template + execution profile -> `thread/start` + `turn/start` payloads.
- Add guardrails for invalid provider/tool combinations.

Deliverable:
- Non-technical users can create and run agents without writing prompts.

## Phase 3 - MCP and tools management (Weeks 6-7)
- MCP server catalog UI.
- Add/remove/reload MCP config.
- Tool invocation logs and errors in plain language.
- Permission profile editor with safe defaults.

Deliverable:
- User can connect tools with guided setup and validate tool health.

## Phase 4 - Orchestration (Weeks 8-9)
- Workflow builder and scheduler.
- Multi-agent handoff rules.
- Run history, retry, and failure notifications.
- Local queue worker in desktop app process.

Deliverable:
- End-to-end orchestration from forms, fully local.

## Phase 5 - Distribution and hardening (Weeks 10-12)
- CI release matrix:
  - macOS (arm64/x64)
  - Windows (x64)
  - Linux (AppImage + deb)
- Code signing, auto-updates, installer polish.
- Telemetry opt-in and privacy controls.
- Performance + memory profiling for long-running sessions.

Deliverable:
- Production installers and update channels.

## Provider Strategy (Local-first)
Default order:
1. Ollama local model.
2. HF local/endpoint model.
3. Optional remote provider fallback (user opt-in only).

Selection policy:
- If local model is healthy, keep execution local.
- If local model unavailable and fallback enabled, route to selected remote provider.
- Show transparent run location in UI: "Local" or "Remote".

## Security Model
- Secrets in OS keychain (`keyring-store` patterns).
- Workspace trust prompts before shell/file/network actions.
- Principle of least privilege for tools and MCP servers.
- Signed binaries and update manifests.

## Distribution Plan
Use Tauri for lean binary size and native shell integration.

Artifacts:
- Windows: MSI
- macOS: DMG/PKG
- Linux: AppImage + DEB

Release channels:
- `stable`
- `beta`
- `nightly`

## Engineering Backlog (first 30 tickets)

### Platform
1. Create `apps/ui` scaffold and design token system.
2. Create `apps/desktop` Tauri shell.
3. Add typed app-server protocol client package.
4. Add robust reconnect and heartbeat handling.
5. Add local SQLite store for product entities.

### Agent UX
6. Agent wizard step 1-2.
7. Agent wizard step 3-4.
8. Agent wizard step 5-7.
9. Agent template CRUD.
10. "Run Agent" action mapping.

### MCP/tools
11. MCP server list and detail panel.
12. MCP add server flow.
13. MCP auth/login flow support.
14. MCP tool test runner.
15. Tool permission profile editor.

### Providers
16. Provider capability read and display.
17. Ollama health probe.
18. HF config flow.
19. Local-first routing policy.
20. Runtime provider failover and retry UI.

### Orchestration
21. Workflow data model.
22. Workflow form builder (v1 list mode).
23. Trigger scheduler service.
24. Execution run timeline.
25. Retry and dead-letter handling.

### Release
26. Desktop packaging pipeline.
27. Platform signing pipeline.
28. Auto-update integration.
29. E2E smoke tests across OS targets.
30. OSS attribution and license compliance script.

## Acceptance Criteria
- A non-technical user can create an agent in under 5 minutes.
- Agent can run fully local with Ollama and a selected MCP tool.
- Workflow can orchestrate at least 2 agents with one handoff.
- Installers exist for macOS, Windows, Linux.
- License/notice obligations are included in distributed builds.

## Risks and Mitigations
- Protocol changes upstream: pin protocol version + generated client regeneration in CI.
- Local model variability: add provider health checks and clear fallback messages.
- MCP complexity for non-tech users: ship curated presets and one-click diagnostics.
- Cross-platform process differences: run OS-specific E2E smoke tests on every release candidate.

## Immediate Next 5 Actions
1. Scaffold `apps/ui`, `apps/desktop`, and protocol client package.
2. Implement `initialize`, `thread/start`, `turn/start` from the new UI.
3. Add simple Agent Wizard MVP (name, task, model, tools).
4. Integrate Ollama detection and model listing.
5. Build first signed beta installers for internal testing.
