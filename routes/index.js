var express = require('express');
var taskController = require('../controller/tasks');
var router = express.Router();

/** GET /api-status - Check service status **/
router.get('/test', (req, res) =>
    res.json({
        status: "ok"
    })
);

router.route('/createUser')
/** POST /api/tasks - Create new user*/
    .post(taskController.create);

module.exports = router;

