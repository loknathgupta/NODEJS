var db = require('./db');

var User = {
    getUsers : function(UserData, callback){
        //console.log(UserData.id);
        if(UserData.id !== undefined){
            return db.query('SELECT * FROM USERS WHERE id=?',[UserData.id], callback)
        }else{
            return db.query('SELECT * FROM USERS WHERE 1 ORDER BY id desc', callback)
        }
        
    },
    saveUser : function(userData, callback){
        return db.query('INSERT INTO users SET ?', userData, callback)
    },
    updateUser : function(fieldsWithValues, conditions, callback){
        //console.log(userData);
        return db.query('UPDATE users SET ? WHERE ?', [fieldsWithValues, conditions], callback)
    },
    getUserForLogin: function(userData, callback){
        return db.query('SELECT * FROM users WHERE email=?', [userData.email], callback);
    }


};
module.exports = User;