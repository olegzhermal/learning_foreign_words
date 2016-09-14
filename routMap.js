'use strict'

var router = require('koa-router')(),
    dotJS  = require("dot"),
    util = require('util'),
    parseBody = require('co-body');

dotJS.templateSettings.strip = false;
var dot = dotJS.process({path: "./views"});

router
    .get('/', function* (next){
        this.body = dot.index();
    })
    .get('/getInitialState', function* (next){
        var mongo = this.mongo.db(process.env.DB).collection(process.env.COLLECTION);
        var cursor = mongo.find().toArray();
        this.body = yield cursor;
    })
    .post('/saveData', function* (next){
        var query = yield parseBody(this);
        var mongo = this.mongo.db(process.env.DB).collection(process.env.COLLECTION);

        var promiseSavingToDB = new Promise(function(resolve) {
            mongo.insert(query, function(err, doc) {
              console.log('error: '+util.inspect(err));
              console.log('document: '+util.inspect(doc));
              (!err) ?
              resolve('Data saved succesfully') :
              resolve('There was some error while saving data to DB');
          });
        });

        this.body = yield promiseSavingToDB;
    })
    .post('/deleteData', function* (next){
        var body = yield parseBody(this);
        var mongo = this.mongo.db(process.env.DB).collection(process.env.COLLECTION);

        var total = 0;
        // creating an array of promises for delete operations
        var promisesToDelete = body.keys.map(function(currentValue){
            var document = {word:currentValue};
            return new Promise(function(resolve) {
                mongo.deleteOne(document, function(err, doc) {
                    if(!err) {
                        total++;
                        resolve();
                        console.log('deleted: '+document.word);
                    } else {
                        console.log('some error occured'+util.inspect(err));
                        resolve('Произошла ошибка при удалении');
                    }
                })
            })
        });

        var promiseToDeleteAll = Promise.all(promisesToDelete).then(function() {
            console.log(total+' document(s) deleted');
            return total+' document(s) deleted';
        })

        this.body = yield promiseToDeleteAll;
    });

module.exports = router.middleware();
