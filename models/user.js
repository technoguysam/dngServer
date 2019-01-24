const UserDB = require('./userdb');
var mongoose = require('mongoose');
var dburl = 'mongodb://localhost/drawandguess';
mongoose.connect(dburl, { useNewUrlParser: true });
var db = mongoose.connection;

/**
* this function adds the user provided the
* name, facebook id, image and session id
*/
async function addUser(name, fid, image, sid) {
    var result = null;
    await this.findUser({'fid': fid})
        .then(async function (currentUser) {
            if (currentUser === 0) {
                var newUser = await new UserDB({
                    username: name,
                    fid: fid,
                    fPicture: image,
                    sid: sid,
                    rid: null,
                });
                result = 1;
                await newUser.save();
            } else {
                result = await updateUser({fid: fid}, {sid: sid});
            }
        });
    console.log(result);
    return result;
}

/**
* this function updates the user
* provided the condition to find the data
* and parameters to update that data
*/
async function updateUser(conditionArr, paramArr) {
    var result = null;
    await UserDB.findOneAndUpdate(conditionArr, paramArr, null)
        .then(function (err) {
            result = 1;
        });
    return result;
}

/**
* this function finds the user provided
* the condition to find the
* user
*/
async function findUser(conditionArr) {
    var result = null;
    await UserDB.findOne(conditionArr).then(function (user) {
            if (user) {
                result = user;
            } else {
                result = 0;
            }
        }
    );
    return result;
}

/**
* this function finds the multiple users
* provided the condition given and return
* as an array
*/
async function findUserMultiple(conditionArr) {
    var result = null;
    await UserDB.find(conditionArr).then(function (user) {
            if (user) {
                result = user;
            } else {
                result = 0;
            }
        }
    );
    return result;
}

/**
* this function deletes the user
* provided the condition array
*/
async function deleteUser(conditionArr) {
    var process = await UserDB.deleteOne(conditionArr);
    return process.n;
}

module.exports.addUser = addUser;
module.exports.updateUser = updateUser;
module.exports.findUser = findUser;
module.exports.deleteUser = deleteUser;
module.exports.findUserMultiple = findUserMultiple;
