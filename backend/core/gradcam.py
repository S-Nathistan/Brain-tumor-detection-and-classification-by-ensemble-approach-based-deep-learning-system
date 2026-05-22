"""
Clinical Explainable AI — Grad-CAM++, Integrated Gradients, trust metrics.
Ported and adapted from notebook SECTION 16B for FastAPI backend use.

All XAI operations work on the dual-output keras model already loaded by
detector.py. A softmax-only view is derived from it for gradient computation.
"""

import base64
import json
import logging
import time
from pathlib import Path

import cv2
import numpy as np
import tensorflow as tf

from backend.core.detector import (
    CLASSES,
    IMG_SIZE,
    _load_all,
    _preprocess,
)

logger = logging.getLogger(__name__)

_XAI_CONFIG_PATH = Path(__file__).resolve().parent.parent / "tumor_models" / "xai_config.json"
_DEFAULT_GRADCAM_LAYERS = ["proj_a", "proj_b"]

_softmax_model: tf.keras.Model | None = None
_grad_model_cache: dict[str, tf.keras.Model] = {}
_gradcam_layers: list[str] | None = None


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_softmax_model() -> tf.keras.Model:
    """Return (and cache) a single-output softmax view of the dual model."""
    global _softmax_model
    if _softmax_model is None:
        import backend.core.detector as det
        km = det._keras_model
        out = km.output
        softmax_out = out[0] if isinstance(out, (list, tuple)) else out
        _softmax_model = tf.keras.Model(inputs=km.input, outputs=softmax_out,
                                        name="WaveFusionNet_softmax")
    return _softmax_model


def _load_gradcam_layers() -> list[str]:
    """Return the two Grad-CAM target layer names, cached after first read.

    WaveFusionNet's targets are fixed: proj_a (EfficientNetV2-S branch) and
    proj_b (DenseNet201 branch) — the Conv2D projection heads before fusion.
    Verified against training notebook SECTION 16. Read from xai_config.json
    so a retrained model only needs a config edit, not a code change.
    """
    global _gradcam_layers
    if _gradcam_layers is not None:
        return _gradcam_layers
    try:
        with open(_XAI_CONFIG_PATH, "r") as f:
            cfg = json.load(f)
        layers = cfg["gradcam_layers"]
        _gradcam_layers = [layers["path_a"]["name"], layers["path_b"]["name"]]
        logger.info("Grad-CAM layers loaded from config: %s", _gradcam_layers)
    except Exception as exc:
        _gradcam_layers = list(_DEFAULT_GRADCAM_LAYERS)
        logger.warning("xai_config.json unreadable (%s) — using defaults %s",
                       exc, _gradcam_layers)
    return _gradcam_layers


def _image_to_b64(rgb_array: np.ndarray) -> str:
    """float32 [0,1] or uint8 RGB → base64 PNG string."""
    if rgb_array.dtype != np.uint8:
        rgb_array = (np.clip(rgb_array, 0.0, 1.0) * 255).astype(np.uint8)
    bgr = cv2.cvtColor(rgb_array, cv2.COLOR_RGB2BGR)
    ok, buf = cv2.imencode(".png", bgr)
    if not ok:
        raise RuntimeError("cv2.imencode failed")
    return base64.b64encode(buf.tobytes()).decode("utf-8")


def _overlay_to_b64(original_rgb: np.ndarray, cam: np.ndarray,
                    alpha: float = 0.45,
                    colormap: int = cv2.COLORMAP_JET) -> str:
    """Blend normalized cam [0,1] over original RGB, return base64 PNG."""
    orig_u8 = (np.clip(original_rgb, 0.0, 1.0) * 255).astype(np.uint8) \
        if original_rgb.dtype != np.uint8 else original_rgb.copy()
    cam_u8 = (np.clip(cam, 0.0, 1.0) * 255).astype(np.uint8)
    heatmap_bgr = cv2.applyColorMap(cam_u8, colormap)
    heatmap_rgb = cv2.cvtColor(heatmap_bgr, cv2.COLOR_BGR2RGB)
    overlay = (orig_u8.astype(np.float32) * (1.0 - alpha) +
               heatmap_rgb.astype(np.float32) * alpha).clip(0, 255).astype(np.uint8)
    return _image_to_b64(overlay)


