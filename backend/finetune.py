"""
Fine-tune MentalBERT on the Mental Health Reddit Wellbeing Dataset.
Uses solomonk/reddit_mental_health_posts (Reddit mental health subreddits).
Binary task: Depressed (r/depression) vs Not Depressed (other subreddits).
"""
import os
import argparse
import torch
from datasets import load_dataset
from transformers import (
    AutoTokenizer,
    BertForSequenceClassification,
    TrainingArguments,
    Trainer,
)
try:
    from transformers import EarlyStoppingCallback
except ImportError:
    EarlyStoppingCallback = None
import numpy as np
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score

MODEL_ID = "mental/mental-bert-base-uncased"
DATASET_ID = "solomonk/reddit_mental_health_posts"
MAX_LENGTH = 512
DEFAULT_OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "finetuned_model")


def get_label(example):
    """Binary: 1 = Depressed (r/depression), 0 = Not Depressed."""
    return 1 if (example.get("subreddit") or "").lower() == "depression" else 0


def prepare_dataset(dataset, tokenizer):
    """Combine title+body, tokenize, add labels."""
    texts = []
    labels = []
    for ex in dataset:
        title = (ex.get("title") or "").strip()
        body = (ex.get("body") or "").strip()
        text = f"{title} {body}".strip()
        if not text or len(text) < 10:
            continue
        texts.append(text[:10_000])  # cap length for memory
        labels.append(get_label(ex))

    encodings = tokenizer(
        texts,
        truncation=True,
        max_length=MAX_LENGTH,
        padding="max_length",
        return_tensors=None,
    )
    return encodings, labels


def compute_metrics(eval_pred):
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=-1)
    return {
        "accuracy": accuracy_score(labels, preds),
        "f1": f1_score(labels, preds, average="binary"),
        "precision": precision_score(labels, preds, average="binary", zero_division=0),
        "recall": recall_score(labels, preds, average="binary", zero_division=0),
    }


def main():
    parser = argparse.ArgumentParser(description="Fine-tune MentalBERT on Reddit mental health dataset")
    parser.add_argument("--output_dir", type=str, default=DEFAULT_OUTPUT_DIR, help="Where to save the model")
    parser.add_argument("--epochs", type=int, default=3, help="Training epochs")
    parser.add_argument("--batch_size", type=int, default=16, help="Per-device train batch size")
    parser.add_argument("--lr", type=float, default=5e-5, help="Learning rate")
    parser.add_argument("--max_samples", type=int, default=None, help="Cap samples per split (for quick runs)")
    parser.add_argument("--val_ratio", type=float, default=0.1, help="Validation split ratio")
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    os.makedirs(args.output_dir, exist_ok=True)
    token = os.environ.get("HF_TOKEN") or os.environ.get("HUGGING_FACE_HUB_TOKEN")

    print("Loading tokenizer and model...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, token=token)
    model = BertForSequenceClassification.from_pretrained(MODEL_ID, num_labels=2, token=token)
    # Set labels so saved config works with the app (0=Not Depressed, 1=Depressed)
    model.config.id2label = {0: "Not Depressed", 1: "Depressed"}
    model.config.label2id = {"Not Depressed": 0, "Depressed": 1}

    print("Loading dataset...")
    dataset = load_dataset(DATASET_ID, split="train")
    if args.max_samples:
        dataset = dataset.shuffle(seed=args.seed).select(range(min(args.max_samples, len(dataset))))

    encodings, labels = prepare_dataset(dataset, tokenizer)
    n = len(labels)
    indices = np.random.RandomState(args.seed).permutation(n)
    val_size = int(n * args.val_ratio)
    train_idx, val_idx = indices[val_size:], indices[:val_size]

    class RedditDataset(torch.utils.data.Dataset):
        def __init__(self, encodings, labels, indices):
            self.encodings = {k: [v[i] for i in indices] for k, v in encodings.items()}
            self.labels = [labels[i] for i in indices]

        def __len__(self):
            return len(self.labels)

        def __getitem__(self, i):
            return {
                **{k: self.encodings[k][i] for k in self.encodings},
                "labels": self.labels[i],
            }

    train_ds = RedditDataset(encodings, labels, train_idx)
    val_ds = RedditDataset(encodings, labels, val_idx)
    print(f"Train size: {len(train_ds)}, Val size: {len(val_ds)}")

    training_args = TrainingArguments(
        output_dir=args.output_dir,
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.batch_size,
        per_device_eval_batch_size=args.batch_size * 2,
        learning_rate=args.lr,
        warmup_ratio=0.1,
        weight_decay=0.01,
        logging_steps=50,
        eval_strategy="epoch",
        save_strategy="epoch",
        save_total_limit=1,
        load_best_model_at_end=True,
        metric_for_best_model="f1",
        greater_is_better=True,
        seed=args.seed,
    )

    callbacks = [EarlyStoppingCallback(early_stopping_patience=1)] if EarlyStoppingCallback else []
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_ds,
        eval_dataset=val_ds,
        compute_metrics=compute_metrics,
        callbacks=callbacks,
    )

    print("Starting training...")
    trainer.train()
    trainer.save_model(args.output_dir)
    tokenizer.save_pretrained(args.output_dir)
    # Ensure config has id2label for the app
    model.config.save_pretrained(args.output_dir)
    print(f"MentalBERT fine-tuned model and tokenizer saved to {args.output_dir}")
    print("Restart the API; it will use this model automatically.")


if __name__ == "__main__":
    main()
