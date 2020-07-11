
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
broad = document.getElementById('broad');


//Qui definisco lo Username e la Room nello URL
const {username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});


const socket = io();


//Aggiungo l'utente alla chatroom

socket.emit('joinRoom', {username, room});


//Ottengo la room e lo username
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room);
    outputUsers(users);
});


//Messaggio dal server
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    //Imposto lo scroll down per la chat
chatMessages.scrollTop= chatMessages.scrollHeight;
});

//Event Listener per il Submit in chat

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Ottengo il messaggio...
    const msg = e.target.elements.msg.value

    //... Lo invio al server
    socket.emit('chatMessage', msg);

    //Ripulisco l'input e setto il focus, preimpostandolo nuovamente sulla bar

    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();


});

    function outputMessage(message) {

        const div = document.createElement('div');
        div.classList.add('message');
        broad.innerHTML = '';
        div.innerHTML = 
           `<p class="meta"><span> ${message.time}</span>&nbsp&nbsp ${message.username} scrive: </p>
            <p class="text">
             ${message.text}
           </p>`;
           document.querySelector('.chat-messages').appendChild(div);
    }

    // Aggiungo il nome della Room al DOM
    function outputRoomName(room) {
        roomName.innerText = room;
    }

     //Aggiungo lo username al DOM
     function outputUsers(users) {
        
         userList.innerHTML = `
           ${users.map(user => `<li> ${user.username} </li>`).join('')}`;

           
           msg.addEventListener("keypress", () => {
            socket.emit(`typing`, `${username}`); 
         });
    
    }


      //Ascolto dell'typing dello user

      socket.on('typing', function(username) {
      broad.innerHTML = '<p>' + username + ' sta scrivendo...</p>';
       });
   