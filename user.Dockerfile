FROM node:18 AS builder

ARG NX_API_URL="localhost:8080"

ARG NX_API_URL_02="localhost:8080"

WORKDIR /app/builder

COPY ["package.json", "yarn.lock", "./"]

RUN yarn install --production

COPY . .

RUN NX_API_URL=${NX_API_URL} NX_API_URL_02=${NX_API_URL_02} yarn build user:build:production

FROM nginx:stable-alpine

WORKDIR /usr/share/nginx/html

RUN rm -rf *

COPY --from=builder /app/builder/dist/apps/user ./

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]