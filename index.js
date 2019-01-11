//ssh -R sammy:80:localhost:3000 serveo.net
const express = require('express');
const routes = require('./routes/index');
var cors = require('cors');
bodyParser = require('body-parser');
const path = require('path');
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const server = require('http').Server(app);
const io = require('socket.io')(server);
app.use('/api', routes);

var User = require('./models/user');
var Room = require('./models/room');

const gameTime = 20000000;
var games=[];

io.on('connection', (socket) => {
    console.log('user connected');
    var sid = socket.id;
    var result = null;
    var roomid = null;

    socket.on('join', async function (name,fid,image, fn) {
        var returnVal = await User.addUser(name, fid, image, sid);
        if (returnVal) {
            var rid = await Room.joinRoom(fid, getRandomWord());
            roomid = rid;
            await socket.join(rid);
            await User.updateUser({fid: fid}, {rid: rid});
            startGame(rid, sid, null);
            result = returnVal;
        } else {
            result = 0;
        }
        await fn(result);
    });

    socket.on('joinRoom', async function (name, rod, fn) {
        result = 0;
        var returnRoomVal = await Room.findRoom({'roomname': rod, cuser: {$lt: 2}});
        if (returnRoomVal) {
            var returnVal = await User.addUser(name, sid, null);
            if (returnVal) {
                await Room.updateRoom({_id: returnRoomVal._id}, {cuser: (returnRoomVal.cuser + 1)})
                    .then(function (roomid) {
                        joinRoomId = roomid;
                        console.log('second user added');
                    });
                await socket.join(joinRoomId);
                await User.updateUser({sid: sid}, {rid: joinRoomId});
                startGame(joinRoomId, sid, null);
            }
            result = returnVal;
        }
        await fn(result);
    });

    socket.on('deleteUser', async function (username) {
        User.deleteUser({name:username});
        console.log('deleteUser','user deleted');
    });

    socket.on('clearCanvas', async function (rid) {
        io.to(rid).emit('clear');
    });

    socket.on('fetchRoomInfo', async function () {
        await User.findUser({'sid': sid})
            .then(async function (userData) {
                await Room.findRoom({_id: userData.rid})
                    .then(async function (roomData) {
                        await io.to(`${userData.sid}`).emit('roomInfo', roomData);
                    });
            });
    });

    socket.on('disconnect', async function () {
        var stop = startGame(null,null,'stop');
        var userdata = await User.findUser({'sid': sid});
        io.to(userdata.rid).emit('stop', 'Game Over, User Left!');
        var remove = await removeUsers(userdata.rid);
        var deleteroom = await Room.deleteRoom({_id: userdata.rid});
        console.log('roomdelete', deleteroom);
        var userdelete = await User.deleteUser({'sid': sid});
        console.log('userdelete', userdelete);
        console.log('user disconnected');
    });

    socket.on('message', async function (message) {
        await User.findUser({'sid': sid})
            .then(async function (userData) {
                await Room.findRoom({_id: userData.rid})
                    .then(async function (roomData) {
                        if (roomData.cword === message.toLowerCase()) {
                            io.to(roomData._id).emit('getmessage', {
                                user: userData.username,
                                message: message + ' (Correct Guess)',
                                won:1
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
});

async function startGame(rid, sid, stop) {
    if (stop === 'stop') {
        clearTimeout(games[rid]);
    } else {
        await Room.findRoom({_id: rid})
            .then(async function (roomData) {
                if (roomData.cuser >= 2) {
                    let userData = await User.findUser({'sid': sid})
                    io.to(rid).emit('start', roomData);
                    var game = setTimeout(function () {
                        finish(userData, roomData);
                    }, gameTime);
                    games[rid] = game;
                }
            });
    }
}

async function finish(userdata, roomData) {
    startGame(null,null,'stop');
    await removeUsers(roomData._id);
    await Room.deleteRoom({roomname: roomData.roomname});
    io.to(userdata.rid).emit('stop', 'Game Over');
}

async function removeUsers(roomId) {
    await User.findUserMultiple({rid: roomId})
        .then(function (userData) {
            userData.forEach(function (users) {
                res = User.deleteUser({name: users.name});
            })
        })
}

function getRandomWord() {
    var words = ['mango', 'apple', 'house', 'tree', 'glass', 'bed', 'palm', 'bottle', 'phone', 'people', 'art', 'computer',
    'music', 'television', 'camera', 'road', 'river', 'mountain', 'book', 'cigarette', 'money', 'car', 'cloud', 'guitar', 'pen'];
    return words[Math.floor(Math.random() * words.length)];
}

server.listen(process.env.PORT || 3000);
console.log('server started and listening on port 3000');
