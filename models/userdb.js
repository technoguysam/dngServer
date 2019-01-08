var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    name: String,
    sid: {
        type: String,
        default: null
    },
    rid: String,
});

var UserDB = mongoose.model('User', userSchema);

module.exports = UserDB;
