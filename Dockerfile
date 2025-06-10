FROM node:18-alpine

WORKDIR /app
RUN chown node:node /app

# Set environment variable NODE_ENV if provided, default to 'production'
# ARG NODE_ENV=production
# ENV NODE_ENV=$NODE_ENV

USER node

WORKDIR /app

# Copy package.json and gulpfile.js first to leverage Docker cache
# This is needed for npm ci step to install dependencies
# gulp files and client directory are needed for serving static css, js, img files
COPY --chown=node:node package*.json ./
COPY --chown=node:node gulp*.js ./
COPY --chown=node:node client/ ./client/

# for debugging purposes
# RUN node --version && npm --version && ls

RUN npm ci


# for debugging purposes
# RUN ls -l node_modules/.bin

COPY . ./

# Switch to root user to run npm prune
USER root

# Remove dev dependencies and unnecessary files
RUN npm prune --production

USER node

CMD ["node", "--harmony", "./app.js"]

