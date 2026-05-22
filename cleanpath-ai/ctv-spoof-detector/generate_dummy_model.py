#!/usr/bin/env python3
"""
CTV Spoof Detector — Dummy ONNX Model Generator

Generates a synthetic XGBoost-style binary classifier exported to ONNX format.
The model is trained on random data shaped to match the CTVFeatureVector schema
(22 features) and outputs a spoof probability in [0, 1].

Usage:
    python generate_dummy_model.py
    # Produces: models/ctv_spoof_model.onnx
"""

import os
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

# ---------- Feature Schema (must match @cleanpath/types CTVFeatureVector) ----------
FEATURE_NAMES = [
    "feat_hour_of_day",
    "feat_day_of_week",
    "feat_request_velocity",
    "feat_app_risk_score",
    "feat_is_allowlisted",
    "feat_store_url_match",
    "feat_bundle_anomaly",
    "feat_device_risk_score",
    "feat_is_emulator",
    "feat_is_generic_make",
    "feat_os_major_version",
    "feat_screen_width",
    "feat_screen_height",
    "feat_session_duration",
    "feat_concurrent_sessions",
    "feat_bitrate",
    "feat_geo_mismatch",
    "feat_is_ssai",
    "feat_mutation_count",
    "feat_days_since_first_seen",
    "feat_historical_risk",
    "feat_known_bad_list",
]

NUM_FEATURES = len(FEATURE_NAMES)
NUM_SAMPLES = 5000
RANDOM_SEED = 42


