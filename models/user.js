const UserDB = require('userdb');
var mongoose = require('mongoose');
var dburl = 'mongodb://localhost/drawandguess';
mongoose.connect(dburl);
var db = mongoose.connection;

async function addUser(name, sid, rid,) {
    var result = null;
    await this.findUser({'name': name})
        .then(async function (currentUser) {
            if (currentUser === 0) {
                var newuser = await new UserDB({
                    name: name,
                    sid: sid,
                    rid: rid,
                });
                result = 1;
                await newuser.save();
            } else {
                result = 0;
            }
        });
    return result;
}

async function updateUser(conditionArr, paramArr) {
    var result = null;
    await UserDB.findOneAndUpdate(conditionArr, paramArr, null)
        .then(function (err) {
            if (err) {
                result = 0;
            } else {
                result = 1;
            }
        });
    return result;
}

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

async function deleteUser(conditionArr) {
    var process = await UserDB.deleteOne(conditionArr);
    return process.n;
}

module.exports.addUser = addUser;
module.exports.updateUser = updateUser;
module.exports.findUser = findUser;
module.exports.deleteUser = deleteUser;
module.exports.findUserMultiple = findUserMultiple;
