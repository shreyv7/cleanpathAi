# CleanPath AI API Documentation

## Overview
The CleanPath AI ecosystem consists of two primary API layers:
1. **Edge Gatekeeper API**: High-frequency, low-latency processing of bid requests.
2. **Application API**: Centralized management for publishers, auditing, and analytics.

---

## 1. Edge Gatekeeper API
This API is typically deployed as a regional microservice or Lambda@Edge function.

### POST `/bid`
Processes an incoming bid request and returns a classification decision.

**Request Body (OpenRTB Simplified):**
```json
{
  "id": "req-123",
  "timestamp": 1676345600000,
  "site": {
    "id": "site-1",
    "domain": "example.com",
    "publisher": { "id": "pub-1" }
  },
  "device": {
    "ua": "Mozilla/5.0...",
    "ip": "1.2.3.4",
    "type": "desktop"
  },
  "impressions": [
    { "id": "imp-1", "width": 300, "height": 250 }
  ]
}
```

**Response Body:**
```json
{
  "decision": {
    "requestId": "req-123",
    "decision": "allow|block|bid_modifier",
    "timestamp": 1676345600015,
    "processingTimeMs": 15,
    "metadata": {
      "thermalScore": 45,
      "riskLevel": "low"
    }
  },
  "cacheHit": true
}
```

---

## 2. Application API
Central management service for configuration and auditing.

### Publisher Management
`GET /api/publishers/:id` - Fetch publisher profile and current thermal stats.  
`POST /api/publishers` - Register a new publisher for classification.  
`PUT /api/publishers/:id` - Update publisher metadata.  
`DELETE /api/publishers/:id` - Decommission a publisher.

### Decision Auditing
`GET /api/decisions` - Query historical decisions with pagination.
- **Query Params:** `page`, `limit`, `publisher_id`, `decision`, `start_date`, `end_date`.

`GET /api/decisions/stats` - Fetch aggregate metrics (e.g., 24h Block Rate).

`POST /api/decisions` - (Internal) Records an edge decision to the central audit log.

---

## 3. Authentication
All requests to the Application API and Edge Gatekeeper (in production) require the `X-API-Key` header.

```bash
curl -H "X-API-Key: your_api_key_here" https://api.cleanpath.ai/health
```

---

## 4. Error Handling
CleanPath uses standard HTTP status codes:
- `200/201`: Success
- `400`: Bad Request (Validation failed)
- `401`: Unauthorized (Invalid or missing API key)
- `404`: Not Found
- `500`: Internal Server Error (Triggers fail-open logic at the edge)

---

## 5. Dashboard API
Endpoints for powering the technical and executive dashboards.

### CTV Integrity
`GET /api/dashboard/ctv-integrity` - Returns aggregated CTV fraud metrics.
- **Response**: `spoofRate`, `topSignals`, `deviceTypeDistribution`.

### ML Performance
`GET /api/dashboard/ml-performance` - Returns ML/RL model metrics.
- **Response**: `modelAccuracy`, `rlRewardLift`, `latencyDistribution`.

### Device Explorer
`GET /api/dashboard/device-explorer` - Search and inspect specific device fingerprints.
- **Query Params**: `ip`, `ua`, `limit`.