def generate_synthetic_data(n_samples: int, n_features: int, seed: int):
    """
    Generate synthetic training data that loosely mimics CTV bid-request
    feature distributions. Legitimate traffic is class 0, spoofed is class 1.
    """
    rng = np.random.RandomState(seed)

    # --- Legitimate samples (60%) ---
    n_legit = int(n_samples * 0.6)
    legit = np.zeros((n_legit, n_features))
    legit[:, 0] = rng.randint(0, 24, n_legit)        # hour_of_day
    legit[:, 1] = rng.randint(0, 7, n_legit)          # day_of_week
    legit[:, 2] = rng.uniform(0, 5, n_legit)          # request_velocity (low)
    legit[:, 3] = rng.uniform(0, 20, n_legit)         # app_risk_score (low)
    legit[:, 4] = rng.choice([0, 1], n_legit, p=[0.2, 0.8])  # mostly allowlisted
    legit[:, 5] = rng.choice([0, 1], n_legit, p=[0.1, 0.9])  # store_url_match
    legit[:, 6] = rng.choice([0, 1], n_legit, p=[0.95, 0.05]) # bundle_anomaly (rare)
    legit[:, 7] = rng.uniform(0, 30, n_legit)         # device_risk_score (low)
    legit[:, 8] = 0                                    # is_emulator = 0
    legit[:, 9] = rng.choice([0, 1], n_legit, p=[0.9, 0.1])  # is_generic_make
    legit[:, 10] = rng.choice([10, 11, 12, 13, 14, 15, 16, 17], n_legit)  # os_major
    legit[:, 11] = rng.choice([1920, 1280, 3840], n_legit)   # screen_width
    legit[:, 12] = rng.choice([1080, 720, 2160], n_legit)    # screen_height
    legit[:, 13] = rng.uniform(30, 3600, n_legit)     # session_duration
    legit[:, 14] = rng.randint(1, 3, n_legit)         # concurrent_sessions
    legit[:, 15] = rng.uniform(2000, 25000, n_legit)  # bitrate
    legit[:, 16] = 0                                    # geo_mismatch = 0
    legit[:, 17] = rng.choice([0, 1], n_legit, p=[0.7, 0.3])  # is_ssai
    legit[:, 18] = rng.randint(0, 3, n_legit)         # mutation_count (low)
    legit[:, 19] = rng.uniform(30, 365, n_legit)      # days_since_first_seen
    legit[:, 20] = rng.uniform(0, 20, n_legit)        # historical_risk (low)
    legit[:, 21] = 0                                    # known_bad_list = 0

    # --- Spoof samples (40%) ---
    n_spoof = n_samples - n_legit
    spoof = np.zeros((n_spoof, n_features))
    spoof[:, 0] = rng.randint(0, 24, n_spoof)
    spoof[:, 1] = rng.randint(0, 7, n_spoof)
    spoof[:, 2] = rng.uniform(10, 100, n_spoof)       # high velocity
    spoof[:, 3] = rng.uniform(50, 100, n_spoof)       # high app_risk
    spoof[:, 4] = rng.choice([0, 1], n_spoof, p=[0.8, 0.2])  # mostly not allowlisted
    spoof[:, 5] = rng.choice([0, 1], n_spoof, p=[0.7, 0.3])  # store_url mismatch
    spoof[:, 6] = rng.choice([0, 1], n_spoof, p=[0.3, 0.7])  # high bundle_anomaly
    spoof[:, 7] = rng.uniform(50, 100, n_spoof)       # high device_risk
    spoof[:, 8] = rng.choice([0, 1], n_spoof, p=[0.4, 0.6])  # often emulator
    spoof[:, 9] = rng.choice([0, 1], n_spoof, p=[0.3, 0.7])  # generic make
    spoof[:, 10] = rng.choice([5, 6, 7, 8, 9], n_spoof)      # old OS
    spoof[:, 11] = rng.choice([800, 1024, 1920], n_spoof)
    spoof[:, 12] = rng.choice([600, 768, 1080], n_spoof)
    spoof[:, 13] = rng.uniform(0, 10, n_spoof)        # very short sessions
    spoof[:, 14] = rng.randint(5, 50, n_spoof)        # many concurrent
    spoof[:, 15] = rng.uniform(0, 500, n_spoof)       # low bitrate
    spoof[:, 16] = rng.choice([0, 1], n_spoof, p=[0.3, 0.7])  # geo mismatch
    spoof[:, 17] = rng.choice([0, 1], n_spoof, p=[0.5, 0.5])
    spoof[:, 18] = rng.randint(5, 30, n_spoof)        # high mutation count
    spoof[:, 19] = rng.uniform(0, 5, n_spoof)         # brand new IFA
    spoof[:, 20] = rng.uniform(50, 100, n_spoof)      # high historical risk
    spoof[:, 21] = rng.choice([0, 1], n_spoof, p=[0.5, 0.5])

    X = np.vstack([legit, spoof]).astype(np.float32)
    y = np.array([0] * n_legit + [1] * n_spoof, dtype=np.int64)

    # Shuffle
    perm = rng.permutation(n_samples)
    return X[perm], y[perm]


def main():
    print(f"Generating {NUM_SAMPLES} synthetic CTV samples with {NUM_FEATURES} features...")
    X, y = generate_synthetic_data(NUM_SAMPLES, NUM_FEATURES, RANDOM_SEED)

    print("Training GradientBoostingClassifier...")
    clf = GradientBoostingClassifier(
        n_estimators=100,
        max_depth=4,
        learning_rate=0.1,
        random_state=RANDOM_SEED,
    )
    clf.fit(X, y)

    train_acc = clf.score(X, y)
    print(f"Training accuracy: {train_acc:.4f}")

    # Export to ONNX with zipmap=False for clean tensor output
    print("Converting to ONNX format (zipmap=False)...")
    initial_type = [("float_input", FloatTensorType([None, NUM_FEATURES]))]
    onnx_model = convert_sklearn(
        clf,
        initial_types=initial_type,
        target_opset=12,
        options={id(clf): {"zipmap": False}},
    )

    # Save
    os.makedirs("models", exist_ok=True)
    model_path = os.path.join("models", "ctv_spoof_model.onnx")
    with open(model_path, "wb") as f:
        f.write(onnx_model.SerializeToString())

    print(f"ONNX model saved to {model_path}")
    print(f"Model input: 'float_input' shape [batch, {NUM_FEATURES}]")
    print("Model outputs: 'output_label' (int), 'output_probability' (float tensor [batch, 2])")


if __name__ == "__main__":
    main()
