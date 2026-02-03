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
