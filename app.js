var http = require('http');
var express = require('express');

var app = express();

app.set('view engine', 'ejs');
/************Body Parser */
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));
/********************** */

/***************SESSION ************/
var cookieParser = require('cookie-parser');
var session = require('express-session');
app.use(cookieParser());
app.use(session({
    secret: "Node_Js",
    name: "Node_Js",
    proxy : true,
    resave :true,
    saveUninitialized : true
}));

function checkSignIn(req, res, next){
    console.log(req.url);
    console.log(req.session.isLoggedIn);
    if(req.url == '/user/login'){
        next();
    }
    console.log(req.session.isLoggedIn);
    if(req.session.isLoggedIn){
       next();     //If session exists, proceed to page
    } else {
       console.log('User is not logged In');
       res.redirect('/user/login')
       next();  //Error, trying to access unauthorized page!
    }
 }
 app.use('/', checkSignIn);
/***************ENDED HERE SESSION */

/** Express Validator Middleware for Form Validation */ 
var expressValidator = require('express-validator')
app.use(expressValidator())
/************Validation ended here *******************/

/*************ROTUNG PART GOES HERE */
var userRouter = require('./router/userRouter');
app.use('/user', userRouter);
/*******ROUTING ENDS HERE */

var server = http.createServer(app).listen('7878');
console.log('Server is serted and listening on 7878');

