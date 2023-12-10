FROM node:16.20.2-alpine3.18 AS build-stage

WORKDIR /src

COPY package*.json .

COPY . .

COPY . .

RUN yarn run build

# CMD [ "npm", "run", "dev", "--", "--host", "0.0.0.0" ]
# CMD [ "yarn", "run", "dev", "--host", "0.0.0.0" ]

FROM nginx:1.25.3-alpine AS production-stage
COPY --from=build-stage /src/dist /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/nginx.conf
# EXPOSE 3001
CMD ["nginx", "-g", "daemon off;"]