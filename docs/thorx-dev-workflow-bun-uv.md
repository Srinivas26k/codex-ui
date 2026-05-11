# ThorX Developer Workflow (Bun + uv)

## Branch and PR policy
- One phase per branch.
- One branch -> one PR -> one merge -> move to next branch.

Naming convention:
- `phase-1-agent-builder-mvp`
- `phase-2-skills-framework`
- `phase-3-mcp-control-center`

## JavaScript workflow
This repo uses pnpm workspaces. You can still use Bun for local script execution and package runtime tooling.

Recommended:
- install deps with `pnpm install`
- run scripts with `pnpm` or `bun run` where compatible

Useful commands:
- `pnpm --filter @thorx/ui dev`
- `pnpm --filter @thorx/ui test`
- `pnpm --filter @thorx/domain test`
- `pnpm --filter @thorx/ui build`

## Python workflow (uv)
Use uv for Python SDK and automation services:
- `cd sdk/python`
- `uv sync`
- `uv run python examples/01_quickstart_constructor/sync.py`

Future workflow workers (orchestration/vector indexing) should prefer uv-managed environments.

## Quality gates per phase PR
- Type checks/build pass.
- Unit tests for edge cases added.
- Docs updated for new feature behavior.
- Demo notes included in PR description.

## System-level test categories
- Local provider unavailable fallback behavior.
- Invalid MCP credentials and recovery UX.
- Large input handling (long objective text, many skills).
- Concurrency safety for parallel agent runs.
- Crash/restart recovery for unfinished runs.
