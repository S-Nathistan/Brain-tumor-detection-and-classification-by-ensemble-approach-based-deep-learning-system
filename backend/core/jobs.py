import uuid
from typing import Any

_jobs: dict[str, dict] = {}


def create_job() -> str:
    job_id = str(uuid.uuid4())
    _jobs[job_id] = {"status": "pending", "result": None, "error": None, "partial": None}
    return job_id


def set_result(job_id: str, result: Any) -> None:
    if job_id in _jobs:
        _jobs[job_id] = {"status": "done", "result": result, "error": None, "partial": None}


def set_error(job_id: str, error: str) -> None:
    if job_id in _jobs:
        _jobs[job_id]["status"] = "failed"
        _jobs[job_id]["error"] = error


def update_partial(job_id: str, data: dict) -> None:
    if job_id not in _jobs:
        return
    existing = _jobs[job_id].get("partial") or {}
    _deep_merge(existing, data)
    _jobs[job_id]["partial"] = existing


def get_job(job_id: str) -> dict | None:
    return _jobs.get(job_id)


def _deep_merge(base: dict, update: dict) -> None:
    for key, value in update.items():
        if key in base and isinstance(base[key], dict) and isinstance(value, dict):
            _deep_merge(base[key], value)
        else:
            base[key] = value
