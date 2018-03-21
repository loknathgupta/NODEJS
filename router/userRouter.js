var express = require('express');
var User = require('../model/userModel');
var passwordHash = require('password-hash');
var fs = require('fs');
/***********MULTIPART/FORM-DATA FILE UPLOAD SETTINGS STARTS*******/
var multer = require('multer');
const UPLOAD_PATH = 'public/uploads';
let imageFilter = function (req, file, cb) {
    // accept image only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
}
let storage = multer.diskStorage({
    destination: UPLOAD_PATH,
    filename: function (req, file, cb) {
        let extArray = file.mimetype.split("/");
        let extension = extArray[extArray.length - 1];
        cb(null, file.fieldname + '-' + Date.now() + '.' + extension)
    }
})
var upload = multer({
    //dest: `${UPLOAD_PATH}/`, 
    fileFilter: imageFilter,
    storage: storage
}); // multer configuration 
/***********MULTIPART/FORM-DATA FILE UPLOAD SETTINGS ENDS HERE*******/

var router = express.Router();

router.get('/', function (req, res, next) {
    res.locals.msg = '';
    var userData = {}
    User.getUsers(userData, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            //res.send(result);
            res.render('user/index', { userList: result });
        }
    });
});

/**********ADD FUNCTION */
router.all('/add', upload.single('pofile_pic'), function (req, res, next) {
    res.locals.msg = '';
    res.locals.errors = {}
    console.log(req.file);
    if (req.method == 'GET') {
        res.render('user/add', {
            data: {
                first_name: '',
                last_name: '',
                email: ''
            }
        });
    } else {
        req.assert('first_name', 'First Name is required').notEmpty()           //Validate name
        req.assert('last_name', 'Last Name is required').notEmpty()             //Validate age
        req.assert('email', 'A valid email is required').isEmail()  //Validate email
        req.assert('password', 'Password is required').notEmpty()
        //req.assert('pofile_pic', 'Profile picture is required').notEmpty()
        var errors = req.validationErrors()
        if (!errors) {
            let profilePicPath = req.file.filename;
            var userData = {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                password: passwordHash.generate(req.body.password),
                image: profilePicPath
            };
            User.saveUser(userData, function (err, result) {
                console.log(result);
                if (err) {
                    console.log(err);
                } else {
                    req.session.user = userData;
                    res.redirect('/user/');
                    //res.render('user/index', {userList:result});
                }
            });
        } else {
            var error_msg = ''
            errors.forEach(function (error) {
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
            res.render('user/add', { data: req.body })
        }
    }
});
/*******************ADD FUNCTION ENDED  */

/*********************EDIT FUNCTION START */
router.all('/edit/(:id)', upload.single('pofile_pic'), function (req, res, next) {
    res.locals.msg = '';
    res.locals.errors = {}
    var userData = {
        id: req.params.id
    };
    User.getUsers(userData, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            var userBeingEdit = result[0];
            if (result.length < 1) {
                User.getUsers({}, function (err, result) {
                    if (err) {
                        console.log(err);
                    } else {                        
                        res.locals.msg = 'User not found.'
                        res.render('user/index', { userList: result });
                    }
                });
            } else {
                if (req.method == 'GET') {                    
                    res.render('user/edit', { user: userBeingEdit });
                } else {
                    req.assert('first_name', 'First Name is required').notEmpty()           //Validate name
                    req.assert('last_name', 'Last Name  is required').notEmpty()             //Validate age
                    req.assert('email', 'A valid email is required').isEmail()  //Validate email

                    var errors = req.validationErrors()
                    if (!errors) {
                        let profilePicPath = false;
                        if (req.file) {
                            profilePicPath = req.file.filename;
                            console.log("NEW PIC" + profilePicPath);
                            let profilePicLocation = './public/uploads/'+userBeingEdit.image;
                            console.log(profilePicLocation);
                            fs.exists(profilePicLocation, function(exists) {
                                if(exists) {
                                  //Show in green
                                  console.log('File exists. Deleting now ...');
                                  fs.unlink(profilePicLocation);
                                } else {
                                  //Show in red
                                  console.log('File not found, so not deleting.');
                                }
                              });
                        }
                        let updateData = {
                            first_name : req.body.first_name,
                            last_name : req.body.last_name,
                            email : req.body.email
                        }
                        if(profilePicPath){
                            updateData.image = profilePicPath;
                        }
                        console.log(updateData);

                        let conditions = {
                            id:req.body.id
                        }
                        User.updateUser(updateData, conditions, function (err, result) {
                            console.log(result);
                            if (err) {
                                console.log(err);
                            } else {
                                res.redirect('/user/');
                                //res.render('user/index', {userList:result});
                            }
                        });
                    } else {
                        var error_msg = '';
                        console.log(errors);
                        errors.forEach(function (error) {
                            error_msg += error.msg + '<br/>';
                            res.locals.errors[error.param] = error.msg;
                        });
                        res.locals.msg = error_msg;
                        console.log(res.locals.errors);
                        res.render('user/edit', { user: req.body });
                    }
                }
            }

        }
    });
});
/*******************EDIT FUNCTION ENDED  */

/**************LOGIN FUNCTION STARTS HERE ************/
router.all('/login', function (req, res, next) {
    res.locals.msg = '';
    res.locals.errors = {}
    if (req.method == 'GET') {
        res.render('user/login', { title: 'User Login', data: { email: '', password: '' } })
    } else {
        req.assert('email', 'A valid email id is required').isEmail();
        req.assert('password', 'Passwors is required.').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            errors.forEach(function (error) {
                res.locals.errors[error.param] = error.msg;
            });
            res.render('user/login', { data: req.body });
        } else {
            User.getUserForLogin(req.body, function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    if (result.length > 0 && passwordHash.verify(req.body.password, result[0].password)) {
                        //req.session.isLoggedIn = true;
                        req.session.isLoggedIn = result[0];

                        console.log(req.session.isLoggedIn);
                        res.redirect('/user/')
                    } else {
                        res.locals.msg = 'Invalid email id or password has entered.';
                        res.render('user/login', { data: req.body });
                    }

                }
            })

        }
    }
})
/**************LOGIN FUNCTION ENDS HERE ************/


/********************LOGOUT FUNCTION ***************/
router.all('/logout', function (req, res, next) {
    if (req.session.isLoggedIn) {
        req.session.isLoggedIn = false;
        res.redirect('/user/login');
    }
})
/*******************ENDS HERE LOGOUT****************/

module.exports = router;