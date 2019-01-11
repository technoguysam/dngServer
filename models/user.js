const UserDB = require('./userdb');
var mongoose = require('mongoose');
var dburl = 'mongodb://localhost/drawandguess';
mongoose.connect(dburl);
var db = mongoose.connection;

async function addUser(name, fid, image, sid) {
    console.log(fid);
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

async function updateUser(conditionArr, paramArr) {
    var result = null;
    await UserDB.findOneAndUpdate(conditionArr, paramArr, null)
        .then(function (err) {
            result = 1;
        });
    console.log('update',result);
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
