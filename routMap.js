'use strict'

var router = require('koa-router')(),
    dotJS  = require("dot"),
    parseBody = require('co-body');

dotJS.templateSettings.strip = false;
var dot = dotJS.process({path: "./views"});

router
    .get('/', function* (next){
        this.body = dot.index();
    })
    .get('/getInitialState', function* (next){
        this.body = {word:'car', description:'a road vehicle, typically with four wheels, powered by an internal-combustion engine and able to carry a small number of people'};
    })
    .post('/saveData', function* (next){
        var body = yield parseBody(this);
        console.log('Saving data' + body);
        this.body = {result:'data saved'};
    });

module.exports = router.middleware();
