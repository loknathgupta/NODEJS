var express = require('express');
var User = require('../model/userModel');

var router = express.Router();

router.get('/', function(req, res, next){
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
    if(req.method == 'GET'){
        res.render('user/add');
    }else{
        req.assert('first_name', 'First Name is required').notEmpty()           //Validate name
        req.assert('last_name', 'Last Name  is required').notEmpty()             //Validate age
        req.assert('email', 'A valid email is required').isEmail()  //Validate email
    
        var errors = req.validationErrors()
        if(!errors){
            var userData = {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                password: req.body.password,
            };
            User.saveUser(userData, function(err, result){
                console.log(result);
                if(err){
                    console.log(err);
                }else{
                    res.redirect('/user/');
                    //res.render('user/index', {userList:result});
                }
            });
        }else{
            var error_msg = ''
            errors.forEach(function(error) {
                error_msg += error.msg + '<br/>'
            });  
            res.locals.msg = error_msg;   
            console.log(error_msg);         
            //req.flash('error', error_msg)        
            
            /**
             * Using req.body.name 
             * because req.param('name') is deprecated
             */ 
            res.render('user/add', { 
                title: 'Add New User',
                name: req.body.name,
                age: req.body.age,
                email: req.body.email
            })
        }
    }
});
/*******************ADD FUNCTION ENDED  */

/*********************EDIT FUNCTION START */
router.get('/edit/(:id)', function(req, res, next){
    var userData = {
        id : req.params.id
    };
    User.getUsers(userData, function(err, result){
        if(err){
            console.log(err);
        }else{
            console.log(result[0]);
            res.render('user/edit', {user:result[0]});
        }
    })    
});

router.post('/edit/(:id)', function(req, res, next){
    // var userData = {
    //     first_name: req.body.first_name,
    //     first_name: req.body.name,
    //     email: req.body.email,
    //     id: req.body.id,
    // };
    User.updateUser(req.body, function(err, result){
        console.log(result);
        if(err){
            console.log(err);
        }else{
            res.redirect('/user/');
            //res.render('user/index', {userList:result});
        }
    });
});
/*******************ADD FUNCTION ENDED  */

/*****************EDIT FUNCTION ENDS HERE */

module.exports = router;