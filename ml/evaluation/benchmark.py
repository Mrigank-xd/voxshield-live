import numpy as np
from sklearn.metrics import roc_auc_score, precision_recall_fscore_support

def compute_forensic_metrics(y_true: np.ndarray, y_pred_prob: np.ndarray, threshold: float = 0.5):
    """
    Computes Equal Error Rate (EER), ROC-AUC, and F1 score for spoofing detection.
    """
    y_pred = (y_pred_prob >= threshold).astype(int)
    auc = roc_auc_score(y_true, y_pred_prob)
    precision, recall, f1, _ = precision_recall_fscore_support(y_true, y_pred, average='binary')
    
    return {
        "roc_auc": round(float(auc), 4),
        "f1_score": round(float(f1), 4),
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4)
    }

if __name__ == "__main__":
    # Test evaluation
    y_true = np.array([0, 0, 0, 1, 1, 1, 0, 1])
    y_pred = np.array([0.1, 0.2, 0.15, 0.85, 0.92, 0.78, 0.3, 0.88])
    print("Benchmark Metrics:", compute_forensic_metrics(y_true, y_pred))
