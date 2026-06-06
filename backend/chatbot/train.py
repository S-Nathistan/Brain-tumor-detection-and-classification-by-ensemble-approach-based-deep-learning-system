"""
NeuroSight Brain Tumor Patient Chatbot - Training Script
Intent Classification using TF-IDF + SVM

Run from project root:
    python -m backend.chatbot.train

Outputs saved to: backend/chatbot/model/
    - vectorizer.pkl   (TF-IDF vectorizer weights)
    - intent_model.pkl (SVM classifier weights)
    - label_encoder.pkl (label encoder)
    - training_report.txt (accuracy + classification report)
"""

import os
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
)
from sklearn.pipeline import Pipeline

# ── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR   = Path(__file__).resolve().parent
DATA_PATH  = BASE_DIR / "data" / "intent_data.csv"
MODEL_DIR  = BASE_DIR / "model"
MODEL_DIR.mkdir(exist_ok=True)

VECTORIZER_PATH    = MODEL_DIR / "vectorizer.pkl"
CLASSIFIER_PATH    = MODEL_DIR / "intent_model.pkl"
LABEL_ENC_PATH     = MODEL_DIR / "label_encoder.pkl"
REPORT_PATH        = MODEL_DIR / "training_report.txt"


def load_data():
    df = pd.read_csv(DATA_PATH)
    df.columns = df.columns.str.strip()
    df = df.dropna()
    df["question"] = df["question"].str.lower().str.strip()
    df["intent"]   = df["intent"].str.strip()
    print(f"\n[DATA] Loaded {len(df)} samples across {df['intent'].nunique()} intents")
    print(df["intent"].value_counts().to_string())
    return df


def train(df):
    X = df["question"].values
    y = df["intent"].values

    # Encode labels
    le = LabelEncoder()
    y_enc = le.fit_transform(y)

    # Train / test split (80/20, stratified)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_enc, test_size=0.2, random_state=42, stratify=y_enc
    )

    # TF-IDF vectorizer
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),   # unigrams + bigrams
        max_features=5000,
        sublinear_tf=True,    # apply log(tf) scaling
        min_df=1,
    )

    # LinearSVC classifier
    classifier = LinearSVC(
        C=1.0,
        max_iter=2000,
        random_state=42,
    )

    # Fit
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec  = vectorizer.transform(X_test)
    classifier.fit(X_train_vec, y_train)

    # Evaluate
    y_pred = classifier.predict(X_test_vec)
    acc    = accuracy_score(y_test, y_pred)
    report = classification_report(
        y_test, y_pred, target_names=le.classes_
    )
    cm     = confusion_matrix(y_test, y_pred)

    # Cross-validation (5-fold)
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), max_features=5000, sublinear_tf=True)),
        ("svm",   LinearSVC(C=1.0, max_iter=2000, random_state=42)),
    ])
    cv_scores = cross_val_score(pipeline, X, y_enc, cv=5, scoring="accuracy")

    return vectorizer, classifier, le, acc, report, cm, cv_scores


def save_model(vectorizer, classifier, le):
    joblib.dump(vectorizer,  VECTORIZER_PATH)
    joblib.dump(classifier,  CLASSIFIER_PATH)
    joblib.dump(le,          LABEL_ENC_PATH)
    print(f"\n[SAVED] vectorizer     : {VECTORIZER_PATH}")
    print(f"[SAVED] classifier     : {CLASSIFIER_PATH}")
    print(f"[SAVED] label_encoder  : {LABEL_ENC_PATH}")


def save_report(acc, report, cm, cv_scores, classes):
    lines = [
        "=" * 60,
        "NeuroSight Chatbot - Intent Classifier Training Report",
        "=" * 60,
        f"\nModel      : TF-IDF (1-2 gram) + LinearSVC",
        f"Test Accuracy  : {acc * 100:.2f}%",
        f"CV Accuracy    : {cv_scores.mean() * 100:.2f}% (+/- {cv_scores.std() * 100:.2f}%)",
        f"CV Scores      : {[f'{s*100:.1f}%' for s in cv_scores]}",
        "\n--- Classification Report ---\n",
        report,
        "\n--- Confusion Matrix ---",
        f"Classes: {list(classes)}",
        str(cm),
        "\n[END OF REPORT]",
    ]
    text = "\n".join(lines)
    with open(REPORT_PATH, "w") as f:
        f.write(text)
    print("\n" + text)
    print(f"\n[SAVED] report : {REPORT_PATH}")


def smoke_test(vectorizer, classifier, le):
    samples = [
        ("I am having a seizure",       "emergency"),
        ("what is glioma",              "diagnosis"),
        ("side effects of chemotherapy","treatment"),
        ("what should I eat",           "nutrition"),
        ("I have a headache",           "symptom"),
        ("when is my appointment",      "general"),
    ]
    print("\n--- Smoke Test ---")
    for question, expected in samples:
        vec    = vectorizer.transform([question.lower()])
        pred   = classifier.predict(vec)[0]
        label  = le.inverse_transform([pred])[0]
        status = "OK" if label == expected else "FAIL"
        print(f"  [{status}] '{question}' -> {label}  (expected: {expected})")


if __name__ == "__main__":
    print("=" * 60)
    print("NeuroSight Chatbot Training")
    print("=" * 60)

    df = load_data()
    vectorizer, classifier, le, acc, report, cm, cv_scores = train(df)
    save_model(vectorizer, classifier, le)
    save_report(acc, report, cm, cv_scores, le.classes_)
    smoke_test(vectorizer, classifier, le)

    print(f"\n[DONE] Training complete. Test accuracy: {acc * 100:.2f}%")
