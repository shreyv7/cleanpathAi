# ML Engine – Deferred per Governance Reset v1

This directory is intentionally empty.

## Status
ML training pipeline is **deferred** per Governance Reset v1. The system currently operates with:

- **CTV Model Inference** (`edge-gatekeeper/src/ml/CTVModelInference.ts`): Runs with graceful degradation when no `.onnx` model file is present. Falls back to rule-based scoring.
- **CTV Feature Extraction** (`edge-gatekeeper/src/ml/CTVFeatureExtractor.ts`): Feature engineering logic is implemented and valid.

## What's Needed Before This Directory Can Be Populated
1. Labeled training datasets (minimum 10k labeled bid requests with ground-truth fraud labels)
2. Feature schema definition matching `CTVFeatureExtractor` output
3. ONNX model training pipeline (Python + scikit-learn/XGBoost → ONNX export)
4. Model validation framework with precision/recall thresholds
5. A/B testing infrastructure for model deployment

## References
- Quarantined RL stubs: `edge-gatekeeper/src/_deferred/`
- Active ML code: `edge-gatekeeper/src/ml/`
