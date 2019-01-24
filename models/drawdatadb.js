var mongoose = require('mongoose');

var drawDataSchema = mongoose.Schema({
    fid:{
        type: String,
        default: null
    },
    data:{
        type: String,
        default: null
    },
    contextId: {
        type: String,
        default: null
    },
    saved_at: {
        type: Date,
        default: Date.now
    }
});

var DrawDataDB = mongoose.model('DrawData', drawDataSchema);

module.exports = DrawDataDB;
