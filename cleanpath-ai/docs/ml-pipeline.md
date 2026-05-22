# Machine Learning & Reinforcement Learning Pipeline

## Overview
CleanPath AI leverages a hybrid ML approach for CTV fraud detection:
1. **Supervised Learning (XGBoost)**: Predicts fraud probability based on historical labeled data.
2. **Reinforcement Learning (RL)**: Optimizes decision policies dynamically by learning from "Shadow Mode" feedback and delayed rewards.

---

## 1. Feature Engineering

The `CTVFeatureExtractor` transforms raw bid requests into a normalized **22-dimensional feature feature vector**.

### Key Feature Groups
- **Device Features**: `screen_width`, `screen_height`, `os_major_version`, `device_risk_score`.
- **App Features**: `app_bundle_anomaly`, `store_url_match`.
- **Context Features**: `hour_of_day`, `day_of_week`, `geo_mismatch`.
- **Streaming Features**: `bitrate`, `session_duration`, `is_ssai`.
- **History Features**: `historical_risk_score`, `request_velocity`.

### Normalization
All numerical features are normalized to a `[0, 1]` range or standard score (Z-score) to ensure model stability. Boolean features are encoded as `0` or `1`.

---

## 2. Supervised Model (XGBoost / ONNX)

We train a Gradient Boosted Classifier (XGBoost) offline and deploy it as an **ONNX** model to the Edge Gatekeeper.

- **Inference Engine**: `onnxruntime-node`
- **Latency**: < 5ms per inference
- **Output**: Probability of Spoof `[0.0 - 1.0]`

The model prediction provides a secondary signal to the Rule Engine, allowing for the detection of non-linear patterns that static rules might miss.

---

## 3. Reinforcement Learning (RL) Pipeline

The RL system is designed to "tune" the strictness of our blocking logic over time to maximize manufacturer revenue (Allowing legitimate ads) while minimizing fraud waste (Blocking spoofed ads).

### Components

#### Agent (DQN Support)
Currently running in **Shadow Mode**, the agent observes state and proposes actions without enforcing them.
- **State Space**: The 22-dimensional feature vector.
- **Action Space**: `{ ALLOW, BLOCK, BID_MODIFIER }`

#### Reward Service (`RLRewardService`)
Calculates the immediate reward for each Action/State pair based on a proxy "ground truth" (currently derived from high-confidence rule verdicts).

| Outcome | Type | Reward (Points) | Logic |
|---------|------|-----------------|-------|
| Block Spoof | **True Positive** | `+1.0` | Stopped fraud. |
| Allow Clean | **True Negative** | `+0.1` | Enabled revenue. |
| Block Clean | **False Positive** | `-5.0` | Lost revenue opportunity (High Penalty). |
| Allow Spoof | **False Negative** | `-10.0` | Fraud admitted (Critical Penalty). |

#### Experience Replay (`ExperienceReplayBuffer`)
Stores `(State, Action, Reward, NextState)` tuples in a circular buffer. These experiences are periodically sampled to retrain the RL policy offline.

---

## Integration Flow

1. **Request Arrives**: Parsed by `BidRequestHandler`.
2. **Features Extracted**: `CTVFeatureExtractor` generates vector.
3. **Inference**: ONNX Model predicts spoof probability.
4. **Decision**: Rule Engine makes final decision (BLOCK/ALLOW).
5. **RL Observation**:
    - Current State (Features) recorded.
    - Rule Engine decision recorded as "Ground Truth" proxy.
    - Reward calculated.
    - Experience stored in Buffer.
