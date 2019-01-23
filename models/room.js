const RoomDB = require('./roomdb');
var mongoose = require('mongoose');
var dburl = 'mongodb://localhost/drawandguess';
mongoose.connect(dburl, { useNewUrlParser: true });
var db = mongoose.connection;

const numofuser = 2;

/*
* This function finds the room where there is
* no two users and calls the room create function if
* there is no room available
*/
async function joinRoom(fid, cword) {
    cword = cword.toUpperCase();
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

/*
* this function finds the room with the specific
* context and if not found create a room with
* specific context
*/
async function joinRoomContext(fid, cword, contextId) {
    cword = cword.toUpperCase();
    var rid = null;
    var currentRoom = await this.findRoom({contextid: contextId});
    if (currentRoom === 0) {
        await addRoomContext(fid, cword ,contextId)
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

/*
* This function adds the room given facebook id
* of the first user to the room
*/
async function addRoom(fid, cword) {
    console.log('first User');
    var newroom = await new RoomDB({
        cuser: 1,
        cword: cword,
        drawer: fid,
        roomname: generateRoomId()
    });
    var saved = await newroom.save();
    return saved._id;
}

/*
* this function adds the room with context id
* given facebook id of the first user, current word
* and context id
*/
async function addRoomContext(fid, cword, contextId) {
    console.log('first User');
    var newroom = await new RoomDB({
        cuser: 1,
        cword: cword,
        drawer: fid,
        roomname: generateRoomId(),
        contextid: contextId
    });
    var saved = await newroom.save();
    return saved._id;
}

/*
* this function generates the 4 digit
* random number to be assigned to the
* room as an room id
*/
function generateRoomId() {
    return (Math.floor(1000 + Math.random() * 9000));
}

/*
* this function finds room and return room information
* according to the provided condition array
*/
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

/*
* this function updates the room by
* finding the room and with condition and
* update the value given in conditionarr
*/
async function updateRoom(condition, conditionArr) {
    var result = null;
    await RoomDB.findOneAndUpdate(condition, conditionArr, null)
        .then(function (ro) {
            result = ro._id;
        });
    return result;
}

/*
* this function deletes the user
* according to the condition provided
*/
async function deleteRoom(conditionarr) {
    var process = await RoomDB.deleteOne(conditionarr);
    return process.n;
}

module.exports.joinRoom = joinRoom;
module.exports.addRoom = addRoom;
module.exports.findRoom = findRoom;
module.exports.deleteRoom = deleteRoom;
module.exports.updateRoom = updateRoom;
module.exports.joinRoomContext = joinRoomContext;
