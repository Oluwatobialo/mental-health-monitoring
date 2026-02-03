"""
Upload your local finetuned_model/ to Hugging Face so the production backend can load it.
Run once after finetune.py, then set HF_FINETUNED_MODEL_ID and HF_TOKEN on Railway/Render.

Usage:
  python upload_finetuned_to_hf.py --repo-id YOUR_USERNAME/mentalbert-finetuned
  (HF_TOKEN or HUGGING_FACE_HUB_TOKEN must be set, or use huggingface-cli login)
"""
import argparse
import os
from huggingface_hub import HfApi, create_repo

FINETUNED_DIR = os.path.join(os.path.dirname(__file__), "finetuned_model")


def main():
    parser = argparse.ArgumentParser(description="Upload finetuned_model/ to Hugging Face")
    parser.add_argument("--repo-id", required=True, help="HF repo id, e.g. Oluwatobialo/mentalbert-finetuned")
    parser.add_argument("--private", action="store_true", help="Create private repo")
    args = parser.parse_args()

    if not os.path.isdir(FINETUNED_DIR):
        raise SystemExit("finetuned_model/ not found. Run python finetune.py first.")

    token = os.environ.get("HF_TOKEN") or os.environ.get("HUGGING_FACE_HUB_TOKEN")
    if not token:
        raise SystemExit("Set HF_TOKEN or run: huggingface-cli login")

    api = HfApi(token=token)
    try:
        create_repo(args.repo_id, private=args.private, token=token, exist_ok=True)
    except Exception as e:
        print(f"Create repo: {e}")

    print(f"Uploading {FINETUNED_DIR} to https://huggingface.co/{args.repo_id} ...")
    api.upload_folder(
        folder_path=FINETUNED_DIR,
        repo_id=args.repo_id,
        repo_type="model",
        token=token,
    )
    print("Done. Set HF_FINETUNED_MODEL_ID=" + args.repo_id + " and HF_TOKEN on your backend host (e.g. Railway).")


if __name__ == "__main__":
    main()
