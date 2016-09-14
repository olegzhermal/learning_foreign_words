var app   = require('koa')(),
    mount = require('koa-mount'),
    serve = require('koa-static'),
    mongo  = require('koa-mongo');

var port = process.env.PORT ? process.env.PORT : 8000;
console.log(process.env.DB);
app
    .use(mongo({
        host: 'localhost',
        port: 27017,
        user: '',
        pass: '',
        db: process.env.DB
      }))
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
