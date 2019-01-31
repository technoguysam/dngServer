const DrawDataDB = require('./drawdatadb');
var mongoose = require('mongoose');
var dburl = 'mongodb://samundra:samundra1@ds241664.mlab.com:41664/dng';
mongoose.connect(dburl, {useNewUrlParser: true});
var db = mongoose.connection;

/**
 * this function adds the draw data provided the
 * user along with the facebookid, draw data and
 * context id
 */
async function addData(fid, data, contextId, word) {
    findData({'contextId': contextId})
        .then(async function(currentData){
            console.log('current data', currentData);
            if (currentData === 0) {
                console.log('current data is 0');
                var newdata = await new DrawDataDB({
                    fid: fid,
                    data: JSON.stringify(data),
                    contextId: contextId,
                    cword: word,
                    guessed: false
                });
                var saved = await newdata.save();
            } else {
                console.log('current data is not 0');
                var upd = await updateData({contextId: contextId}, {data: JSON.stringify(data), cword: word, guessed: false});
            }
        })
}

/**
 * this function gets the context id and fetch
 * associated data from the table and send the
 * response
 */
async function findData(conditionArr) {
    var result = null;
    await DrawDataDB.findOneAndUpdate(conditionArr)
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
    module.exports.findData = findData;
    module.exports.updateData = updateData;
    module.exports.deleteData = deleteData;
