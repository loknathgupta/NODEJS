var http = require('http');
var express = require('express');
var path = require('path');

var app = express();

app.set('view engine', 'ejs');
//app.use(express.static(__dirname, 'public'));
app.use(express.static(path.join(__dirname, 'public')));
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
    if(req.session.isLoggedIn == undefined){
        req.session.isLoggedIn = false;
    }
    console.log(req.url);
    console.log(req.session.isLoggedIn);
    if(req.url == '/user/login'){
        next();
    }else{
        if(req.session.isLoggedIn){
            next();     //If session exists, proceed to page
        } else {
            console.log('User is not logged In');
            res.redirect('/user/login')
            next();  //Error, trying to access unauthorized page!
        }
    }
 }
 //app.use('/', checkSignIn);
/***************ENDED HERE SESSION */

/** Express Validator Middleware for Form Validation */ 
var expressValidator = require('express-validator')
app.use(expressValidator())
/************Validation ended here *******************/

/************SETTING PARAMETERS TO USE ON VIEW*********************/
app.use(function(req, res, next){
    //app.locals.usedProtocol = req.protocol;
    //app.locals.usedHost = req.get('host');
    app.locals.profilePicLocation = profilePicPath = req.protocol + "://" + req.get('host') + '/uploads/'
    //console.log(req.url);
    //console.log(app.locals.usedHost);
    next();
});
/************SETTING PARAMETERS TO USE ON VIEW ENDS HERE **********/


/*************ROTUNG PART GOES HERE */
var userRouter = require('./router/userRouter');
app.use('/user', userRouter);
/*******ROUTING ENDS HERE */

var server = http.createServer(app).listen('7878');
console.log('Server is serted and listening on 7878');

