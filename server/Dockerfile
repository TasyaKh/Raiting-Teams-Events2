FROM node:16.20.2-alpine3.18

WORKDIR /src

COPY . .

RUN yarn
RUN npm rebuild --verbose sharp

RUN yarn run build

CMD [ "yarn", "run", "start:dev" ]
