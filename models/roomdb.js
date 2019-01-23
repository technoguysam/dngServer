var mongoose = require('mongoose');

var roomSchema = mongoose.Schema({
    cuser: Number,
    cword: String,
    drawer: String,
    roomname: String,
    contextid:{
        type: String,
        default: null
    },

});

var RoomDB = mongoose.model('Room', roomSchema);

module.exports = RoomDB;
