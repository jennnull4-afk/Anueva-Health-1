# Auneva Research

## Deploying to Vercel

Vercel detects this as a Next.js application. Import the repository, leave the build command as `npm run build`, and deploy with the default Next.js framework preset.

Add these environment variables in Vercel for each environment that processes orders:

| Variable | Required | Purpose |
| --- | --- | --- |
| `PRYMALAB_API_KEY` | Yes | Server-side PrymaLab API credential. |
| `PRYMALAB_WEBHOOK_SECRET` | Yes | Verifies incoming PrymaLab webhooks. |
| `PRYMALAB_API_BASE_URL` | Yes | PrymaLab API base URL. |
| `UPSTASH_REDIS_REST_URL` | Yes | Durable order and webhook storage. Create an Upstash Redis database through the Vercel integration. |
| `UPSTASH_REDIS_REST_TOKEN` | Yes | Credential for the Redis database. |
| `AUNEVA_SITE_URL` | Recommended | Canonical production URL, including `https://` and no trailing slash. |

Keep all variables server-only; none should use a `NEXT_PUBLIC_` prefix. The example values and local setup are in `.env.example`.

After the first production deployment, configure PrymaLab to send signed events to:

```text
https://your-production-domain/api/webhooks/prymalab
```

Set `AUNEVA_SITE_URL` to that production domain, redeploy, and send a signed test webhook before accepting live orders.