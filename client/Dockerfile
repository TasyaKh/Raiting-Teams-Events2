FROM node:16.20.2-alpine3.18 AS build

WORKDIR /src
COPY package*.json .
RUN yarn
COPY . .
RUN yarn run build-only

FROM nginx:1.25.3-alpine AS production-stage
COPY --from=build /src/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
CMD ["nginx", "-g", "daemon off;"]