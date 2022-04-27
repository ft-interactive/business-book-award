Business book of the year award
===============================

## In development

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
