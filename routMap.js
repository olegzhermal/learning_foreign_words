'use strict'

var router = require('koa-router')(),
    dotJS  = require("dot"),
    util = require('util'),
    parseBody = require('co-body'),
    moment = require('moment');

dotJS.templateSettings.strip = false;
var dot = dotJS.process({path: "./views"});

router
    .get('/', function* (next){
        this.body = dot.index();
        // this should be done right after authorization 1 time a day:
        // look what words have dates older than current date
        // and update them to current date
        var mongo = this.mongo.db(process.env.DB).collection(process.env.COLLECTION);
        mongo.find().toArray().then(function(result){
            result.forEach(function(doc){
                if(moment().isAfter(moment(doc.date,'DD-MM-YYYY'), 'day')){
                    mongo.updateOne(
                        {'word':doc.word},
                        {
                            $set: { "date": moment().format('DD-MM-YYYY') }
                        }, function(err, results) {
                            if (!err) {
                                resolve('Repetition date for '+doc.word+' changed to '+newDate);
                                console.log('Repetition date for '+doc.word+' changed to '+moment().format('DD-MM-YYYY'));
                            } else {
                                resolve('There was some error while updating data. Try update later');
                            }
                        });
                };
            })
        })
    })
    .get('/getInitialState', function* (next){
        var mongo = this.mongo.db(process.env.DB).collection(process.env.COLLECTION);
        var cursor = mongo.find().toArray();
        this.body = yield cursor;
    })
    .post('/getWordToRepeat', function* (next){
        var body = yield parseBody(this);
        var counter = parseInt(body.counter);

        var mongo = this.mongo.db(process.env.DB).collection(process.env.COLLECTION);

        var randomWordNumber = function getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min)) + min;
        }

        var randomWord = new Promise(function(resolve){
            var dateAsStringQuery = {date:moment().format('DD-MM-YYYY')};
            mongo.find(dateAsStringQuery).count(function(err, count){
                resolve(mongo.find(dateAsStringQuery).limit(-1).skip(counter).next());
            })
        })

        this.body = yield randomWord;

    })
    .post('/getCounterMax', function* (next){
        var mongo = this.mongo.db(process.env.DB).collection(process.env.COLLECTION);
        var body = yield parseBody(this);
        var counter = parseInt(body.counter);

        var promiseCounterMax = new Promise(function(resolve){
            var dateAsStringQuery = {date:moment().format('DD-MM-YYYY')};
            mongo.find(dateAsStringQuery).count(function(err, count){
                resolve({counterMax:count});
            })
        })

        this.body = yield promiseCounterMax;

    })
    .post('/repeatTomorrow', function* (next){
        var mongo = this.mongo.db(process.env.DB).collection(process.env.COLLECTION);
        var query = yield parseBody(this);
        var newDate = moment().add(1,'days').format('DD-MM-YYYY');

        var promiseToChangeDate = new Promise (function(resolve){
            mongo.updateOne(
                query,
                {
                    $set: { "date": newDate }
                }, function(err, results) {
                    if (!err) {
                        resolve('Repetition date for '+query.word+' changed to '+newDate);
                        console.log('Repetition date for '+query.word+' changed to '+newDate);
                    } else {
                        res('There was some error while updating data. Try update later');
                    }
                });
        });

        this.body = yield promiseToChangeDate;
    })
    .post('/repeatLater', function* (next){
        var mongo = this.mongo.db(process.env.DB).collection(process.env.COLLECTION);
        var query = yield parseBody(this);
        var newDate = moment().add(7,'days').format('DD-MM-YYYY');

        var promiseToChangeDate = new Promise (function(resolve){
            mongo.updateOne(
                query,
                {
                    $set: { "date": newDate }
                }, function(err, results) {
                    if (!err) {
                        resolve('Repetition date for '+query.word+' changed to '+newDate);
                        console.log('Repetition date for '+query.word+' changed to '+newDate);
                    } else {
                        res('There was some error while updating data. Try update later');
                    }
                });
        });

        this.body = yield promiseToChangeDate;
    })
    .post('/saveData', function* (next){
        var query = yield parseBody(this);
        var mongo = this.mongo.db(process.env.DB).collection(process.env.COLLECTION);

        var promiseSavingToDB = new Promise(function(resolve) {
            mongo.insert(query, function(err, doc) {
              console.log('error: '+util.inspect(err));
              console.log('document: '+util.inspect(doc));
              (!err) ?
              resolve('Word '+query.word + ' is saved to DB succesfully') :
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
                        resolve('There was some error while deleting');
                    }
                })
            })
        });

        var promiseToDeleteAll = Promise.all(promisesToDelete).then(function() {
            console.log(total+' document(s) deleted');
            return total+' word(s) deleted:';
        })

        this.body = yield promiseToDeleteAll;
    })
    .post('/updateData', function* (next){
        var words_list = this.mongo.db(process.env.DB).collection(process.env.COLLECTION);
        var body = yield parseBody(this);
        var promiseToUpdate = new Promise (function(res){
            words_list.updateOne(
                {word: body.word},
                {
                    $set: { "date": body.date, "description": body.description }
                }, function(err, results) {
                    if (!err) {
                        res('Data updated succesfully!');
                    } else {
                        res('There was some error while updating data. Try update later');
                    }
                });
        });
        this.body = yield promiseToUpdate;
    });

module.exports = router.middleware();
