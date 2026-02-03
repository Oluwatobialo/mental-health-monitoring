# Mental Health Monitoring System (DeepEcho)

This is a code bundle for Mental Health Monitoring System. The original design is from [Figma](https://www.figma.com/design/R0VWOwMvb9pg1PqtAm9Pvg/Mental-Health-Monitoring-System). The app uses **MentalBERT** for text analysis.

## Running the app

### 1. Frontend

```bash
npm i
npm run dev
```

Frontend runs at http://localhost:3000.

### 2. Backend (MentalBERT API)

Analysis is powered by a Python backend that runs MentalBERT. Start it so "Analyze Entry" uses the real model:

```bash
cd backend
pip install -r requirements.txt
# Log in to Hugging Face (model is gated): huggingface-cli login
uvicorn app:app --reload --port 8000
```

- Backend: http://localhost:8000  
- The frontend proxies `/api/*` to the backend when using `npm run dev`.

**Hugging Face:** Accept the [MentalBERT model terms](https://huggingface.co/mental/mental-bert-base-uncased) and log in (`huggingface-cli login`) or set `HF_TOKEN` so the backend can download the model.

### 3. Fine-tuning (required for backend)

The backend uses **MentalBERT (fine-tuned) only**. You must run fine-tuning once to create `backend/finetuned_model` before the API will start. See `backend/README.md` for steps (Hugging Face access + `python finetune.py`).

### 4. Push to GitHub / run on other devices

1. **Create a new repo on GitHub:** [github.com/new](https://github.com/new) — name it e.g. `mental-health-monitoring`, leave “Add README” unchecked.
2. **Add your Git identity** (if not set):  
   `git config --global user.email "your@email.com"`  
   `git config --global user.name "Your Name"`
3. **Add remote and push** (replace `YOUR_USERNAME` and `REPO_NAME` with your GitHub username and repo name):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```
4. **On another device:** clone the repo, then run frontend (`npm i && npm run dev`) and backend (`cd backend && pip install -r requirements.txt`, then run `finetune.py` once to create `finetuned_model`, then `uvicorn app:app --reload --port 8000`). Copy `.env.example` to `.env.development` and set `VITE_API_URL=http://localhost:8000`.

---

## Deploy frontend + backend globally (Vercel + Railway)

So the app works from anywhere with the **Analyze** feature connected.

### 1. Frontend on Vercel (already done)

Your frontend is on Vercel. Note your URL (e.g. `https://mental-health-monitoring-xxx.vercel.app`).

### 2. Upload the fine-tuned model to Hugging Face

The cloud backend will load MentalBERT from Hugging Face (no need to run finetune on the server).

```bash
cd backend
# Use a repo id under your HF username (create it if needed)
python upload_finetuned_to_hf.py --repo-id Oluwatobialo/mentalbert-finetuned --private
```

Set `HF_TOKEN` or log in with `huggingface-cli login` first.

### 3. Deploy backend on Railway

1. Go to [railway.app](https://railway.app), sign in with GitHub.
2. **New Project** → **Deploy from GitHub repo** → select `Oluwatobialo/mental-health-monitoring`.
3. In the new service, open **Settings** → set **Root Directory** to `backend`.
4. **Variables** (or **Settings → Variables**): add
   - `HF_FINETUNED_MODEL_ID` = `Oluwatobialo/mentalbert-finetuned` (same as in step 2)
   - `HF_TOKEN` = your Hugging Face token (read access)
   - `CORS_ORIGINS` = your Vercel URL, e.g. `https://mental-health-monitoring-xxx.vercel.app`
5. Deploy. Railway will run `pip install -r requirements.txt` and `uvicorn app:app --host 0.0.0.0 --port $PORT`.
6. Copy the public URL (e.g. `https://mental-health-monitoring-production.up.railway.app`).

### 4. Connect frontend to backend

1. **Vercel** → your project → **Settings** → **Environment Variables**.
2. Add `VITE_API_URL` = your Railway backend URL (e.g. `https://mental-health-monitoring-production.up.railway.app`) for **Production** (and Preview if you want).
3. **Redeploy** the frontend so the new variable is used.

After this, the Vercel site will call the Railway API and **Analyze Entry** will work globally.

**Alternative to Railway:** You can use **Render** instead: create a Web Service, connect the same repo, set Root Directory to `backend`, and the same env vars. See `backend/render.yaml` for reference.
