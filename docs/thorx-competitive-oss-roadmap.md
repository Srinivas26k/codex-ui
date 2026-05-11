# ThorX Competitive OSS Roadmap

## Vision
ThorX should feel like the easiest way for non-technical users to build serious local AI automation, while still being powerful enough for advanced users.

Core promise:
- Form-first AI agents (no prompt engineering required).
- Skills + MCP tools + workflows in one place.
- Local-first execution with Ollama/HF/provider flexibility.
- Cross-platform desktop distribution with a polished developer experience.

## Strategic Positioning (How we compete)

## 1) Product moat
- "No-code to pro-code" bridge:
  - non-technical users start with forms and templates.
  - advanced users can inspect/edit generated specs.
- Local-first privacy and control:
  - explicit execution location (local vs remote) for every run.
- Tool ecosystem:
  - MCP and Skills as first-class UI concepts, not hidden config.

## 2) OSS moat
- Fast onboarding and clear docs.
- Stable extension APIs for skills/connectors.
- Transparent governance and contribution pathways.
- Weekly release cadence with changelog discipline.

## North Star Features

## A) Form-level AI Agents
Agent Builder wizard outputs a machine-readable `AgentSpec`:
- identity: name, role, domain
- intent: objective, success criteria
- capabilities: skills/tools/MCP access
- model policy: local-first + fallback rules
- safety policy: approvals + permissions profile
- memory policy: short-term + long-term vector memory settings

## B) Skills System
- Skills are reusable capability packs:
  - input form
  - execution logic
  - output contract
- Built-in starter skills:
  - web research brief
  - repo code review
  - report generation
  - customer email draft
- Marketplace-ready skill packaging.

## C) MCP Management
- Guided MCP onboarding with health checks.
- Permission scopes per MCP server.
- Test panel to execute tools safely before production use.
- Observable logs (latency, errors, output traces).

## D) Vector DB Layer
- Add `VectorStore` abstraction in ThorX domain layer:
  - `upsert_documents`
  - `search`
  - `delete`
  - `namespace`
- Provider support in phases:
  1. sqlite-vec (default local, zero setup)
  2. Qdrant local/remote
  3. Chroma
  4. optional managed providers
- RAG workflow templates for non-technical users:
  - upload docs -> index -> ask questions

## E) Workflow Orchestration
- Visual list-first orchestrator:
  - Trigger -> Steps -> Handoffs -> Completion policy
- Trigger options:
  - manual
  - schedule
  - file drop
  - webhook
- Multi-agent runbook support with retries and dead-letter queue.

## Architecture Blueprint

## Runtime stack
- Engine: existing Codex runtime and app-server.
- Integration adapters:
  - `ThorX Agent Adapter` (maps forms to thread/turn payloads)
  - `ThorX Skills Adapter` (maps skills to tool actions)
  - `ThorX Memory Adapter` (maps memory policy to vector store)
- UI shell: desktop app + local API bridge.

## Data contracts
- `AgentSpec`
- `SkillSpec`
- `WorkflowSpec`
- `MemoryPolicy`
- `ExecutionProfile`

Keep specs in JSON for portability and community sharing.

## Revised Phase Plan (Commit at each phase)

## Phase 0: Foundation and branding (done/in progress)
Commit includes:
- monorepo scaffolding for UI/Desktop/domain/protocol wrappers
- ThorX branding and credits documentation
- design baseline aligned to warm dark system

Exit criteria:
- base UI shell + desktop skeleton available.

## Phase 1: Form-level Agent Builder MVP
Commit scope:
- 7-step Agent Builder wizard
- `AgentSpec` schema + persistence
- run agent action maps to app-server thread/turn
- local-first provider selection with clear defaults

Exit criteria:
- non-technical user can create and run first agent in under 5 minutes.

## Phase 2: Skills Framework
Commit scope:
- skill registry UI
- skill templates and execution contracts
- 10 built-in skills
- import/export skills JSON

Exit criteria:
- user can attach skills to an agent via UI forms.

## Phase 3: MCP Control Center
Commit scope:
- MCP connection wizard
- auth + health diagnostics
- permission profile editor
- tool test and logs

Exit criteria:
- user can connect at least 3 MCP servers and run tools from UI.

## Phase 4: Vector Memory and RAG
Commit scope:
- `VectorStore` abstraction
- sqlite-vec default backend
- document indexing pipeline
- memory search and grounding panel

Exit criteria:
- agent can answer from uploaded docs with citations.

## Phase 5: Orchestration Engine
Commit scope:
- workflow designer
- scheduling + webhook triggers
- handoffs between multiple agents
- run timeline with retries and failure states

Exit criteria:
- user can automate end-to-end recurring workflow.

## Phase 6: Cross-platform Distribution
Commit scope:
- installer pipeline for macOS/Windows/Linux
- code signing and update channels
- crash and diagnostics flow

Exit criteria:
- public beta installers available.

## Phase 7: OSS Growth and Competitive Layer
Commit scope:
- docs site and examples library
- contribution starter tasks
- benchmark dashboard (latency/memory/success rate)
- community templates gallery

Exit criteria:
- active contributors and reproducible quality metrics.

## Competitive Metrics (must track)
- Time to first working agent (TTFA) < 5 minutes.
- Time to first MCP tool call < 10 minutes.
- Median workflow success rate > 95%.
- Crash-free sessions > 99%.
- Weekly active OSS contributors trend upward.

## Release Discipline
- One phase = one milestone PR + one milestone tag.
- Every phase must include:
  - demo video/gif
  - migration notes
  - updated docs
  - test coverage delta

## Immediate Next Moves
1. Freeze `AgentSpec`, `SkillSpec`, `WorkflowSpec`, and `MemoryPolicy` schemas.
2. Implement Phase 1 wizard end-to-end and commit as `phase-1-agent-builder-mvp`.
3. Add one sample workflow template to validate orchestration direction early.
4. Publish roadmap in README and open project board issues for contributors.
