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

### 3. Fine-tuning (optional)

You can fine-tune MentalBERT on the **Mental Health Reddit Wellbeing Dataset** (Reddit mental health subreddits) for better Depressed vs Not Depressed classification. See `backend/README.md` for steps. After fine-tuning, the API automatically uses the saved model from `backend/finetuned_model` if present.
