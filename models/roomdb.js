var mongoose = require('mongoose');

var roomSchema = mongoose.Schema({
    cuser: Number,
    cword: String,
    drawer: String,
    roomname: String
});

var RoomDB = mongoose.model('Room', roomSchema);

module.exports = RoomDB;
