var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    username: String,
    fid:{
        type: String,
        default: null
    },
    fPicture:{
        type: String,
        default: null
    },
    sid: {
        type: String,
        default: null
    },
    rid: {
        type: String,
        default: null
    },
});

var UserDB = mongoose.model('User', userSchema);

module.exports = UserDB;
