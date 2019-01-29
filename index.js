//ssh -R sammy:80:localhost:3000 serveo.net
const express = require('express');
const routes = require('./routes/index');
var cors = require('cors');
bodyParser = require('body-parser');
const path = require('path');
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const server = require('http').Server(app);
const io = require('socket.io')(server);
app.use('/api', routes);

var User = require('./models/user');
var Room = require('./models/room');
var DrawData = require('./models/drawdata');

const gameTime = 20000000;
var games = [];

/**
 * Websocket initialises and start listening in this method
 */
io.on('connection', (socket) => {
    console.log('user connected');
    var sid = socket.id;
    var result = null;
    var roomid = null;

    /**
     * When client sends the Join request it accepts the parameters and send result as 0 and 1
     */
    socket.on('join', async function (name, fid, image, contextId, fn) {
        var returnVal = await User.addUser(name, fid, image, sid);
        var rid;
        if (returnVal) {
            if (contextId !== '') {
                console.log('contextid found', contextId);
                rid = await Room.joinRoomContext(fid, getRandomWord(), contextId);
                roomid = rid;
                await socket.join(rid);
                await User.updateUser({fid: fid}, {rid: rid});
                start = startGame(rid, sid, null);
                result = returnVal;
            } else {
                rid = await Room.joinRoom(fid, getRandomWord());
                roomid = rid;
                await socket.join(rid);
                await User.updateUser({fid: fid}, {rid: rid});
                start = startGame(rid, sid, null);
                result = returnVal;
            }
        } else {
            result = 0;
        }
        await fn(result);
    })
    ;

    /**
     * Deletes the user
     */
    socket.on('deleteUser', async function (username) {
        User.deleteUser({name: username});
        console.log('deleteUser', 'user deleted');
    });

    /**
     * Fetch the Room Information after and before the game starts
     */
    socket.on('fetchRoomInfo', async function () {
        await User.findUser({'sid': sid})
            .then(async function (userData) {
                await Room.findRoom({_id: userData.rid})
                    .then(async function (roomData) {
                        await io.to(`${userData.sid}`).emit('roomInfo', roomData);
                    });
            });
    });

    /**
     * It disconnects and end the game after a user left the game
     */
    socket.on('disconnect', async function () {
        var stop = startGame(null, null, 'stop');
        var userdata = await User.findUser({'sid': sid});
        io.to(userdata.rid).emit('stop', 'Game Over, User Left!');
        var deleteroom = await Room.deleteRoom({_id: userdata.rid});
        console.log('roomdelete', deleteroom);
        console.log('user disconnected');
    });

    /**
     * It gets the message sent by the user and forwards to the
     * respective members of the room and also checks for the
     * input of the correct value of the room guessing word
     */
    socket.on('message', async function (message) {
        await User.findUser({'sid': sid})
            .then(async function (userData) {
                await Room.findRoom({_id: userData.rid})
                    .then(async function (roomData) {
                        if (roomData.cword === message.trim().toLowerCase()) {
                            io.to(roomData._id).emit('getmessage', {
                                user: userData.username,
                                message: message + ' (Correct Guess)',
                                won: 1
                            });
                            setTimeout(function () {
                                finish(userData, roomData);
                            }, 1000);
                        } else {
                            console.log(userData);
                            io.to(roomData._id).emit('getmessage', {
                                user: userData.username,
                                message: message
                            });
                        }
                    })
            })
    });

    /**
     * This receives the coordinates of the line to be drawn and forwards to the
     * respetive room id
     */
    socket.on('coordinates', async function (value) {
        await User.findUser({'sid': sid})
            .then(async function (userData) {
                await Room.findRoom({_id: userData.rid})
                    .then(async function (roomData) {
                        if (value === 1) {
                            socket.to(roomData._id).emit('getCoordinate', 1);
                        } else {
                            socket.to(roomData._id).emit('getCoordinate', value);
                        }
                    })
            })
    });

    /**
     * This gets the image coordinates and save the coordinates
     * to the database along with user facebook id and
     * context id
     */
    socket.on('saveComposedDrawing', function (data, fid, contextId, word) {
        let add = DrawData.addData(fid, data, contextId, word);
    });

    /**
     * This gets the context id and fetch the data from drawing data
     * table and send the response
     */
    socket.on('fetchDrawingData', async function (cid, fn) {
        let fetchedData = await DrawData.findData({contextId:cid});
        fn(JSON.parse(fetchedData.result),fetchedData.word);
    });

    /**
     * This gets the request and send the random word to
     * the requester
     */
    socket.on('randomword', async function (fn) {
        let randomWord = getRandomWord();
        fn(randomWord);
    });

});

/**
 * This function starts the game and initiates the
 * game time for individual game room
 */
async function startGame(rid, sid, stop) {
    if (stop === 'stop') {
        clearTimeout(games[rid]);
    } else {
        await Room.findRoom({_id: rid})
            .then(async function (roomData) {
                if (roomData.cuser >= 2) {
                    let userData = await User.findUser({'sid': sid});
                    io.to(rid).emit('start', roomData);
                    var game = setTimeout(function () {
                        finish(userData, roomData);
                    }, gameTime);
                    games[rid] = game;
                }
            });
    }
}

/**
 * this function stops the game
 * and requires the userdata and roomdata
 * to stop the game and removes the user and
 * delets the room
 */
async function finish(userdata, roomData) {
    startGame(null, null, 'stop');
    await removeUsers(roomData._id);
    await Room.deleteRoom({roomname: roomData.roomname});
    io.to(userdata.rid).emit('stop', 'Game Over');
}

/**
 * this function removes the users
 * in a room
 */
async function removeUsers(roomId) {
    await User.findUserMultiple({rid: roomId})
        .then(function (userData) {
            userData.forEach(function (users) {
                res = User.deleteUser({name: users.name});
            })
        })
}

/**
 * this function provides the random word
 * using default random method
 * from the given array of words
 */
function getRandomWord() {
    var words = ['mango', 'apple', 'house', 'tree', 'glass', 'bed', 'palm', 'bottle', 'phone', 'people', 'art', 'computer',
        'music', 'television', 'camera', 'road', 'river', 'mountain', 'book', 'cigarette', 'money', 'car', 'cloud', 'guitar', 'pen'];
    return words[Math.floor(Math.random() * words.length)];
}

server.listen(process.env.PORT || 3000);
console.log('server started and listening on port 3090');
