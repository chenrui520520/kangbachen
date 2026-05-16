#!/bin/sh
set -e

CONF="/etc/nginx/nginx.conf"
CERT="/etc/nginx/certs/fullchain.pem"
KEY="/etc/nginx/certs/privkey.pem"

if [ -f "$CERT" ] && [ -f "$KEY" ]; then
  if [ "${SSL_REDIRECT:-0}" = "1" ]; then
    echo "nginx: TLS certs found — HTTP→HTTPS redirect enabled"
    cp /etc/nginx/templates/ssl-redirect.conf "$CONF"
  else
    echo "nginx: TLS certs found — dual HTTP/HTTPS"
    cp /etc/nginx/templates/dual.conf "$CONF"
  fi
else
  echo "nginx: no TLS certs — HTTP only on port 80"
  cp /etc/nginx/templates/http-only.conf "$CONF"
fi

exec nginx -g "daemon off;"
