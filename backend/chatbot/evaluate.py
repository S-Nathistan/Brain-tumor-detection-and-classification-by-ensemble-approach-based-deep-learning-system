"""
NeuroSight Chatbot - Evaluation Script
Run this after training to generate metrics for your presentation.

Run from project root:
    python -m backend.chatbot.evaluate

Generates:
  - Confusion matrix plot  : backend/chatbot/model/confusion_matrix.png
  - Accuracy bar chart     : backend/chatbot/model/accuracy_chart.png
  - Full metrics printout
"""

import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    ConfusionMatrixDisplay,
)

BASE_DIR  = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "intent_data.csv"
MODEL_DIR = BASE_DIR / "model"


def load_model():
    vectorizer = joblib.load(MODEL_DIR / "vectorizer.pkl")
    classifier = joblib.load(MODEL_DIR / "intent_model.pkl")
    le         = joblib.load(MODEL_DIR / "label_encoder.pkl")
    return vectorizer, classifier, le


def load_data():
    df = pd.read_csv(DATA_PATH)
    df.columns = df.columns.str.strip()
    df = df.dropna()
    df["question"] = df["question"].str.lower().str.strip()
    df["intent"]   = df["intent"].str.strip()
    return df


def evaluate():
    print("\n" + "=" * 60)
    print("NeuroSight Chatbot — Evaluation")
    print("=" * 60)

    vectorizer, classifier, le = load_model()
    df = load_data()

    X = df["question"].values
    y = le.transform(df["intent"].values)

    _, X_test, _, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    X_test_vec = vectorizer.transform(X_test)
    y_pred     = classifier.predict(X_test_vec)

    acc    = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, target_names=le.classes_)
    cm     = confusion_matrix(y_test, y_pred)

    print(f"\nTest Accuracy : {acc * 100:.2f}%")
    print(f"\nClassification Report:\n{report}")

    # ── Confusion matrix plot ──────────────────────────────────────────────
    fig, ax = plt.subplots(figsize=(8, 6))
    disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=le.classes_)
    disp.plot(ax=ax, colorbar=True, cmap="Blues")
    ax.set_title("NeuroSight Chatbot — Confusion Matrix", fontsize=13, fontweight="bold")
    plt.tight_layout()
    cm_path = MODEL_DIR / "confusion_matrix.png"
    plt.savefig(cm_path, dpi=150)
    plt.close()
    print(f"\n[SAVED] Confusion matrix : {cm_path}")

    # ── Per-class accuracy bar chart ───────────────────────────────────────
    per_class_acc = cm.diagonal() / cm.sum(axis=1)
    fig, ax = plt.subplots(figsize=(8, 5))
    colors = ["#e74c3c" if a < 0.85 else "#2ecc71" for a in per_class_acc]
    bars = ax.bar(le.classes_, per_class_acc * 100, color=colors, edgecolor="white", linewidth=0.8)
    ax.set_ylim(0, 110)
    ax.set_ylabel("Accuracy (%)", fontsize=11)
    ax.set_xlabel("Intent Class", fontsize=11)
    ax.set_title(
        f"NeuroSight Chatbot — Per-Class Accuracy  (Overall: {acc*100:.1f}%)",
        fontsize=12, fontweight="bold"
    )
    for bar, val in zip(bars, per_class_acc):
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + 1.5,
            f"{val*100:.1f}%",
            ha="center", va="bottom", fontsize=9, fontweight="bold"
        )
    plt.tight_layout()
    acc_path = MODEL_DIR / "accuracy_chart.png"
    plt.savefig(acc_path, dpi=150)
    plt.close()
    print(f"[SAVED] Accuracy chart   : {acc_path}")

    # ── Dataset distribution chart ─────────────────────────────────────────
    counts = df["intent"].value_counts()
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.bar(counts.index, counts.values, color="#3498db", edgecolor="white")
    ax.set_ylabel("Number of Samples", fontsize=11)
    ax.set_xlabel("Intent Class", fontsize=11)
    ax.set_title("NeuroSight Chatbot — Training Dataset Distribution", fontsize=12, fontweight="bold")
    for i, (intent, count) in enumerate(counts.items()):
        ax.text(i, count + 0.5, str(count), ha="center", va="bottom", fontsize=9, fontweight="bold")
    plt.tight_layout()
    dist_path = MODEL_DIR / "dataset_distribution.png"
    plt.savefig(dist_path, dpi=150)
    plt.close()
    print(f"[SAVED] Dataset chart    : {dist_path}")

    print("\n[DONE] Evaluation complete. Use these charts in your presentation.")
    return acc


if __name__ == "__main__":
    evaluate()
