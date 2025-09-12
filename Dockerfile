FROM node:20-alpine

WORKDIR /app

RUN apk add --update go

COPY package*.json tsconfig*.json .mocharc.js ./
COPY lib/ ./lib
COPY test/ ./test

# This builds the Go binary
RUN npm i

CMD ["npm", "run", "test:integration"]
