"""Phase 0 / verification: measure XAI per-step timing.

Run from project root:
    backend/.venv/Scripts/python.exe -m backend.measure_xai
"""

import logging
import sys
import time
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger("measure_xai")

from backend.core.gradcam import predict_xai, warmup_xai

TEST_IMAGE = "uploads/227a72f9-ea52-4fdb-8fb7-ef0e03ae8c5f.jpg"


def main() -> None:
    if not Path(TEST_IMAGE).exists():
        logger.error("Test image not found: %s", TEST_IMAGE)
        sys.exit(1)

    t0 = time.time()
    logger.info("=== WARMUP START ===")
    warmup_xai()
    logger.info("=== WARMUP DONE in %.1fs ===", time.time() - t0)

    for run in (1, 2):
        logger.info("=== predict_xai RUN %d START ===", run)
        t = time.time()
        result = predict_xai(TEST_IMAGE)
        logger.info(
            "=== RUN %d DONE in %.1fs - predicted: %s ===",
            run, time.time() - t, result.get("predicted_class"),
        )


if __name__ == "__main__":
    main()
