var User = require('../models/user');
var Room = require('../models/room');
const crypto = require('crypto');

function create(req, res, next) {
    console.log('data was here');
    console.log(req.body);
    User.createUser({
        username: req.body.data.name,
        fid: req.body.data.id,
        fPicture: req.body.data.image
    })
        .then((savedTask) => {
            return res.json(savedTask);
        }, (e) => next(e));
}

module.exports.create = create;
