"""
CTV Spoof Detector — FastAPI Inference Service

Hosts the CTV spoof detection ONNX model and exposes a /predict endpoint
that the edge-gatekeeper calls during bid request processing.

Start:
    uvicorn main:app --host 0.0.0.0 --port 8001

Endpoints:
    GET  /health   — Liveness check
    POST /predict  — Run inference on a CTVFeatureVector
"""

import os
import time
import logging
from contextlib import asynccontextmanager
from typing import Optional

import numpy as np
import onnxruntime as ort
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

# ---------- Logging ----------
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ctv-spoof-detector")

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


# ---------- Pydantic Request / Response Models ----------
class CTVFeatureVector(BaseModel):
    """Mirrors the TypeScript CTVFeatureVector interface exactly."""
    feat_hour_of_day: float = Field(ge=0, le=23)
    feat_day_of_week: float = Field(ge=0, le=6)
    feat_request_velocity: float = Field(ge=0)
    feat_app_risk_score: float = Field(ge=0, le=100)
    feat_is_allowlisted: float = Field(ge=0, le=1)
    feat_store_url_match: float = Field(ge=0, le=1)
    feat_bundle_anomaly: float = Field(ge=0, le=1)
    feat_device_risk_score: float = Field(ge=0, le=100)
    feat_is_emulator: float = Field(ge=0, le=1)
    feat_is_generic_make: float = Field(ge=0, le=1)
    feat_os_major_version: float = Field(ge=0)
    feat_screen_width: float = Field(ge=0)
    feat_screen_height: float = Field(ge=0)
    feat_session_duration: float = Field(ge=0)
    feat_concurrent_sessions: float = Field(ge=0)
    feat_bitrate: float = Field(ge=0)
    feat_geo_mismatch: float = Field(ge=0, le=1)
    feat_is_ssai: float = Field(ge=0, le=1)
    feat_mutation_count: float = Field(ge=0)
    feat_days_since_first_seen: float = Field(ge=0)
    feat_historical_risk: float = Field(ge=0, le=100)
    feat_known_bad_list: float = Field(ge=0, le=1)


class PredictionResponse(BaseModel):
    """Response from the /predict endpoint."""
    spoof_probability: float = Field(
        description="Probability that this request is spoofed (0.0 = clean, 1.0 = spoof)"
    )
    label: int = Field(description="Predicted label: 0 = clean, 1 = spoof")
    inference_time_ms: float = Field(description="Time taken for inference in milliseconds")
    model_loaded: bool = Field(description="Whether the ONNX model is loaded")


class HealthResponse(BaseModel):
    """Response from the /health endpoint."""
    status: str
    model_loaded: bool
    model_path: str
    feature_count: int


# ---------- Model Manager ----------
class ModelManager:
    """Manages the ONNX model lifecycle."""

    def __init__(self):
        self.session: Optional[ort.InferenceSession] = None
        self.model_path: str = ""

    def load(self, model_path: str) -> bool:
        """Load the ONNX model from disk."""
        self.model_path = model_path
        if not os.path.exists(model_path):
            logger.warning(f"Model file not found at {model_path}. Service will return default scores.")
            return False
        try:
            # Use CPU execution provider for maximum compatibility
            self.session = ort.InferenceSession(
                model_path,
                providers=["CPUExecutionProvider"],
            )
            logger.info(f"ONNX model loaded from {model_path}")
            # Log model metadata
            for inp in self.session.get_inputs():
                logger.info(f"  Input: {inp.name} shape={inp.shape} type={inp.type}")
            for out in self.session.get_outputs():
                logger.info(f"  Output: {out.name} shape={out.shape} type={out.type}")
            return True
        except Exception as e:
            logger.error(f"Failed to load ONNX model: {e}")
            self.session = None
            return False

    def predict(self, features: np.ndarray) -> tuple[float, int]:
        """
        Run inference on a feature array.
        Returns (spoof_probability, label).
        If model is not loaded, returns a heuristic fallback.
        """
        if self.session is None:
            # Fallback: simple heuristic based on device_risk_score
            risk = float(features[0, 7])  # feat_device_risk_score
            prob = min(risk / 100.0, 1.0)
            label = 1 if prob > 0.5 else 0
            return prob, label

        input_name = self.session.get_inputs()[0].name
        results = self.session.run(None, {input_name: features})

        # Output structure depends on export options:
        # output_label (int tensor), output_probability (float tensor [batch, 2])
        label = int(results[0][0])

        # results[1] is the probability tensor, shape [1, 2]
        prob_array = results[1]
        spoof_prob = float(prob_array[0, 1])  # Probability of class 1 (spoof)

        return spoof_prob, label


# ---------- Global Model Instance ----------
model_manager = ModelManager()


# ---------- App Lifecycle ----------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model on startup, cleanup on shutdown."""
    model_dir = os.path.join(os.path.dirname(__file__), "models")
    model_path = os.path.join(model_dir, "ctv_spoof_model.onnx")
    model_manager.load(model_path)
    logger.info("CTV Spoof Detector service started")
    yield
    logger.info("CTV Spoof Detector service shutting down")


# ---------- FastAPI App ----------
app = FastAPI(
    title="CleanPath CTV Spoof Detector",
    description="ML inference service for CTV spoof detection in the CleanPath ad-tech pipeline",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/health", response_model=HealthResponse)
async def health():
    """Liveness and readiness check."""
    return HealthResponse(
        status="ok" if model_manager.session is not None else "degraded",
        model_loaded=model_manager.session is not None,
        model_path=model_manager.model_path,
        feature_count=NUM_FEATURES,
    )


@app.post("/predict", response_model=PredictionResponse)
async def predict(features: CTVFeatureVector):
    """
    Run CTV spoof detection inference.

    Accepts a CTVFeatureVector and returns the probability
    that the traffic is spoofed.
    """
    try:
        # Convert Pydantic model to numpy array in canonical feature order
        feature_values = [getattr(features, name) for name in FEATURE_NAMES]
        input_array = np.array([feature_values], dtype=np.float32)

        # Run inference
        start = time.perf_counter()
        spoof_prob, label = model_manager.predict(input_array)
        elapsed_ms = (time.perf_counter() - start) * 1000

        return PredictionResponse(
            spoof_probability=round(spoof_prob, 6),
            label=label,
            inference_time_ms=round(elapsed_ms, 3),
            model_loaded=model_manager.session is not None,
        )
    except Exception as e:
        logger.error(f"Inference error: {e}")
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
