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
| `AUNEVA_COA_ADMIN_TOKEN` | Yes for COA staff operations | High-entropy server-only token used to create signed, httpOnly staff sessions. Without it, `/admin/coas` remains unavailable. |
| `BLOB_READ_WRITE_TOKEN` | Yes for production COA PDFs | Credential for a **private** Vercel Blob store. COA uploads fail closed on Vercel when it is absent. |
| `AUNEVA_COA_SUPPORT_EMAIL` | Optional | Reserved for a future support-email provider. Requests are currently persisted in the staff queue only; no email is sent. |
| `AUNEVA_SITE_URL` | Recommended | Canonical production URL, including `https://` and no trailing slash. |

Keep all variables server-only; none should use a `NEXT_PUBLIC_` prefix. The example values and local setup are in `.env.example`.

After the first production deployment, configure PrymaLab to send signed events to:

```text
https://your-production-domain/api/webhooks/prymalab
```

Set `AUNEVA_SITE_URL` to that production domain, redeploy, and send a signed test webhook before accepting live orders.

## COAs and Laboratory Testing

The public COA library is at `/coas-testing`; it joins only published COA records to the current PrymaLab-derived catalog. Documents are associated with exact catalog IDs and required lots. Draft and archived records, including their documents, are never available from public pages or download routes.

For staff setup, create a private Vercel Blob store, provision Upstash Redis, and set `AUNEVA_COA_ADMIN_TOKEN` to a long random secret. Staff then sign in at `/admin/coas/login` and can create a new record, publish/draft/archive it, or create a replacement record while retaining history. Each upload validates the PDF magic bytes and enforces a 15 MB maximum.

Outside Vercel, COA records use `data/coas.json` and private development PDFs use `data/coa-documents/`. These are local development fallbacks only. Production requires Redis and private Vercel Blob; missing services cause COA writes or document uploads to fail rather than falling back to transient storage. Customer requests are kept in the staff queue. Configure an actual support-email provider before claiming email delivery or automated staff notification.