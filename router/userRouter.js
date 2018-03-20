var express = require('express');
var User = require('../model/userModel');
var passwordHash = require('password-hash');

var router = express.Router();

router.get('/', function(req, res, next){
    res.locals.msg = '';
    var userData = {}
    User.getUsers(userData, function(err, result){
        if(err){
            console.log(err);
        }else{
            //res.send(result);
            res.render('user/index', {userList:result});
        }
    });
});

/**********ADD FUNCTION */
router.all('/add', function(req, res, next){
    
    res.locals.msg = '';
    res.locals.errors = {}
    if(req.method == 'GET'){
        res.render('user/add', {data:{
            first_name: '',
            last_name: '',
            email: ''
        }});
    }else{
        req.assert('first_name', 'First Name is required').notEmpty()           //Validate name
        req.assert('last_name', 'Last Name is required').notEmpty()             //Validate age
        req.assert('email', 'A valid email is required').isEmail()  //Validate email
        req.assert('password', 'Password is required').notEmpty()
        var errors = req.validationErrors()
        if(!errors){
            var userData = {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                password: passwordHash.generate(req.body.password),
            };
            User.saveUser(userData, function(err, result){
                console.log(result);
                if(err){
                    console.log(err);
                }else{
                    req.session.user = userData;
                    res.redirect('/user/');
                    //res.render('user/index', {userList:result});
                }
            });
        }else{
            var error_msg = ''
            errors.forEach(function(error) {
                error_msg += error.msg + '<br/>'
                res.locals.errors[error.param] = error.msg;
            });  
            res.locals.msg = error_msg;   
            //console.log(error_msg);         
            //req.flash('error', error_msg)        
                  
            /**
             * Using req.body.name 
             * because req.param('name') is deprecated
             */
            res.render('user/add', {data:req.body})
        }
    }
});
/*******************ADD FUNCTION ENDED  */

/*********************EDIT FUNCTION START */
router.all('/edit/(:id)', function(req, res, next){
    res.locals.msg = '';
    res.locals.errors = {} 
    if(req.method == 'GET'){
        var userData = {
            id : req.params.id
        };
        User.getUsers(userData, function(err, result){
            if(err){
                console.log(err);
            }else{
                console.log(result[0]);
                if(result.length> 0){
                    res.render('user/edit', {user:result[0]});
                }else{
                    res.locals.msg = 'User not found.'
                    res.redirect('/user/') 
                }
            }
        })  
    }else{
        req.assert('first_name', 'First Name is required').notEmpty()           //Validate name
        req.assert('last_name', 'Last Name  is required').notEmpty()             //Validate age
        req.assert('email', 'A valid email is required').isEmail()  //Validate email
    
        var errors = req.validationErrors()
        if(!errors){

            User.updateUser(req.body, function(err, result){
                console.log(result);
                if(err){
                    console.log(err);
                }else{
                    res.redirect('/user/');
                    //res.render('user/index', {userList:result});
                }
            });
        }else{
            var error_msg = '';
            console.log(errors);
            errors.forEach(function(error) {
                error_msg += error.msg + '<br/>';
                res.locals.errors[error.param] = error.msg; 
            });  
            res.locals.msg = error_msg; 
            console.log(res.locals.errors);
            res.render('user/edit', {user:req.body});
        }
    }
});
/*******************EDIT FUNCTION ENDED  */

/**************LOGIN FUNCTION STARTS HERE ************/
router.all('/login', function(req, res, next){
    res.locals.msg = '';
    res.locals.errors = {} 
    if(req.method == 'GET'){
        res.render('user/login', {title: 'User Login', data:{email:'', password:''}})
    }else{
        req.assert('email', 'A valid email id is required').isEmail();
        req.assert('password', 'Passwors is required.').notEmpty();
        var errors = req.validationErrors();
        if(errors){
            errors.forEach(function(error){
                res.locals.errors[error.param] = error.msg;
            });
            res.render('user/login', {data:req.body});
        }else{            
            User.getUserForLogin(req.body, function(err, result){
                if(err){
                    console.log(err);
                }else{
                    if(result.length > 0 && passwordHash.verify(req.body.password, result[0].password)){
                        req.session.isLoggedIn = true;
                        console.log(req.session.isLoggedIn);
                        res.redirect('/user/login')
                    }else{
                        res.locals.msg = 'Invalid email id or password has entered.';
                        res.render('user/login', {data:req.body});
                    }
                    
                }
            })
            
        }
    }
})
/**************LOGIN FUNCTION ENDS HERE ************/

module.exports = router;