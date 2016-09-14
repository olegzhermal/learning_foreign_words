var app   = require('koa')(),
    mount = require('koa-mount'),
    serve = require('koa-static');

var port = process.env.PORT ? process.env.PORT : 8000;

app
    .use(mount('/', require('./routMap.js')))
    .use(serve('bower_components'))
    .use(serve('public/js'))
    .use(function *() {
      this.body = 'Invalid URL!!!';
      console.log(this.request.url + " NOT FOUND");
      // or another callback
    });

app.listen(port);
console.log('Koa is listening on port ' + port);
