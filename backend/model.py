"""
Mental health text classification: MentalBERT (fine-tuned) only.
- Local: loads from finetuned_model/ (created by python finetune.py).
- Production: set HF_FINETUNED_MODEL_ID to your Hugging Face repo (e.g. username/mentalbert-finetuned)
  and HF_TOKEN; model will be loaded from HF at startup.
"""
import os
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

MENTALBERT_FINETUNED_DISPLAY = "MentalBERT (fine-tuned)"
MAX_LENGTH = 128
MAX_INPUT_CHARS = 800
FINETUNED_DIR = os.environ.get("FINETUNED_MODEL_DIR") or os.path.join(
    os.path.dirname(__file__), "finetuned_model"
)
# Production: load from Hugging Face if set (e.g. username/mentalbert-finetuned)
HF_FINETUNED_MODEL_ID = os.environ.get("HF_FINETUNED_MODEL_ID", "").strip() or None

_tokenizer = None
_model = None
_device = None
_loaded_model_id = None


def get_device() -> str:
    global _device
    if _device is None:
        _device = "cuda" if torch.cuda.is_available() else "cpu"
        if _device == "cpu":
            # Use a few threads to avoid contention; 2–4 is often fastest for single-sequence inference
            torch.set_num_threads(min(2, (os.cpu_count() or 2)))
    return _device


def get_loaded_model_id():
    """Return the model id/name currently loaded, or None if not loaded yet."""
    return _loaded_model_id


def _preprocessing_steps():
    """Preprocessing step labels for the UI."""
    name = get_loaded_model_id() or "model"
    return [
        "Tokenization completed",
        f"{name} tokenizer applied",
        f"Max length truncation ({MAX_LENGTH})",
        "Feature extraction completed",
        f"{name} inference complete",
    ]


def load_model():
    """Load MentalBERT (fine-tuned) from local finetuned_model/ or from Hugging Face (HF_FINETUNED_MODEL_ID)."""
    global _tokenizer, _model, _loaded_model_id  # noqa: PLW0603
    if _model is not None:
        return _tokenizer, _model
    device = get_device()
    hf_token = os.environ.get("HF_TOKEN") or os.environ.get("HUGGING_FACE_HUB_TOKEN")

    if os.path.isdir(FINETUNED_DIR):
        _tokenizer = AutoTokenizer.from_pretrained(FINETUNED_DIR)
        _model = AutoModelForSequenceClassification.from_pretrained(FINETUNED_DIR)
        _loaded_model_id = MENTALBERT_FINETUNED_DISPLAY
    elif HF_FINETUNED_MODEL_ID and hf_token:
        _tokenizer = AutoTokenizer.from_pretrained(HF_FINETUNED_MODEL_ID, token=hf_token)
        _model = AutoModelForSequenceClassification.from_pretrained(HF_FINETUNED_MODEL_ID, token=hf_token)
        _loaded_model_id = MENTALBERT_FINETUNED_DISPLAY
    else:
        raise RuntimeError(
            "MentalBERT fine-tuned model not found. Either: (1) Run python finetune.py in the backend folder, "
            "or (2) Set HF_FINETUNED_MODEL_ID and HF_TOKEN to load from Hugging Face (e.g. after uploading with upload_finetuned_to_hf.py)."
        )

    _model.to(device)
    _model.eval()
    # Optional: compile for faster repeated inference (PyTorch 2+). Set USE_TORCH_COMPILE=1 to enable.
    if os.environ.get("USE_TORCH_COMPILE") and hasattr(torch, "compile"):
        _model = torch.compile(_model, mode="default")  # noqa: PLW0603
    return _tokenizer, _model


def analyze_text(text: str) -> dict:
    """
    Run depression classification using MentalBERT (fine-tuned).
    Returns dict with classification, confidence, emotions, and preprocessing steps.
    """
    if not text or not text.strip():
        raise ValueError("Text cannot be empty")

    # Truncate early so tokenizer and model stay fast
    text = text.strip()
    if len(text) > MAX_INPUT_CHARS:
        text = text[:MAX_INPUT_CHARS].rsplit(maxsplit=1)[0] or text[:MAX_INPUT_CHARS]

    tokenizer, model = load_model()
    device = get_device()

    # Pad only to actual length (up to MAX_LENGTH) for faster inference on short text
    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        max_length=MAX_LENGTH,
        padding=True,
        return_attention_mask=True,
    )
    inputs = {k: v.to(device, non_blocking=True) for k, v in inputs.items()}

    with torch.inference_mode():
        outputs = model(**inputs)

    logits = outputs.logits[0]
    probs = torch.softmax(logits, dim=0).cpu().tolist()
    # Use model's id2label if available so we map indices correctly (e.g. 0=Non-Depression, 1=Depression)
    id2label = getattr(model.config, "id2label", None)
    if id2label is not None:
        id2label = {int(k): str(v).lower() for k, v in id2label.items()}
        depressed_idx = next((i for i, lbl in id2label.items() if "depress" in lbl and "non" not in lbl and "not" not in lbl), None)
        if depressed_idx is not None:
            prob_depressed = probs[depressed_idx]
            prob_not_depressed = 1.0 - prob_depressed
        else:
            prob_not_depressed, prob_depressed = probs[0], probs[1]
    else:
        prob_not_depressed, prob_depressed = probs[0], probs[1]
    classification = "Depressed" if prob_depressed >= prob_not_depressed else "Not Depressed"
    confidence = max(prob_depressed, prob_not_depressed)

    # Derive simple emotion-like scores from binary outcome for UI compatibility
    if classification == "Depressed":
        emotions = [
            {"label": "Sadness", "score": round(0.5 + 0.4 * confidence, 2)},
            {"label": "Fear", "score": round(0.3 + 0.3 * confidence, 2)},
            {"label": "Anger", "score": round(0.1 + 0.2 * confidence, 2)},
            {"label": "Joy", "score": round(0.1 * (1 - confidence), 2)},
            {"label": "Neutral", "score": round(0.2 * (1 - confidence), 2)},
        ]
    else:
        emotions = [
            {"label": "Joy", "score": round(0.4 + 0.4 * confidence, 2)},
            {"label": "Neutral", "score": round(0.2 + 0.2 * (1 - confidence), 2)},
            {"label": "Sadness", "score": round(0.1 * (1 - confidence), 2)},
            {"label": "Fear", "score": round(0.1 * (1 - confidence), 2)},
            {"label": "Anger", "score": round(0.05, 2)},
        ]
    emotions.sort(key=lambda x: -x["score"])

    return {
        "classification": classification,
        "confidence": round(confidence, 4),
        "emotions": emotions,
        "preprocessingSteps": _preprocessing_steps(),
    }
