# Deployment Guide — Synthesia AI Research Assistant

This guide covers the three most practical deployment workflows for the full-stack AI Research Assistant application:

1. **Option 1: Docker Compose on a VPS / Cloud VM** (Recommended for self-hosting with persistent local SQLite and vector store).
2. **Option 2: Cloud PaaS (Railway or Render)** (Best for zero-devops deployment with persistent volumes).
3. **Option 3: Hybrid (Vercel Frontend + Render/Railway Backend)**.

---

## Environment Variables Checklist

Before deploying, ensure you have your production environment variables ready:

| Variable | Required | Description | Example |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | Optional* | Claude API Key for query planning, synthesis & RAG | `sk-ant-api03-...` |
| `SEARCH_API_KEY` | Optional* | Search provider key (Tavily, Serper, or Bing) | `tvly-...` |
| `SEARCH_PROVIDER` | No | Search provider name (`tavily`, `serper`, `bing`) | `tavily` |
| `DATABASE_URL` | No | SQLite or PostgreSQL connection string | `sqlite:////app/data/research_assistant.db` |
| `VECTOR_DB_PATH` | No | Storage path for local vector embeddings | `/app/vector_store` |
| `NEXT_PUBLIC_API_URL` | Yes (Frontend) | Public URL where the backend is hosted | `https://api.yourdomain.com` |
| `MOCK_MODE` | No | Set to `true` to test completely offline | `false` |

*\*If omitted, the backend runs in mock mode with realistic topic-specific research synthesis.*

---

## Option 1: Docker Compose on a Cloud VM (DigitalOcean, AWS, Hetzner, etc.)

This is the cleanest all-in-one setup because it preserves the local vector store and SQLite database in persistent Docker volumes.

### Steps:

1. **Provision a Linux server** (Ubuntu 22.04 LTS or 24.04 LTS, at least 1 GB RAM).
2. **Install Docker & Docker Compose**:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   ```
3. **Clone your repository**:
   ```bash
   git clone <YOUR_REPO_URL> /opt/ai-research-assistant
   cd /opt/ai-research-assistant
   ```
4. **Create your `.env` file**:
   ```bash
   cp .env.example .env
   nano .env
   ```
   Add your `ANTHROPIC_API_KEY`, `SEARCH_API_KEY`, and set `NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP:8000` (or your domain).
5. **Launch the stack**:
   ```bash
   docker compose up -d --build
   ```
6. **Verify the services**:
   - Backend API: `http://YOUR_SERVER_IP:8000/api/health`
   - Frontend UI: `http://YOUR_SERVER_IP:3000`

---

## Option 2: Deploy on Railway (Zero-DevOps Cloud)

Railway natively supports monorepos, Dockerfiles, and persistent disks.

### Deploying the Backend:
1. Log in to [railway.app](https://railway.app).
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select this repository.
4. In the service settings:
   - **Root Directory**: leave as `/` (or `backend`).
   - **Dockerfile Path**: `backend/Dockerfile`.
5. Under **Variables**, add:
   - `ANTHROPIC_API_KEY`
   - `SEARCH_API_KEY`
   - `SEARCH_PROVIDER` = `tavily`
   - `DATABASE_URL` = `sqlite:////app/data/research_assistant.db`
   - `VECTOR_DB_PATH` = `/app/vector_store`
6. Under **Volumes**, attach a persistent volume to mount path `/app/data` (to preserve SQLite database across redeploys).
7. Under **Networking**, click **Generate Domain** to get your public backend URL (e.g., `https://backend-production-xyz.up.railway.app`).

### Deploying the Frontend:
1. In the same Railway project, click **New** → **GitHub Repo** → select the same repo.
2. In the settings:
   - **Root Directory**: `frontend`.
   - **Dockerfile Path**: `frontend/Dockerfile`.
3. Under **Variables**, set:
   - `NEXT_PUBLIC_API_URL` = `https://backend-production-xyz.up.railway.app`
4. Under **Networking**, generate a public domain for the frontend.

---

## Option 3: Vercel (Frontend) + Render / Railway (Backend)

Because Next.js is developed by Vercel, deploying the frontend on Vercel provides worldwide edge CDN distribution.

### 1. Deploy the Backend to Render:
1. Go to [render.com](https://render.com) → **New Web Service**.
2. Connect your repository.
3. Configure:
   - **Runtime**: Docker
   - **Dockerfile Path**: `backend/Dockerfile`
   - **Context**: `.` (root)
4. Add Environment Variables: `ANTHROPIC_API_KEY`, `SEARCH_API_KEY`, `SEARCH_PROVIDER`.
5. Add a Disk (Render paid or persistent mount) for `/app/data`.
6. Deploy and copy your service URL (e.g. `https://research-api.onrender.com`).

### 2. Deploy the Frontend to Vercel:
1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**.
2. Select your repository.
3. In **Root Directory**, click edit and select `frontend`.
4. Under **Environment Variables**, add:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://research-api.onrender.com`
5. Click **Deploy**.

---

## Production Security & Scaling Recommendations

1. **CORS Configuration**:
   In [backend/app/main.py](file:///c:/Users/arjun/Desktop/AI_Research_Assistant/backend/app/main.py), you can restrict `allow_origins` to your production frontend domain (e.g. `["https://your-app.vercel.app"]`).
2. **Switching SQLite to Managed PostgreSQL**:
   If deploying across multi-instance clusters, change `DATABASE_URL` in your environment variables to a cloud PostgreSQL connection string:
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   ```
   Install `psycopg2-binary` or `asyncpg`. SQLAlchemy will seamlessly create tables and handle queries.
3. **Switching Vector Store to Pinecone / Weaviate**:
   The `BaseVectorStore` in [backend/app/services/vector_store.py](file:///c:/Users/arjun/Desktop/AI_Research_Assistant/backend/app/services/vector_store.py) is abstracted. Implement the class methods and assign the singleton instance to run with serverless cloud vector databases.
