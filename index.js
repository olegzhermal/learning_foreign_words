var app   = require('koa')(),
    mount = require('koa-mount'),
    serve = require('koa-static'),
    mongo  = require('koa-mongo');

var port = process.env.PORT ? process.env.PORT : 8000;

process.env.ENV === 'development' ?
    (
      app.use(mongo())
    ) :
    (app.use(mongo({
      host: 'ds033086.mlab.com',
      port: 33086,
      user: 'soshace',
      pass: 'test',
      db: 'heroku_h563r00l'
    })),
    process.env.db = 'heroku_h563r00l',
    process.env.collection = 'user_words'
    )

app

    .use(mount('/', require('./routMap.js')))
    .use(serve('bower_components'))
    .use(serve('public/js'))
    .use(serve('public/css'))
    .use(function *() {
      this.body = 'Invalid URL!!!';
      console.log(this.request.url + " NOT FOUND");
      // or another callback
    });

app.listen(port);
console.log('Koa is listening on port ' + port);
