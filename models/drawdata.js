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
        data: JSON.stringify(data),
        contextId: contextId
    });
    var saved = await newdata.save();
}

/**
 * this function gets the context id and fetch
 * associated data from the table and send the
 * response
 */
async function findData(conditionArr) {
    var result = null;
    await DrawDataDB.findOne(conditionArr)
        .then(function (ddata) {
            console.dir(ddata);
            if (ddata) {
                result = ddata.data;
            } else {
                result = 0;
            }
        });
    return result;
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
module.exports.findData = findData;
module.exports.deleteData = deleteData;
