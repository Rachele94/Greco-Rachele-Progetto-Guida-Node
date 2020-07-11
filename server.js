const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');
const { emit } = require('process');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//Setto i files statici tramite la cartella public
app.use(express.static(path.join(__dirname, 'public')));

const botName= 'LeChat Bot';
//Gestione dell'utente che si connette
io.on('connection', socket => {
    console.log('New WebSocket Connection')


    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);
      
     //Messaggio di Benvenuto
      socket.emit('message', formatMessage(botName, 'Benvenuto su LeChat!'));

     //Messaggio di avviso (broadcast!) per l'utente che si connette

      socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} si è unito alla chat!`));

      //Inserisco username e la room nel div
      io.to(user.room).emit('roomUsers',{ 
      room: user.room,
      users:getRoomUsers(user.room)
      });

      //Asclto del typing 

      socket.on('typing', function(data){
        const user = getCurrentUser(socket.id);
        socket.broadcast.emit('typing', data)
      });


     //Messaggio di avviso (broadcast ) per l'utente che si disconnette

      socket.on('disconnect', () => {

        const user = userLeave(socket.id);

        if(user) {
            io.to(user.room).emit(
                'message', 
                formatMessage(botName, `${user.username} ha lasciato la chat!`));

        }
        

     
     }); 
      
    });



     //Riporto il messaggio della chat dal server
       socket.on('chatMessage', (msg) => {
           const user = getCurrentUser(socket.id);


           io.to(user.room)
           .emit('message', formatMessage(user.username, msg));

       });

       socket.on('typing', function (data) {
        console.log(data);
        socket.broadcast.emit('typing', data);
      });







});

//Connessione del Server

const PORT = process.env.PORT || 8080


server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
