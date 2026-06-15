"""Evaluate the WaveFusionNet ensemble on the held-out test set.

Runs the SAME inference path the API uses (backend.core.detector.predict), so the
numbers reflect production behaviour (preprocessing + Keras softmax + SVM + XGB blend).

Usage:
    PYTHONPATH=. backend/.venv/Scripts/python.exe testing/evaluate_wavefusionnet.py
"""

import json
import sys
import time
from pathlib import Path

import numpy as np

from backend.core.detector import predict, CLASSES, get_model_readiness

TEST_DIR = Path(r"D:\Projects\NeuroSight_V0\Brain-tumor-detection-and-classification-by-ensemble-approach-based-deep-learning-system\dataset\Testing")
REPORT = Path(__file__).resolve().parent / "eval_report.json"

# Folder name on disk -> canonical class label used by the model.
FOLDER_TO_LABEL = {
    "glioma":     "glioma",
    "meningioma": "meningioma",
    "notumor":    "no_tumor",
    "pituitary":  "pituitary",
}
IMG_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff", ".webp"}
LABEL_IDX = {c: i for i, c in enumerate(CLASSES)}


def main() -> int:
    readiness = get_model_readiness(load=False)
    if not readiness["ready"]:
        print(f"MODEL NOT READY — missing: {readiness['missing_files']}", flush=True)
        return 2

    items = []  # (true_label, image_path)
    for folder, label in FOLDER_TO_LABEL.items():
        d = TEST_DIR / folder
        if not d.is_dir():
            print(f"WARNING: missing class folder {d}", flush=True)
            continue
        for p in sorted(d.iterdir()):
            if p.suffix.lower() in IMG_EXTS:
                items.append((label, p))

    total = len(items)
    print(f"Found {total} test images across {len(FOLDER_TO_LABEL)} classes. Starting…", flush=True)
    if total == 0:
        return 2

    n = len(CLASSES)
    confusion = np.zeros((n, n), dtype=int)  # rows=true, cols=pred
    errors = []
    correct = 0
    t0 = time.time()

    for i, (true_label, path) in enumerate(items, 1):
        try:
            pred_label, conf = predict(str(path))
        except Exception as exc:  # noqa: BLE001 — record, keep going
            errors.append({"path": str(path), "error": str(exc)})
            continue
        ti, pi = LABEL_IDX[true_label], LABEL_IDX.get(pred_label)
        if pi is None:
            errors.append({"path": str(path), "error": f"unknown predicted label '{pred_label}'"})
            continue
        confusion[ti, pi] += 1
        if ti == pi:
            correct += 1
        if i % 100 == 0 or i == total:
            elapsed = time.time() - t0
            rate = i / elapsed if elapsed else 0
            eta = (total - i) / rate if rate else 0
            print(f"  {i}/{total}  acc_so_far={correct/max(1,(i-len(errors))):.4f}  "
                  f"{rate:.1f} img/s  ETA {eta/60:.1f} min", flush=True)

    evaluated = int(confusion.sum())
    overall_acc = correct / evaluated if evaluated else 0.0

    # Per-class precision / recall / F1 from the confusion matrix.
    per_class = {}
    for c, idx in LABEL_IDX.items():
        tp = confusion[idx, idx]
        fn = confusion[idx, :].sum() - tp
        fp = confusion[:, idx].sum() - tp
        support = confusion[idx, :].sum()
        precision = tp / (tp + fp) if (tp + fp) else 0.0
        recall = tp / (tp + fn) if (tp + fn) else 0.0
        f1 = 2 * precision * recall / (precision + recall) if (precision + recall) else 0.0
        per_class[c] = {"precision": round(float(precision), 4),
                        "recall": round(float(recall), 4),
                        "f1": round(float(f1), 4),
                        "support": int(support),
                        "true_positives": int(tp)}

    macro_f1 = round(float(np.mean([m["f1"] for m in per_class.values()])), 4)

    result = {
        "test_dir": str(TEST_DIR),
        "classes": CLASSES,
        "total_images": total,
        "evaluated": evaluated,
        "errored": len(errors),
        "overall_accuracy": round(overall_acc, 4),
        "macro_f1": macro_f1,
        "confusion_matrix": confusion.tolist(),
        "confusion_rows_true_cols_pred": CLASSES,
        "per_class": per_class,
        "elapsed_sec": round(time.time() - t0, 1),
        "errors_sample": errors[:20],
    }
    REPORT.write_text(json.dumps(result, indent=2))

    # Console summary
    print("\n================ WaveFusionNet Test-Set Evaluation ================", flush=True)
    print(f"Images evaluated : {evaluated}/{total}  (errored: {len(errors)})", flush=True)
    print(f"Overall accuracy : {overall_acc:.4f}", flush=True)
    print(f"Macro F1         : {macro_f1:.4f}", flush=True)
    print("\nPer-class:", flush=True)
    print(f"  {'class':<12}{'precision':>10}{'recall':>9}{'f1':>8}{'support':>9}", flush=True)
    for c, m in per_class.items():
        print(f"  {c:<12}{m['precision']:>10.4f}{m['recall']:>9.4f}{m['f1']:>8.4f}{m['support']:>9}", flush=True)
    print("\nConfusion matrix (rows=true, cols=pred):", flush=True)
    header = "             " + "".join(f"{c[:9]:>11}" for c in CLASSES)
    print(header, flush=True)
    for ti, c in enumerate(CLASSES):
        print(f"  {c:<10}" + "".join(f"{confusion[ti, pj]:>11}" for pj in range(n)), flush=True)
    print(f"\nReport written to {REPORT}", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
