"""
Run this script to log in to Hugging Face (saves your token so MentalBERT can load).
When prompted, paste your token from https://huggingface.co/settings/tokens
If HF_TOKEN is set in the environment, uses that and skips the prompt.

For gated models (MentalBERT): use a classic "Read" token, or if using a fine-grained
token, enable "Access to public gated repositories" at https://huggingface.co/settings/tokens
"""
import os
from huggingface_hub import login

if __name__ == "__main__":
    token = os.environ.get("HF_TOKEN", "").strip()
    if token:
        login(token=token)
        print("Logged in using HF_TOKEN from environment.")
    else:
        print("Paste your Hugging Face token (from https://huggingface.co/settings/tokens) then press Enter:")
        login()
