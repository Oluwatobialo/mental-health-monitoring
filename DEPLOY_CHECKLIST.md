# Deploy checklist – do these in order

Follow these steps so your Vercel frontend and Railway backend work together globally.

---

## Step 1: Upload model to Hugging Face (run once on your PC)

In **PowerShell** (in the project folder):

```powershell
cd "c:\Users\Oluwatobi Alo\Downloads\Mental Health Monitoring System\backend"
$env:HF_TOKEN = "YOUR_HUGGING_FACE_TOKEN"
python upload_finetuned_to_hf.py --repo-id Oluwatobialo/mentalbert-finetuned --private
```

- Replace `YOUR_HUGGING_FACE_TOKEN` with your token from https://huggingface.co/settings/tokens  
- If you already ran `python login_huggingface.py`, you can try without `$env:HF_TOKEN` (token may be saved).

---

## Step 2: Deploy backend on Railway

1. Go to **https://railway.app** → Sign in with **GitHub**.
2. **New Project** → **Deploy from GitHub repo** → choose **Oluwatobialo/mental-health-monitoring**.
3. Click the new service → **Settings** → **Root Directory** → set to **`backend`** → Save.
4. **Variables** (or **Settings** → **Variables**): add these (replace values where needed):

   | Name | Value |
   |------|--------|
   | `HF_FINETUNED_MODEL_ID` | `Oluwatobialo/mentalbert-finetuned` |
   | `HF_TOKEN` | Your Hugging Face token (same as step 1) |
   | `CORS_ORIGINS` | Your Vercel URL, e.g. `https://mental-health-monitoring-xxxx.vercel.app` |

5. Trigger a deploy (e.g. **Deploy** or push a commit). Wait until it’s running.
6. Open **Settings** → **Networking** → **Generate Domain** (or use the default). **Copy the URL** (e.g. `https://mental-health-monitoring-production.up.railway.app`). This is your **backend URL**.

---

## Step 3: Connect Vercel frontend to the backend

1. Go to **https://vercel.com** → your **mental-health-monitoring** project.
2. **Settings** → **Environment Variables**.
3. Add:
   - **Name:** `VITE_API_URL`  
   - **Value:** the **backend URL** from Step 2 (e.g. `https://mental-health-monitoring-production.up.railway.app`)  
   - Apply to **Production** (and **Preview** if you want).
4. **Deployments** → open the latest → **⋯** → **Redeploy** (so the new env is used).

---

## Done

Open your Vercel site and use **Analyze Entry**. It will call the Railway backend and MentalBERT will run in the cloud.
