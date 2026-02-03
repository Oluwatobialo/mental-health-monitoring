"""
Download MentalBERT so you can monitor progress before starting the backend.
Run: python download_mentalbert.py
Uses your HF token (from login_huggingface.py or HF_TOKEN). Progress bars show in this terminal.
"""
import os
import sys
from huggingface_hub import snapshot_download

MODEL_ID = "mental/mental-bert-base-uncased"

def main():
    token = os.environ.get("HF_TOKEN", "").strip() or True  # True = use cached login
    print(f"Downloading {MODEL_ID} ... (progress below)")
    print("Cache folder: ~/.cache/huggingface/hub/")
    try:
        path = snapshot_download(
            repo_id=MODEL_ID,
            token=token,
            local_files_only=False,
        )
        print(f"\nDone. Model cached at:\n  {path}")
        return 0
    except Exception as e:
        print(f"\nError: {e}", file=sys.stderr)
        return 1

if __name__ == "__main__":
    sys.exit(main())
