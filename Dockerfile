FROM node:20-alpine

WORKDIR /app

COPY package*.json tsconfig*.json .mocharc.js ./

RUN npm i

CMD ["npm", "run", "test:integration"]
