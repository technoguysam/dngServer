const DrawDataDB = require('./drawdatadb');
const config = require('../config');
var mongoose = require('mongoose');
var dburl = config.db;
mongoose.connect(dburl, {useNewUrlParser: true});
var db = mongoose.connection;

/**
 * this function adds the draw data provided the
 * user along with the facebookid, draw data and
 * context id
 */
async function addData(fid, data, contextId, word) {
    findData({'contextId': contextId})
        .then(async function (currentData) {
            if (currentData === 0) {
                var newdata = await new DrawDataDB({
                    fid: fid,
                    data: JSON.stringify(data),
                    contextId: contextId,
                    cword: word,
                    guessed: false
                });
                var saved = await newdata.save();
            } else {
                var upd = await updateData({contextId: contextId}, {
                    data: JSON.stringify(data),
                    cword: word,
                    guessed: false
                });
            }
        })
}

/**
 * this function adds the front draw data provided the
 * user
 */
async function addFrontData(data) {
    var newdata = await new DrawDataDB({
        fid: '1',
        data: JSON.stringify(data)
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
            if (ddata) {
                result = {
                    datad: ddata.data,
                    cword: ddata.cword,
                    guessed: ddata.guessed
                }
            } else {
                result = 0;
            }
        });
    return result;
}

/**
 * this function gets frontend draw data
 */
async function findFrontData() {
    var result = null;
    await DrawDataDB.findOne({'fid':'1'})
        .then(function (ddata) {
            if (ddata) {
                result = ddata.data
            } else {
                result = 0;
            }
        });
    return result;
}

/**
 * this function updates the draw data by
 * finding the drawdata and with condition and
 * update the value given in conditionarr
 */
async function updateData(condition, conditionArr) {
    var result = null;
    await DrawDataDB.findOneAndUpdate(condition, conditionArr, null)
        .then(function (ro) {
            result = ro._id;
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
module.exports.addFrontData = addFrontData;
module.exports.findFrontData = findFrontData;
module.exports.findData = findData;
module.exports.updateData = updateData;
module.exports.deleteData = deleteData;
