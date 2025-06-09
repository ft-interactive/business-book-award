FROM node:18

# -alpine
# need to be removed because of libraries compilation incompatibility with alpine images

WORKDIR /app
RUN chown node:node /app

# Set environment variable NODE_ENV if provided, default to 'production'
# ARG NODE_ENV=production
# ENV NODE_ENV=$NODE_ENV

USER node

WORKDIR /app

COPY --chown=node:node package*.json ./
COPY --chown=node:node gulp*.js ./
COPY --chown=node:node client/ ./client/

RUN node --version && npm --version 

RUN ls 

RUN npm ci 
# --production needs to be removed, because dev depencancies are needed for the build
# TODO: investigate if dependencies need to be moved from devDependencies to dependencies

RUN ls -l node_modules/.bin

COPY . ./

RUN npx gulp


CMD ["node", "--harmony", "./app.js"]

