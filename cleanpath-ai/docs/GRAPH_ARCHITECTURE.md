
# Supply Path Intelligence Graph Architecture

## Overview
The Supply Path Intelligence Graph is a graph-based representation of the programmatic advertising supply chain within CleanPath AI. Its primary purpose is to identify financial inefficiencies, redundant auction paths, and "middleman taxes" (fee stacking) that reduce the working media available to advertisers.

## 1. Data Model (Neo4j)

### Node Labels
| Label | Description | Unique Constraints |
|-------|-------------|--------------------|
| `Publisher` | The entity owning the inventory. | `id`, `domain` |
| `Site` | A specific web domain or app property. | `id`, `domain` |
| `SSP` | Supply-Side Platform or Intermediary. | `id` (Seller ID / `sid`) |
| `Buyer` | The final DSP or Advertiser node. | `id` |

### Relationships
| Type | Description | Attributes |
|------|-------------|------------|
| `OWNS` | `(Publisher)-[:OWNS]->(Site)` | - |
| `SELLS_VIA` | `(Site)-[:SELLS_VIA]->(SSP)` | `requestId`, `updatedAt` |
| `AUCTION_PATH` | `(SSP)-[:AUCTION_PATH]->(SSP)` | `updatedAt` |

## 2. Anomaly Detection Logic

### Duplicate Auction Paths
A "Duplicate Path" occurs when a single `Site` broadcasts the same impression through multiple distinct chains. This causes internal competition for the buyer and increases processing overhead.
- **Detection**: Cypher query identifies multiple terminal paths starting from the same `Site` node.
- **Severity**: Flagged as `HIGH` if > 3 paths exist for one site.

### Fee Stacking (Hop Inflation)
Each hop in the supply chain typically incurs a 5% to 15% fee. 
- **Efficiency Logic**:
  - **Efficient**: 1 Hop (`Site -> SSP`).
  - **Standard**: 2 Hops (`Site -> SSP -> SSP`).
  - **Degraded**: 3+ Hops (Reselling chains).
- **Calculation**: The `FinancialAuditor` service aggregates hop counts to assign a "Health Score" to each path.

## 3. Implementation Details

### Ingestion Pipeline
1. **Extraction**: `EdgeDecision` metadata extracts the `schain` object from OpenRTB requests.
2. **Persistence**: `GraphIngestor` uses `MERGE` operations to incrementally build the topology without duplicating nodes.
3. **Analyis**: `GraphController` runs analytical queries to populate the **Anomaly Alerts** dashboard widget.

### Visualization Layer
The Dashboard Technical View utilizes a force-directed graph (`react-force-graph-2d`):
- **Node Coloring**: Differentiates between Publishers, Sites, and Intermediaries.
- **Link Direction**: Arrows indicate the flow of bid requests through the chain.
- **Interactive Exploration**: Allows clicking on nodes to drill down into specific publisher topologies.

## 4. Query Library
Commonly used Cypher snippets for supply path investigation:

**Find all SSPs used by a publisher:**
```cypher
MATCH (p:Publisher {id: $id})-[:OWNS]->(s:Site)-[:SELLS_VIA|AUCTION_PATH*]->(ssp:SSP)
RETURN DISTINCT ssp.domain
```

**Find paths with more than 3 hops:**
```cypher
MATCH path = (s:Site)-[:SELLS_VIA|AUCTION_PATH*3..10]->(lastNode)
RETURN path
```
