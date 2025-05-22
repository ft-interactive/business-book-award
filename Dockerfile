FROM node:18-alpine

WORKDIR /app
RUN chown node:node /app

USER node

COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY --chown=node:node . ./

CMD ["node", "--harmony", "./app.js"]

