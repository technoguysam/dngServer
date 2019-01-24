const DrawDataDB = require('./drawdatadb');
var mongoose = require('mongoose');
var dburl = 'mongodb://localhost/drawandguess';
mongoose.connect(dburl, {useNewUrlParser: true});
var db = mongoose.connection;

/**
 * this function adds the draw data provided the
 * user along with the facebookid, draw data and
 * context id
 */
async function addData(fid, data, contextId) {
    var newdata = await new DrawDataDB({
        fid: fid,
        data: data,
        contextId: contextId
    });
    var saved = await newdata.save();
}

/**
 * this function deletes the data
 * provided the condition array
 */
async function deleteData(conditionArr) {
    var process = await DrawDataDB.deleteOne(conditionArr);
    return process.n;
}

module.exports.addData = addData;
module.exports.deleteData = deleteData;
