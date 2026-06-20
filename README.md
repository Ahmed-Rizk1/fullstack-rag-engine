# Full-stack Rag Engine


A complete, production-ready Full-Stack Retrieval-Augmented Generation (RAG) system building an AI Data Assistant. This project elegantly fuses a scalable Python FastAPI backend with a minimalist, high-performance React frontend.

## 🚀 Key Features

* **Intelligent File Processing:** Instantly ingest PDFs, TXTs, and DOCXs. Extracts text asynchronously without blocking the API.
* **Vector Embeddings via Qdrant/PgVector:** Leverages state-of-the-art embedding models to compute semantic chunks and store them flexibly.
* **Abstract Stores Factory**: Easily swap out your Vector Databases (Qdrant to PgVector) or LLM Providers (OpenAI to Local Ollama/Cohere) using environment switches.
* **Asynchronous Background Workers (Celery & RabbitMQ):** Handles large document chunking and LLM index ingestion elegantly in the background.
* **Full-Stack Minimalist UI:** Includes a standalone React application modeling a distraction-free, modern "Glassmorphism" interface. Dark & Light mode supported internally.
* **Complete Observability:** Features pre-configured Prometheus metrics, Grafana dashboards, and Flower for realtime worker task visualization.

## 🏗️ Architecture Stack

* **Frontend:** React, Vite, CSS3, Lucide-Icons
* **Backend:** Python 3.10, FastAPI, SQLAlchemy, Alembic
* **Databases:** PostgreSQL, Qdrant / PgVector, Redis
* **AI & NLP:** Langchain, OpenAI / Local LLMs (Ollama)
* **Message Broker:** RabbitMQ + Celery
* **Infrastructure:** Docker Compose, Nginx

## 🛠️ Quick Start Guide

### 1. Requirements
- Python 3.10+
- Docker & Docker Compose
- Node.js (for the frontend UI)

### 2. Environment Setup
Fill out the variables in `.env` inside `src/` and the environment variables inside `docker/env/`. Ensure you provide your own `OPENAI_API_KEY` or configure Local Ollama.

### 3. Spin Up Infrastructure (Docker)
This boots up PostgreSQL, Redis, RabbitMQ, Qdrant, Prometheus, Grafana, and Nginx.
```bash
cd docker
docker-compose up -d --build
```
*(By default, this also runs the FastAPI backend and Celery workers as containers)*

### 4. Run the React Web UI
Enjoy the visually stunning frontend interface:
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173` in your browser.

## 📡 Essential Endpoints & Ports

- **React Frontend**: `http://localhost:5173`
- **FastAPI Docs**: `http://localhost:8000/docs`
- **Flower Dashboard**: `http://localhost:5555`
- **Grafana Metrics**: `http://localhost:3000`

## ⚙️ How to use the Frontend App
1. Look for the **Paperclip icon** inside the main input bar and click to upload your document.
2. Select the **gear icon** (top right) to open the Advanced Setup panel. Set your desired **Chunk Size** and **Overlap**, then hit **Process & Vectorize Document**.
3. Close the settings panel and begin querying your document using the chat interface!


