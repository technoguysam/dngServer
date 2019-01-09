const RoomDB = require('./roomdb');
var mongoose = require('mongoose');
var dburl = 'mongodb://localhost/drawandguess';
mongoose.connect(dburl);
var db = mongoose.connection;

const numofuser = 2;

async function joinRoom(fid, cword) {
    var rid = null;
    var currentRoom = await this.findRoom({cuser: {$lt: numofuser}});
    if (currentRoom === 0) {
        await addRoom(fid, cword)
            .then(function (roomid) {
                rid = roomid;
            });
    } else {
        await updateRoom({_id: currentRoom._id}, {cuser: (currentRoom.cuser + 1)})
            .then(function (roomid) {
                rid = roomid;
                console.log('second user added');
            });
    }
    return rid;
}

async function addRoom(fid, cword) {
    var newroom = await new RoomDB({
        cuser: 1,
        cword: cword,
        drawer: fid,
        roomname: generateRoomId()
    });
    var saved = await newroom.save();
    return saved._id;
}

function generateRoomId() {
    return (Math.floor(1000 + Math.random() * 9000));
}

async function findRoom(conditionArr) {
    var result = null;
    await RoomDB.findOne(conditionArr)
        .then(function (room) {
            if (room) {
                result = room;
            } else {
                result = 0;
            }
        });
    return result;
}

async function updateRoom(condition, conditionArr) {
    var result = null;
    await RoomDB.findOneAndUpdate(condition, conditionArr, null)
        .then(function (ro) {
            result = ro._id;
        });
    return result;
}

async function deleteRoom(conditionarr) {
    var process = await RoomDB.deleteOne(conditionarr);
    return process.n;
}

module.exports.joinRoom = joinRoom;
module.exports.addRoom = addRoom;
module.exports.findRoom = findRoom;
module.exports.deleteRoom = deleteRoom;
module.exports.updateRoom = updateRoom;
