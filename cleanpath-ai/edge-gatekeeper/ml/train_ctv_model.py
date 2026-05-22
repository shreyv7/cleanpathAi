import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, roc_auc_score
from skl2onnx import to_onnx
from skl2onnx.common.data_types import FloatTensorType
import onnxmltools
import os

# Configuration
DATA_PATH = os.path.join(os.path.dirname(__file__), '../../data/ctv_training_data.csv')
MODEL_OUTPUT_PATH = os.path.join(os.path.dirname(__file__), '../../data/ctv_spoof_model.onnx')

def train():
    print(f"Loading data from {DATA_PATH}...")
    if not os.path.exists(DATA_PATH):
        print("Error: Training data file not found. Run 'npm run generate-data' first.")
        return

    df = pd.read_csv(DATA_PATH)
    
    # Separate features and label
    X = df.drop(columns=['label'])
    y = df['label']
    
    feature_names = X.columns.tolist()
    print(f"Features: {len(feature_names)}")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train XGBoost Classifier
    print("Training XGBoost model...")
    # Use max_depth=3, n_estimators=50 for a lightweight edge-friendly model
    model = xgb.XGBClassifier(
        max_depth=3,
        n_estimators=50,
        learning_rate=0.1,
        objective='binary:logistic',
        eval_metric='logloss',
        random_state=42
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_prob)
    
    print("-" * 30)
    print(f"Evaluation Metrics:")
    print(f"Accuracy:  {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall:    {rec:.4f}")
    print(f"AUC:       {auc:.4f}")
    print("-" * 30)
    
    # Export to ONNX
    print("Exporting to ONNX...")
    
    # Define input type (float tensor with shape [None, n_features])
    initial_type = [('float_input', FloatTensorType([None, len(feature_names)]))]
    
    # Convert using onnxmltools/skl2onnx (better for sklearn-wrapped XGBoost)
    # options={'zipmap': False} ensures we get a tensor of probabilities, not a list of maps
    onx = to_onnx(model, X_train.to_numpy().astype(np.float32), target_opset=12, options={'zipmap': False})
    
    # Save model
    with open(MODEL_OUTPUT_PATH, "wb") as f:
        f.write(onx.SerializeToString())
        
    print(f"Model saved to {MODEL_OUTPUT_PATH}")

if __name__ == "__main__":
    train()
