const express = require('express');
const path = require('path');
const User = require('./user');
const Room = require('./room');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
app.use(express.static('.'));
server.listen(process.env.PORT || 3000);