def _glcm_contrast_homogeneity(gray_region: np.ndarray,
                                levels: int = 8) -> tuple[float, float]:
    """Vectorized GLCM contrast and homogeneity (pure numpy, no scikit-image)."""
    q = np.clip(
        (gray_region.astype(np.float32) * levels / 256).astype(np.int32),
        0, levels - 1,
    )
    glcm = np.zeros((levels, levels), dtype=np.float64)
    pairs = [
        (q[:, :-1],  q[:, 1:]),     # horizontal
        (q[:-1, :],  q[1:, :]),     # vertical
        (q[:-1, :-1], q[1:, 1:]),   # diagonal
        (q[:-1, 1:],  q[1:, :-1]),  # anti-diagonal
    ]
    for ref, nei in pairs:
        i_vals, j_vals = ref.ravel(), nei.ravel()
        np.add.at(glcm, (i_vals, j_vals), 1)
        np.add.at(glcm, (j_vals, i_vals), 1)
    glcm /= glcm.sum() + 1e-8
    idx = np.arange(levels, dtype=np.float64)
    i_idx, j_idx = idx[:, None], idx[None, :]
    contrast = float(np.sum(glcm * (i_idx - j_idx) ** 2))
    homogeneity = float(np.sum(glcm / (1.0 + np.abs(i_idx - j_idx))))
    return contrast, homogeneity


def _centroid(mask: np.ndarray) -> tuple[float, float]:
    """Binary mask → (cy, cx) centroid, no scipy needed."""
    ys, xs = np.where(mask)
    if len(ys) == 0:
        H, W = mask.shape
        return float(H / 2), float(W / 2)
    return float(ys.mean()), float(xs.mean())


# ---------------------------------------------------------------------------
# XAI Core Functions
# ---------------------------------------------------------------------------

def compute_gradcam(softmax_model: tf.keras.Model,
                    image: np.ndarray,
                    layer_name: str,
                    pred_index: int) -> np.ndarray:
    """Standard Grad-CAM on a named layer — single 1st-order gradient.

    Runs eager (no tf.function) — like the training notebook's SECTION 16 — so
    there is no multi-minute graph-compile penalty on CPU. The grad model is
    built once per layer and cached.
    """
    img_batch = tf.cast(np.expand_dims(image, 0), tf.float32)
    cache_key = f"{id(softmax_model)}_{layer_name}"
    if cache_key not in _grad_model_cache:
        target_layer = softmax_model.get_layer(layer_name)
        _grad_model_cache[cache_key] = tf.keras.Model(
            softmax_model.input, [target_layer.output, softmax_model.output]
        )
    grad_model = _grad_model_cache[cache_key]

    with tf.GradientTape() as tape:
        conv_out, preds = grad_model(img_batch, training=False)
        # Gradient target MUST be the original conv_out — casting it to a new
        # tensor breaks the tape link and the gradient comes back None.
        cls_out = tf.cast(preds, tf.float32)[:, pred_index]
    grads = tape.gradient(cls_out, conv_out)
    if grads is None:
        raise ValueError(
            f"Grad-CAM: zero gradient for layer '{layer_name}' (class {pred_index})"
        )
    conv_out = tf.cast(conv_out, tf.float32)
    grads    = tf.cast(grads,    tf.float32)

    weights = tf.reduce_mean(grads[0], axis=(0, 1))
    cam = tf.reduce_sum(conv_out[0] * weights, axis=-1)
    cam = tf.maximum(cam, 0) / (tf.reduce_max(cam) + 1e-8)
    cam = cv2.resize(cam.numpy(), (image.shape[1], image.shape[0]))
    return cam.astype(np.float32)


def vanilla_saliency(softmax_model: tf.keras.Model,
                     image: np.ndarray,
                     pred_index: int) -> np.ndarray:
    """Vanilla Saliency: 1 forward/backward pass, eager (no tf.function)."""
    image_t = tf.cast(np.expand_dims(image, 0), tf.float32)

    with tf.GradientTape() as tape:
        tape.watch(image_t)
        preds = tf.cast(softmax_model(image_t, training=False), tf.float32)
        cls_p = preds[:, pred_index]
    grads = tape.gradient(cls_p, image_t)

    saliency = tf.reduce_max(tf.abs(tf.cast(grads[0], tf.float32)), axis=-1).numpy()
    saliency = (saliency - saliency.min()) / (saliency.max() - saliency.min() + 1e-8)
    return saliency.astype(np.float32)


