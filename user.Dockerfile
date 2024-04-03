FROM node:18 AS builder

ARG NX_API_URL="/api"

ARG NX_API_URL_02="/api2"

WORKDIR /app/builder

COPY ["package.json", "yarn.lock", "./"]

RUN yarn install --production

COPY . .

RUN NX_API_URL=${NX_API_URL} NX_API_URL_02=${NX_API_URL_02} yarn build user:build:production

FROM nginx:stable-alpine

WORKDIR /usr/share/nginx/html

RUN rm -rf *

COPY --from=builder /app/builder/dist/apps/user ./

COPY user.nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /var/cache/nginx/client_temp
RUN mkdir -p /var/cache/nginx/proxy_temp
RUN mkdir -p /var/cache/nginx/fastcgi_temp
RUN mkdir -p /var/cache/nginx/uwsgi_temp
RUN mkdir -p /var/cache/nginx/scgi_temp
RUN chown -R nginx:nginx /var/cache/nginx/
RUN chmod -R 755 /var/cache/nginx/

EXPOSE 8081

ENTRYPOINT ["nginx", "-g", "daemon off;"]