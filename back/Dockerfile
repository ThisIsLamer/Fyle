FROM node:latest

RUN mkdir /root/app
WORKDIR /root/app

COPY package.json .
COPY package-lock.json .
RUN npm install -g npm
RUN npm ci

COPY ./src/ ./src/
COPY tsconfig.json .
COPY tsconfig.build.json .

ENTRYPOINT ["npm", "run", "prod"]
