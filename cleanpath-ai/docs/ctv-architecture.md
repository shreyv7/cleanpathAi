# CTV Spoof Guard Architecture

## Overview
The **CTV Spoof Guard** is a specialized module within the `Edge Gatekeeper` designed to detect and block fraudulent Connected TV (CTV) traffic. Unlike standard web traffic, CTV requests require deep validation of device integrity, app bundle authenticity, and streaming environment consistency.

## Core Components

The system is composed of three primary validators, orchestrated by a central guard.

### 1. App Bundle Validator (`CTVAppValidator`)
**Purpose**: Verifies that the app declaring the ad inventory is legitimate and consistent with the platform store.

- **Checks**:
    - **Bundle Format**: Validates format against store patterns (e.g., `com.roku.*` vs `id12345`).
    - **Store URL Match**: Ensures the `storeUrl` matches the declared `bundleId`.
    - **Known Malicious Apps**: Checks against a deny-list of known spoofed bundles.

### 2. Device Fingerprint Consistency (`CTVDeviceChecker`)
**Purpose**: Ensures the device parameters (User Agent, Screen Resolution, OS Version) form a coherent and realistic device profile.

- **Checks**:
    - **Emulator Detection**: Scans User Agent for known emulator patterns (e.g., "Android SDK", "Goldfish"). **(CRITICAL SIGNAL)**
    - **Screen Resolution**: Validates standard CTV resolutions (1080p, 4K).
    - **OS/Model Mismatch**: Ensures the OS version is valid for the declared device model.

### 3. Streaming Environment Validator (`CTVStreamValidator`)
**Purpose**: Validates the playback context to detect server-side ad insertion (SSAI) fraud or botnet activity.

- **Checks**:
    - **Session Velocity**: Detects rapid-fire session creation from a single IP.
    - **Bitrate Anomalies**: Flags unreasonably low or high bitrates for the declared resolution.
    - **SSAI Consistency**: Verifies that SSAI headers match known patterns for the publisher.

---

## Scoring Logic

The `CTVSpoofGuard` orchestrator aggregates signals from all validators to produce a final **Device Risk Score** (0-100).

### Weighted Average
By default, the score is a weighted average of individual validator risks:
- **Device Consistency**: 45% weight
- **Streaming Environment**: 30% weight
- **App Bundle**: 25% weight

### Critical Signal Override
To prevent clean signals from diluting high-severity threats, the system implements a **Critical Override**:

> **Logic**: If ANY single validator returns a signal with `severity >= 90` (e.g., "Emulator Detected"), the final `deviceRiskScore` is forced to match that maximum severity.

**Example**:
- App Check: Pass (Risk 0)
- Stream Check: Pass (Risk 0)
- Device Check: **FAIL (Emulator, Risk 90)**
- **Result**: Final Risk = **90** (Blocked), *not* the weighted average of ~40.

---

## Decision Flow

```mermaid
graph TD
    A[Bid Request] --> B{Device Type = CTV?}
    B -->|No| C[Standard Web Filter]
    B -->|Yes| D[CTV Spoof Guard]
    
    D --> E[App Validator]
    D --> F[Device Checker]
    D --> G[Stream Validator]
    
    E --> H[Weighted Scoring]
    F --> H
    G --> H
    
    H --> I{Critical Signal?}
    I -->|Yes| J[Override Score = Max Severity]
    I -->|No| K[Use Weighted Average]
    
    J --> L{Risk > 80?}
    K --> L
    
    L -->|Yes| M[BLOCK (Fraud)]
    L -->|No| N{Risk > 50?}
    N -->|Yes| O[BID_MODIFIER (Suspicious)]
    N -->|No| P[ALLOW]
```
