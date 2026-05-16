# TLS certificates (production)

Place PEM files here for nginx HTTPS:

- `fullchain.pem` — certificate chain
- `privkey.pem` — private key

Then set in `.env`:

```env
SSL_REDIRECT=1
HTTPS_PORT=443
```

Redeploy: `./scripts/deploy.sh`

Without certs, nginx serves **HTTP only** on port 80 (suitable for local prod testing).
