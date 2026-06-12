#!/bin/sh
# Railway gán port động qua $PORT, thay thế vào nginx config trước khi start
sed -i "s/listen 80/listen ${PORT:-80}/g" /etc/nginx/conf.d/default.conf
exec nginx -g "daemon off;"
