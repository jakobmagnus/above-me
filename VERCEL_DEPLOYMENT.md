# Vercel Deployment Instructions

## Adding the FlightRadar24 API Key to Vercel

To fix the "Failed to load flights: API Error: 503" error, you need to add the FlightRadar24 API key as an environment variable in Vercel.

### Steps:

1. Go to your Vercel project dashboard (e.g., https://vercel.com/your-username/your-project-name)
2. Click on the project name
3. Navigate to **Settings** in the top menu
4. Click on **Environment Variables** in the left sidebar
5. Add a new environment variable:
   - **Key**: `FLIGHTRADAR24_API_KEY`
   - **Value**: Your FlightRadar24 API key (contact the repository owner or check your secure key storage)
   - Select all environments: **Production**, **Preview**, and **Development**
6. Click **Save**
7. **Redeploy** your application:
   - Go to the **Deployments** tab
   - Click the three dots (...) on the latest deployment
   - Select **Redeploy**
   - Confirm the redeployment

### Verify the Deployment

After redeployment completes, visit your application URL and check that flights are loading correctly. The 503 error should be resolved once the environment variable is configured.

### Local Development

For local development, the API key has already been added to `.env.local` in your local repository. This file is gitignored and won't be committed to source control.

## Alternative: Using Vercel CLI

You can also add the environment variable using the Vercel CLI:

```bash
vercel env add FLIGHTRADAR24_API_KEY
```

When prompted, paste the API key value and select the environments where it should be available.
