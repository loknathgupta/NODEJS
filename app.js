var http = require('http');
var express = require('express');
var app = express();
app.set('view engine', 'ejs');

/************Body Parser */
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));
/********************** */
/**
 * Express Validator Middleware for Form Validation
 */ 
var expressValidator = require('express-validator')
app.use(expressValidator())
/************Validation ended here */

/*************ROTUNG PART GOES HERE */
var userRouter = require('./router/userRouter');
app.use('/user', userRouter);
/*******ROUTING ENDS HERE */


var server = http.createServer(app).listen('7878');

console.log('Server is serted and listening on 7878');

