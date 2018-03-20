var db = require('./db');

var User = {
    getUsers : function(UserData, callback){
        console.log(UserData.id);
        if(UserData.id !== undefined){
            return db.query('SELECT * FROM USERS WHERE id=?',[UserData.id], callback)
        }else{
            return db.query('SELECT * FROM USERS WHERE 1', callback)
        }
        
    },
    saveUser : function(userData, callback){
        return db.query('INSERT INTO users SET ?', userData, callback)
    },
    updateUser : function(userData, callback){
        console.log(userData);
        return db.query('UPDATE users SET first_name=?, last_name=?, email=? WHERE id=?', [userData.first_name, userData.last_name, userData.email, userData.id], callback)
    }

};
module.exports = User;