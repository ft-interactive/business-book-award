#!/bin/bash

if [ -z "$1" ]
  then
    echo "Usage: deploy.sh <target-remote>"
    exit
fi

if [ "$2" ]
  then
    echo "Deploying git tag $2"
    if [ -z $(git checkout tags/$2) ]
      then
        echo "Tag does not exist"
        exit
    fi
fi

# Store current branch and version
BRANCH=`git symbolic-ref -q --short HEAD`
VERSION=`git describe`
DEPLOY="deploy-$BRANCH"


# Create new deploy branch based on current branch
git checkout -b $DEPLOY


############################################
# Perform pre-deploy build steps - could run a grunt task here

# enure the front-end is built
cd ./node_modules/business-books-of-the-decade-frontend && npm install && bower install && grunt && cd ../..
cp -R ./node_modules/business-books-of-the-decade-frontend/dist/public ./lib
cp -R ./node_modules/business-books-of-the-decade-frontend/dist/views ./lib

echo $VERSION > .semver
git add .


#
############################################

# Commit changes
git commit -m "Deploying $VERSION to Heroku"

# Push it up to heroku, the -f ensures that heroku won't complain
git push $1 -f $DEPLOY:master

# Switch it back to the branch we were working on
git checkout $BRANCH

# Delete the deploy branch
git branch -D $DEPLOY
