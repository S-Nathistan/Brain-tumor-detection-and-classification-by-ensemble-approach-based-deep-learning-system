# 🧠 NeuroSight — Brain Tumor Detection & Classification System

NeuroSight is a full-stack clinical platform that detects and classifies brain tumors from MRI scans using an **ensemble deep learning approach**, then wraps the prediction in a complete care workflow: clinician dashboard, patient mobile app, explainable-AI heatmaps, a medical chatbot, tamper-evident blockchain medical records, and real-time emergency alerts.

The model classifies an MRI into one of four classes: **glioma**, **meningioma**, **pituitary**, or **no tumor**.

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Detailed Setup](#-detailed-setup)
  - [1. Clone the repository](#1-clone-the-repository)
  - [2. Database](#2-database)
  - [3. Backend](#3-backend)
  - [4. Frontend dashboard](#4-frontend-dashboard)
  - [5. Mobile app](#5-mobile-app)
  - [6. Chatbot microservice (optional)](#6-chatbot-microservice-optional)
  - [7. Blockchain ledger (optional)](#7-blockchain-ledger-optional)
- [Running the System](#-running-the-system)
- [Default Login](#-default-login)
- [Testing the Database Connection](#-testing-the-database-connection)
- [Ports](#-ports)
- [Project Structure](#-project-structure)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

---

## ✨ Features

- **Ensemble tumor classifier** — a WaveFusionNet deep model (wavelet features + EfficientNetV2 + DenseNet201 with channel/spatial attention) combined with SVM and XGBoost meta-classifiers, fused by learned ensemble weights.
- **Explainable AI** — Grad-CAM heatmaps highlight the regions driving each prediction.
- **Clinician dashboard** (React) — upload MRIs, review results, manage patients, admissions, documents, and treatment plans.
- **Patient mobile PWA** — installable app with internationalization (i18n), daily check-ins, medication logs, and an SOS button.
- **Medical chatbot** — DistilBERT + FAISS RAG microservice with an automatic TF-IDF fallback when the model is unavailable.
- **Blockchain medical records** — encrypted patient history pinned to IPFS (Pinata) and anchored on an Ethereum-compatible chain via a `MedicalHistoryLedger` smart contract.
- **Real-time emergency alerts** — mobile SOS pushes live `emergency_alert` events to clinician dashboards over Socket.IO.
- **Secured PHI** — JWT-gated access to MRI images and clinical documents; `SECRET_KEY` is validated at startup.

---

## 🏗️ Architecture

```
                ┌─────────────────────┐      ┌──────────────────────┐
                │  Frontend dashboard  │      │   Mobile PWA (i18n)  │
                │   React + Vite :5173 │      │   React + Vite :5174 │
                └──────────┬───────────┘      └──────────┬───────────┘
                           │ REST + Socket.IO            │ REST
                           └──────────────┬──────────────┘
                                          │
                              ┌───────────▼────────────┐
                              │   FastAPI backend :8000 │
                              │  ensemble model + XAI   │
                              └───┬─────────┬───────┬───┘
                                  │         │       │
                   ┌──────────────▼─┐  ┌────▼────┐  ▼────────────────┐
                   │ PostgreSQL DB  │  │ Chatbot │  │ Blockchain /    │
                   │  brain_tumor   │  │  :8001  │  │ IPFS ledger     │
                   └────────────────┘  └─────────┘  └─────────────────┘
```

---

## ⚙️ Tech Stack

| Layer            | Technology                                                        |
| ---------------- | ----------------------------------------------------------------- |
| **Frontend**     | React 19 + Vite, Tailwind CSS, Socket.IO client                   |
| **Mobile**       | React 19 + Vite PWA, react-i18next                                 |
| **Backend**      | FastAPI (Python 3.11), SQLAlchemy, python-jose (JWT)              |
| **ML model**     | TensorFlow / Keras (`.keras`), scikit-learn SVM, XGBoost          |
| **Database**     | PostgreSQL                                                         |
| **Chatbot**      | DistilBERT + FAISS (RAG), TF-IDF fallback                          |
| **Blockchain**   | Solidity + Hardhat, IPFS (Pinata), Fernet encryption              |

---

## 🧰 Prerequisites

- **Python 3.11**
- **Node.js** 18+ and **npm**
- **PostgreSQL** (with pgAdmin recommended)
- **Git**
- *(optional)* **Hardhat / a local Ethereum node** for the blockchain feature

---

## 🚀 Quick Start

```powershell
# 1. Clone
git clone https://github.com/TharunKalugalla/Brain-tumor-detection-and-classification-by-ensemble-approach-based-deep-learning-system.git
cd Brain-tumor-detection-and-classification-by-ensemble-approach-based-deep-learning-system

# 2. Create the PostgreSQL database "brain_tumor" (see Database section)

# 3. Backend env
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate
python -m pip install --upgrade pip setuptools wheel
pip install --no-cache-dir -r requirements.txt
copy .env.example .env        # then edit .env (set DATABASE_URL + a real SECRET_KEY)
cd ..

# 4. Frontend deps
npm --prefix frontend install

# 5. Launch everything (backend + dashboard, plus mobile/chatbot if available)
npm start
```

`npm start` runs the managed launcher, frees stale ports, starts each service, and waits for the backend `/health` endpoint (model warmup can take **5–15 minutes** the first time). Stop everything with `npm stop`.

---

## 🔧 Detailed Setup

### 1. Clone the repository

```bash
git clone https://github.com/TharunKalugalla/Brain-tumor-detection-and-classification-by-ensemble-approach-based-deep-learning-system.git
cd Brain-tumor-detection-and-classification-by-ensemble-approach-based-deep-learning-system
```

### 2. Database

1. Open pgAdmin (or `psql`).
2. Create a database named **`brain_tumor`**.

Tables are created automatically by the backend on first startup (`Base.metadata.create_all`), and lightweight schema migrations run via `backend/update_db.py`.

### 3. Backend

From the project root:

```powershell
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate
python -m pip install --upgrade pip setuptools wheel
pip install --no-cache-dir -r requirements.txt
copy .env.example .env
cd ..
```

Then edit **`backend/.env`**:

- `DATABASE_URL` — set your PostgreSQL user/password, e.g. `postgresql+psycopg2://postgres:<yourpassword>@localhost:5432/brain_tumor`
- `SECRET_KEY` — **must** be a strong random value of at least 32 characters. The app refuses to start with the example/insecure default. Generate one:

  ```bash
  python -c "import secrets; print(secrets.token_hex(32))"
  ```

Other `.env` values (SMTP for enrollment emails, Pinata/Ethereum/Fernet for blockchain, Twilio) are optional — set them only for the features you need. See [`backend/.env.example`](backend/.env.example).

> **Model files:** the ensemble weights live in [`backend/tumor_models/`](backend/tumor_models/) (`wavefusionnet_final.keras`, `svm_clf.pkl`, `xgb_clf.pkl`, `scaler.pkl`, `ensemble_weights.json`). These are required for inference.

### 4. Frontend dashboard

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
```

### 5. Mobile app

```bash
cd mobile
npm install
npm run dev      # http://localhost:5174
```

The mobile PWA needs the backend running for its features. For testing on a real phone, expose the backend with the bundled `ngrok.exe` (`.\ngrok.exe http 8000`) and point the mobile app's `VITE_API_URL` at the tunnel URL.

### 6. Chatbot microservice (optional)

The chatbot runs as a separate FastAPI service on port **8001**. If it isn't running, the backend automatically falls back to a TF-IDF classifier (lower answer quality, no crash).

```powershell
# inside the activated backend venv
pip install -r backend/chatbot/requirements.txt
```

The transformer weights (`model.safetensors`) are **not** in git (too large) — download and place them at:

```
backend/chatbot/model/neurosight_distilbert/model.safetensors
```

(`faiss_index.bin` and `qa_dataset_final.csv` are already in the repo.) Then run:

```powershell
uvicorn backend.chatbot.microservice:app --port 8001
```

### 7. Blockchain ledger (optional)

Required only for the "Save to Blockchain" medical-history feature.

```bash
cd blockchain
npm install
npm run compile
npm run deploy:local     # against a local node, or `npm run deploy` for the ganache network
```

Set `PINATA_API_KEY`, `PINATA_SECRET_KEY`, `ETH_PRIVATE_KEY`, and `FERNET_KEY` in `backend/.env`. Generate a Fernet key with:

```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

---

## ▶️ Running the System

### Managed launcher (recommended)

From the project root:

```powershell
npm start            # backend + dashboard (+ chatbot if model present)
npm run start:mobile # same, plus the mobile PWA on :5174
npm stop             # stop all services cleanly
```

The launcher frees stale ports, starts each service detached, records PIDs to `.neurosight-pids.json`, and waits for backend warmup. To skip the warmup wait:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/start-system.ps1 -Mobile -NoWait
```

### Manual run

```powershell
# Backend (from project root — uses backend/.venv automatically)
npm run dev
# or:  uvicorn backend.main:app --reload --port 8000

# Frontend
npm run dev:frontend
# or:  cd frontend && npm run dev
```

- API docs: http://127.0.0.1:8000/docs
- Health: http://127.0.0.1:8000/health and http://127.0.0.1:8000/health/model

> **First-start warmup:** on boot the backend loads the models and compiles the TensorFlow graphs (Grad-CAM included). This is a one-time cost of several minutes; set `SKIP_WARMUP=true` in `.env` to skip it during development (the first inference request will then be slow instead).

---

## 👤 Default Login

Seed a default Super Admin account:

```powershell
# inside the activated backend venv, from project root
python backend/seed_admin.py
```

| Field    | Value                  |
| -------- | ---------------------- |
| Email    | `admin@neurosight.ai`  |
| Password | `admin123`             |

> Change this password immediately outside of local development. You can also create users through the auth endpoints in the API docs.

---

## 🧪 Testing the Database Connection

From the `backend` folder with the venv activated:

```powershell
python test_db.py
```

To test against a different database without touching your `.env`:

```powershell
$env:TEST_DATABASE_URL = "postgresql+psycopg2://<user>:<password>@<host>:5432/<dbname>"
python test_db.py
```

Never commit real credentials — set `TEST_DATABASE_URL` via environment/secret store in CI.

---

## 🔌 Ports

| Service              | URL                       |
| -------------------- | ------------------------- |
| Backend API          | http://127.0.0.1:8000     |
| API docs             | http://127.0.0.1:8000/docs |
| Frontend dashboard   | http://localhost:5173     |
| Mobile PWA           | http://localhost:5174     |
| Chatbot microservice | http://127.0.0.1:8001     |

---

## 🧱 Project Structure

```
.
├── backend/                 # FastAPI app
│   ├── core/                # config + detector (ensemble inference, Grad-CAM)
│   ├── db/                  # database session + engine
│   ├── models/              # SQLAlchemy ORM models
│   ├── routers/             # API routes (auth, results, patients, mobile, …)
│   ├── schemas/             # Pydantic schemas
│   ├── chatbot/             # DistilBERT/FAISS RAG microservice + TF-IDF fallback
│   ├── tumor_models/        # trained model artifacts (.keras, .pkl, weights)
│   ├── worker/              # background tasks
│   ├── main.py              # FastAPI entry point
│   ├── seed_admin.py        # create default Super Admin
│   ├── update_db.py         # lightweight schema migrations
│   └── requirements.txt
│
├── frontend/                # React + Vite clinician dashboard
│   └── src/
│
├── mobile/                  # React + Vite patient PWA (i18n)
│   └── src/
│
├── blockchain/              # Solidity contract + Hardhat deploy + IPFS client
│   ├── contracts/
│   ├── scripts/deploy.js
│   └── MedicalHistoryLedger.sol
│
├── scripts/                 # start-system.ps1 / stop-system.ps1 + utilities
├── docs/                    # additional documentation
├── package.json             # root scripts (start/stop/dev)
└── README.md
```

---

## 🩺 Troubleshooting

- **Backend won't start — `SECRET_KEY` error.** Set a real 32+ character `SECRET_KEY` in `backend/.env` (see [Backend setup](#3-backend)).
- **`Backend venv python not found`.** Create the venv: `cd backend; py -3.11 -m venv .venv; pip install -r requirements.txt`.
- **First request is very slow / `/health/model` is degraded.** The model is still warming up. Wait, or set `SKIP_WARMUP=true` for dev.
- **Chatbot answers are low quality.** The microservice on :8001 isn't running (TF-IDF fallback in use). Install its deps and download `model.safetensors` (see [Chatbot setup](#6-chatbot-microservice-optional)).
- **Dashboard doesn't get live emergency alerts.** Ensure `socket.io-client` is installed in `frontend` and both backend and frontend are running.
- **Port already in use.** Run `npm stop`, or let `npm start` free stale listeners on launch.

---

## 🪪 License

This project is for academic and research purposes. Feel free to use and modify it for educational use cases.
