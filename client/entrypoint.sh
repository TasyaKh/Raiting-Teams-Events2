#!/bin/sh

envsubst '\
$NGINX_PORT \
$DOCKER_CONTAINER_PREFIX \
$DOCKER_BE_CONTAINER_NAME \
$BE_PORT \
' \
< /etc/nginx/templates/default.conf.template > /etc/nginx/nginx.conf

exec "$@"