# MentalBERT Backend

FastAPI backend for mental health text classification (Depressed / Not Depressed). **Uses MentalBERT (fine-tuned) only**; you must run `finetune.py` once to create the `finetuned_model` folder before the API will start.

## Setup

1. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   venv\Scripts\activate   # Windows
   # or: source venv/bin/activate  # macOS/Linux
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

## Using MentalBERT

The API loads **MentalBERT (fine-tuned)** from the `finetuned_model` folder. To create it:

1. **Hugging Face access for MentalBERT**
   - Create/login: [https://huggingface.co/join](https://huggingface.co/join)
   - Accept model terms: [https://huggingface.co/mental/mental-bert-base-uncased](https://huggingface.co/mental/mental-bert-base-uncased)
   - Create a token at [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) (read access; if fine-grained, enable **Access to public gated repositories**)
   - Log in: run `python login_huggingface.py` in the backend folder and paste your token, or set `HF_TOKEN` in the environment.

2. **Fine-tune MentalBERT** (trains on Reddit mental health data: Depressed vs Not Depressed)
   ```bash
   cd backend
   python finetune.py --epochs 3 --batch_size 16 --lr 5e-5
   ```
   For a quicker run: `python finetune.py --max_samples 20000 --epochs 2`.  
   This saves the model to `./finetuned_model`.

3. **Run the API**  
   Start the backend; it will load MentalBERT from `finetuned_model` automatically.
   ```bash
   uvicorn app:app --reload --host 0.0.0.0 --port 8000
   ```
   Check [http://localhost:8000/health](http://localhost:8000/health) — it should show `"model": "MentalBERT (fine-tuned)"`.

## Run

```bash
cd backend
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

- API: http://localhost:8000  
- Docs: http://localhost:8000/docs  
- Health: http://localhost:8000/health (shows which model is loaded)

## API

- **POST /analyze**  
  Body: `{ "text": "Your journal entry..." }`  
  Returns: classification, confidence, emotions, preprocessingSteps, timestamp.
