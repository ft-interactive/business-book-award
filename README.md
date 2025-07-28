Business book of the year award
===============================

## In development

If you don't already have gulp and foreman installed on your machine, run the below in your terminal.   
```
$ npm install --global gulp-cli
$ npm install -g foreman

```

If you already have these packages installed, you can skip to the below: 

```
$ npm install 
$ gulp && nf start --port=5001
```
While that’s running, in a new terminal tab run 
```
$ npm run watch
```

Go to http://localhost:3000

If you see a page with content but no styling, try running 'gulp' in a third terminal tab and refresh.


## See changes on your local host

When you make changes within your code, they are not directly rendered on your local host as a consequence of a cached version of the site existing. To avoid this in the terminal, run: 

```
$ gulp

```

Then within the views/layout.html file, update the query string (ex/ ?v=1) on the link tag of the main.css or script tag of the main.bundle.js, depending on changes implemented. By adding the query string, we are able to re-render our application without seeing the cached version of it.  


## AWS Migration
As part of the general migration to AWS from Heroku, the bussiness-book-award site has been migrated as a Hako application. Following points describe changes to the development and deployment:

1. Added Dockerfile for containarizing the application

2. Added Hako config following instructions from:
- https://github.com/Financial-Times/hako-cli
- https://github.com/Financial-Times/hako-cli/wiki

3. Added CircleCI pipeline for building and deploying application.

Useful commands for testing local docker build:

Build local Docker image:
```
docker build -t business-books-of-the-year:{version_number} .
```

Run docker container:
```
docker run --rm -it -p 3000:3000 business-books-of-the-year:{version_number}
```

### Hako applications:
Development and Production Hako applications have been created, the configuration files are available in folder hako-config. Applications are deployed in hako environments story-finding-dev and story-innovation-prod.

### Deployment:
CircleCI pipeline is configured to build Docker Images and deploy them to the Hako applications. The pipeline gets triggered pushing to the repository. Changes are deployed by default to the dev environment, production changes are deployed only when merging to main.


#### Dev:

- Hako app: business-books-of-the-year
- Hako environment: story-finding-dev
- App link: https://business-books-of-the-year.eu-west-1.story-finding-dev.ftweb.tech/
- IG rounter link: https://ig-staging.ft.com/sites/business-book-award/


#### Prod:


- Hako app: business-books-of-the-year
- Hako environment: story-innovation-prod
- App link: https://business-books-of-the-year.eu-west-1.story-innovation-prod.ftweb.tech/
- IG rounter link:
