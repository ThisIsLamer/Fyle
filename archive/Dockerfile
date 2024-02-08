FROM node:latest as base
USER node

RUN mkdir /home/node/fyle_backend
WORKDIR /home/node/fyle_backend

COPY --chown=node:node . ./

WORKDIR /home/node/fyle_backend/
RUN npm ci

RUN npm run build

FROM base as production