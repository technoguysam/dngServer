const express = require('express');
const routes = require('./routes/index');
const path = require('path');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
app.use('/api', routes);
server.listen(process.env.PORT || 3000);
console.log('server started and listening on port 3000');