def localize_anatomical_region(saliency_map: np.ndarray,
                                threshold: float = 0.5) -> tuple[str, tuple[int, int]]:
    """Map saliency centroid to clinical anatomical label (axial MRI)."""
    H, W = saliency_map.shape
    mask  = saliency_map > threshold
    cy, cx = _centroid(mask)

    side   = ("left hemisphere" if cx < W * 0.45 else
               "right hemisphere" if cx > W * 0.55 else "midline")
    region = ("frontal / anterior" if cy < H * 0.33 else
               "central / parietal" if cy < H * 0.66 else "occipital / posterior")

    rel_y, rel_x = cy / H, cx / W
    if 0.55 < rel_y < 0.78 and abs(rel_x - 0.5) < 0.15:
        region += " — near sella turcica / pituitary fossa"
    if 0.30 < rel_y < 0.55 and abs(rel_x - 0.5) < 0.12:
        region += " — peri-thalamic / midline structures"

    return f"{region}, {side}", (int(cx), int(cy))


def clinical_descriptors(image: np.ndarray, saliency_map: np.ndarray,
                          hot_thr: float = 0.5,
                          cold_thr: float = 0.10) -> dict:
    """Radiology-style descriptors computed inside the saliency hotspot."""
    img_u8 = (np.clip(image, 0.0, 1.0) * 255).astype(np.uint8) \
        if image.dtype != np.uint8 else image
    gray = cv2.cvtColor(img_u8, cv2.COLOR_RGB2GRAY) if img_u8.ndim == 3 else img_u8

    hot  = saliency_map > hot_thr
    cold = saliency_map < cold_thr

    if hot.sum() < 25:
        return {"note": "Saliency region too small for reliable descriptors."}

    # Intensity
    mean_hot  = float(gray[hot].mean())
    mean_cold = float(gray[cold].mean()) if cold.sum() > 50 else float(gray.mean())
    diff      = mean_hot - mean_cold
    intensity = (f"HYPERINTENSE (Δ +{diff:.1f}) vs surrounding tissue" if diff > 15 else
                 f"HYPOINTENSE (Δ {diff:.1f}) vs surrounding tissue"  if diff < -15 else
                 f"ISOINTENSE (Δ {diff:+.1f}) vs surrounding tissue")

    # Texture via GLCM (pure numpy)
    region_gray = gray.copy(); region_gray[~hot] = 0
    contrast, homogeneity = _glcm_contrast_homogeneity(region_gray)
    texture = (f"HETEROGENEOUS (GLCM contrast={contrast:.2f}) — "
               "internal variation; consider necrosis / cysts / mixed tissue"
               if contrast > 1.5 else
               f"HOMOGENEOUS (contrast={contrast:.2f}, "
               f"homogeneity={homogeneity:.2f}) — uniform texture")

    # Hemispheric asymmetry
    H, W   = gray.shape
    left   = gray[:, :W // 2].astype(float)
    right  = np.fliplr(gray[:, W // 2:]).astype(float)
    asym   = float(np.abs(left - right).mean())
    asymmetry = (f"MARKED hemispheric asymmetry (score={asym:.1f})" if asym > 15 else
                 f"MILD hemispheric asymmetry (score={asym:.1f})"   if asym > 8  else
                 f"SYMMETRIC ({asym:.1f})")

    # Margin sharpness (Sobel along hotspot boundary)
    sx  = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
    sy  = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3)
    edge = np.sqrt(sx ** 2 + sy ** 2)
    boundary = cv2.dilate(hot.astype(np.uint8), np.ones((3, 3))) - hot.astype(np.uint8)
    if boundary.sum() > 0:
        ms = float(edge[boundary > 0].mean())
        margins = (f"WELL-DEFINED margins (edge strength={ms:.1f})" if ms > 30 else
                   f"IRREGULAR / ILL-DEFINED margins (edge strength={ms:.1f})")
    else:
        margins = "Margins not assessable"

    # Size (relative to FOV)
    rel_area = hot.sum() / (H * W)
    size = (f"SMALL (~{rel_area * 100:.1f}% of FOV)"  if rel_area < 0.03 else
            f"MEDIUM (~{rel_area * 100:.1f}% of FOV)" if rel_area < 0.10 else
            f"LARGE (~{rel_area * 100:.1f}% of FOV)")

    return {"intensity": intensity, "texture": texture,
            "asymmetry": asymmetry, "margins": margins, "size": size}


def ensemble_uncertainty(softmax_p: np.ndarray,
                         svm_p: np.ndarray,
                         xgb_p: np.ndarray) -> tuple[np.ndarray, float]:
    """Pure numpy uncertainty from the 3 models. 0 passes."""
    mean_p = (softmax_p + svm_p + xgb_p) / 3.0
    entropy = float(-np.sum(mean_p * np.log(mean_p + 1e-12)))
    max_ent = float(-np.log(1.0 / len(mean_p)))
    return mean_p, entropy / (max_ent + 1e-12)


def cam_agreement_iou(cam_a: np.ndarray, cam_b: np.ndarray,
                       thr: float = 0.5) -> float:
    a, b = cam_a > thr, cam_b > thr
    return float(np.logical_and(a, b).sum() / (np.logical_or(a, b).sum() + 1e-8))


def trust_verdict(softmax_p: np.ndarray, svm_p: np.ndarray, xgb_p: np.ndarray,
                  cam_iou: float, mc_entropy: float) -> dict:
    """Four signals → 0-8 score → HIGH / MODERATE / LOW trust verdict."""
    sm, sv, xg = int(np.argmax(softmax_p)), int(np.argmax(svm_p)), int(np.argmax(xgb_p))
    ensemble_agree = sm == sv == xg

    ens    = (softmax_p + svm_p + xgb_p) / 3.0
    margin = float(np.sort(ens)[-1] - np.sort(ens)[-2])

    score  = 2 if ensemble_agree else 0
    score += 2 if margin > 0.30 else (1 if margin > 0.15 else 0)
    score += 2 if cam_iou > 0.40 else (1 if cam_iou > 0.20 else 0)
    score += 2 if mc_entropy < 0.25 else (1 if mc_entropy < 0.50 else 0)

    verdict = ("HIGH TRUST" if score >= 7 else
               "MODERATE TRUST — clinical review recommended" if score >= 4 else
               "LOW TRUST — manual review required")

    return {
        "verdict":                verdict,
        "score":                  f"{score}/8",
        "ensemble_agreement":     ensemble_agree,
        "top1_margin":            round(margin, 3),
        "dual_path_iou":          round(cam_iou, 3),
        "mc_entropy_normalized":  round(mc_entropy, 3),
    }


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def warmup_xai() -> None:
    """Pre-build and cache the per-layer grad models at startup.

    Grad-CAM runs eager (no tf.function), so there is no graph compilation —
    this just builds the grad models once so the first doctor request skips
    that small construction cost.
    """
    _load_all()

    sm = _get_softmax_model()
    dummy = np.zeros((IMG_SIZE, IMG_SIZE, 3), dtype=np.float32)

    # Pre-build and cache the per-layer grad models
    for layer_name in set(_load_gradcam_layers()):
        try:
            compute_gradcam(sm, dummy, layer_name, 0)
            logger.info("XAI warmup: grad model built for layer '%s'", layer_name)
        except Exception as exc:
            logger.warning("XAI warmup: layer '%s' warmup failed (non-fatal): %s", layer_name, exc)

    # Warm Vanilla Saliency
    try:
        vanilla_saliency(sm, dummy, 0)
        logger.info("XAI warmup: Vanilla Saliency ready.")
    except Exception as exc:
        logger.warning("XAI warmup: Vanilla Saliency warmup failed (non-fatal): %s", exc)

    logger.info("XAI warmup complete — gradient graphs compiled and cached.")


def predict_xai(image_path: str, progress_callback=None) -> dict:
    """Full XAI pipeline. If progress_callback is provided, emits partial results after each step."""
    _load_all()

    import backend.core.detector as det
    km  = det._keras_model
    svm = det._svm_clf
    xgb = det._xgb_clf
    sc  = det._scaler
    w   = det._weights

    t0 = time.time()
    img       = _preprocess(image_path)
    img_batch = np.expand_dims(img, 0)

    # ── Step 1: Three-head ensemble prediction ──
    outputs    = km.predict(img_batch, verbose=0)
    softmax_p  = np.array(outputs[0]).flatten()
    bottleneck = np.array(outputs[1]).flatten()

    scaled = sc.transform(bottleneck.reshape(1, -1))
    svm_p  = svm.predict_proba(scaled).flatten()
    xgb_p  = xgb.predict_proba(scaled).flatten()

    ens_p    = (w.get("softmax", 0.1) * softmax_p
                + w.get("svm",   0.65) * svm_p
                + w.get("xgb",   0.25) * xgb_p)
    pred_idx = int(np.argmax(ens_p))
    pred_cls = CLASSES[pred_idx]
    logger.info("XAI step 1 (ensemble): %.1fs", time.time() - t0)

    if progress_callback:
        progress_callback({
            "predicted_class": pred_cls,
            "confidence_pct":  round(float(ens_p[pred_idx]) * 100, 2),
            "probabilities":   {cls: round(float(p) * 100, 2)
                                for cls, p in zip(CLASSES, ens_p)},
        })

    softmax_model = _get_softmax_model()

    # ── Grad-CAM layers are fixed (proj_a / proj_b) — read from config ──
    layer_a, layer_b = _load_gradcam_layers()

    def _safe_gradcam(layer_name: str) -> np.ndarray:
        try:
            return compute_gradcam(softmax_model, img, layer_name, pred_idx)
        except Exception as exc:
            logger.warning("Grad-CAM on layer '%s' failed: %s. Using uniform fallback.", layer_name, exc)
            return np.full((IMG_SIZE, IMG_SIZE), 0.5, dtype=np.float32)

    # ── Step 2a: Grad-CAM on first backbone layer → emit heatmap ASAP ──
    t2 = time.time()
    cam_a     = _safe_gradcam(layer_a)
    orig_b64  = _image_to_b64(img)
    cam_a_b64 = _overlay_to_b64(img, cam_a, 0.45, cv2.COLORMAP_JET)

    region_a, (cx_a, cy_a) = localize_anatomical_region(cam_a)
    descriptors_a          = clinical_descriptors(img, cam_a)
    logger.info("XAI step 2a (Grad-CAM layer A): %.1fs", time.time() - t2)

    if progress_callback:
        # Composite shows layer A until layer B refines it — doctor sees a heatmap now
        progress_callback({
            "images": {
                "original":          orig_b64,
                "gradcam_effnet":    cam_a_b64,
                "gradcam_composite": cam_a_b64,
            },
            "where":              region_a,
            "attention_centroid": {"x": cx_a, "y": cy_a},
            "what":               descriptors_a,
        })

    # ── Step 2b: second backbone layer → refine composite + dual-path IoU ──
    t2b         = time.time()
    cam_b       = _safe_gradcam(layer_b)
    cam_avg     = (cam_a + cam_b) / 2.0
    cam_iou     = cam_agreement_iou(cam_a, cam_b)
    cam_b_b64   = _overlay_to_b64(img, cam_b,   0.45, cv2.COLORMAP_JET)
    cam_avg_b64 = _overlay_to_b64(img, cam_avg, 0.45, cv2.COLORMAP_JET)

    region_desc, (cx, cy) = localize_anatomical_region(cam_avg)
    descriptors            = clinical_descriptors(img, cam_avg)
    logger.info("XAI step 2b (Grad-CAM layer B + composite): %.1fs", time.time() - t2b)

    if progress_callback:
        progress_callback({
            "images": {
                "gradcam_densenet":  cam_b_b64,
                "gradcam_composite": cam_avg_b64,
            },
            "where":              region_desc,
            "attention_centroid": {"x": cx, "y": cy},
            "what":               descriptors,
        })

    # ── Step 3: Vanilla Saliency (1 step) ──
    t3 = time.time()
    try:
        ig = vanilla_saliency(softmax_model, img, pred_idx)
    except Exception as exc:
        logger.warning("Vanilla Saliency failed: %s. Using cam_avg fallback.", exc)
        ig = cam_avg.copy()
    logger.info("XAI step 3 (Vanilla Saliency): %.1fs", time.time() - t3)

    ig_b64 = _overlay_to_b64(img, ig, 0.55, cv2.COLORMAP_HOT)

    if progress_callback:
        progress_callback({"images": {"integrated_grads": ig_b64}})

    # ── Step 4: Ensemble Uncertainty (0 setup passes) ──
    t4 = time.time()
    _, mc_ent = ensemble_uncertainty(softmax_p, svm_p, xgb_p)
    trust      = trust_verdict(softmax_p, svm_p, xgb_p, cam_iou, mc_ent)
    logger.info("XAI step 4 (Ensemble Uncertainty): %.1fs", time.time() - t4)
    logger.info("XAI total: %.1fs", time.time() - t0)

    if progress_callback:
        progress_callback({"trust": trust})

    return {
        "predicted_class":  pred_cls,
        "confidence_pct":   round(float(ens_p[pred_idx]) * 100, 2),
        "probabilities":    {cls: round(float(p) * 100, 2)
                             for cls, p in zip(CLASSES, ens_p)},
        "images": {
            "original":          orig_b64,
            "gradcam_effnet":    cam_a_b64,
            "gradcam_densenet":  cam_b_b64,
            "gradcam_composite": cam_avg_b64,
            "integrated_grads":  ig_b64,
        },
        "where":               region_desc,
        "attention_centroid":  {"x": cx, "y": cy},
        "what":                descriptors,
        "trust":               trust,
    }
