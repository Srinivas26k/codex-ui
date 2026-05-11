# srvdb Integration Plan for ThorX

Repository: https://github.com/Srinivas26k/srvdb

## Goal
Use srvdb as an optional memory/index backend for ThorX workflows, while keeping sqlite-vec as the zero-setup default.

## Integration shape
- Add a `srvdb` backend implementation behind the ThorX `VectorStore` abstraction.
- Keep backend switching in UI memory settings.

## Proposed adapter contract
- `upsertDocuments(namespace, docs)`
- `search(namespace, query, topK)`
- `deleteNamespace(namespace)`
- `health()`

## Phased rollout
1. Phase 4A:
   - add interface and stub adapter.
   - add config fields in Agent memory policy.
2. Phase 4B:
   - implement read/write/search against srvdb APIs.
   - add integration tests with local srvdb service.
3. Phase 4C:
   - add migration helper from sqlite-vec to srvdb.

## Risks
- API shape mismatch between current memory abstraction and srvdb capabilities.
- Throughput differences for high-volume indexing.

## Mitigation
- Keep adapter boundary strict and test against fixture contracts.
- Add benchmark suite before making srvdb default for any profile.
