#!/bin/sh
# Thay backend hostname trong nginx config (Railway dùng URL thật, Docker Compose dùng http://backend:3000)
BACKEND_HOST=${BACKEND_URL:-http://backend:3000}
sed -i "s|http://backend:3000|${BACKEND_HOST}|g" /etc/nginx/conf.d/default.conf
# Railway gán port động qua $PORT
sed -i "s/listen 80/listen ${PORT:-80}/g" /etc/nginx/conf.d/default.conf
exec nginx -g "daemon off;"
