//socket_connect();
//var socket;
//socket_connect();
//console.log('Start of script '+socket);

//socket.emit('leave', {'playerID': playerID, 'partyID': partyID,'mtype': mtype});

let gameEndpoint = document.getElementById('gameEndpoint').value;

document.getElementById('host-lobby').addEventListener('click', function() {
    var playername = document.getElementById('nickname').value;
    if (playername == '') {
        alert('Inserisci un nome valido');
        return;
    }
    fetch('/'+gameEndpoint+'/host', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ player: playername })  // Aggiungi il corpo della richiesta
    })
    .then(response => response.json())
    .then(data => {// Connetti al server Socket.IO
        
        var socket_data = {
            playerID: data.playerID,
            partyID: data.partyID,
            mtype: data.mtype
        };

        socket.emit('join', socket_data);
        console.log('Socket connected to partyID: ' + data.partyID);
    })
    .catch((error) => {
        console.error('Error:', error);
    });

    
});


socket.on('player-joined', function(data) {
    //console.log('A player joined with ID: ' + data.playerID);
    //alert('A player joined with ID: ' + data.playerID);
    localStorage.setItem('playerID', data.playerID);
    window.location.href = `/`+gameEndpoint+`/lobby?mtype=${data.mtype}&partyID=${data.partyID}&playerID=${data.playerID}`
});


document.getElementById('join-lobby').addEventListener('click', function() {
    var playername = document.getElementById('nickname').value;
    if (playername == '') {
        alert('Inserisci un nome valido');
        return;
    }
    var partyID = parseInt(prompt("Inserisci il partyID"));
    if (isNaN(partyID)) {
        //alert('Inserisci un partyID valido');
        return;
    }
    var player = document.getElementById('nickname').value;
    fetch(`/`+gameEndpoint+`/join?partyID=${partyID}&player=${player}`, {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        
        var socket_data = {
            playerID: data.playerID,
            partyID: data.partyID,
            mtype: data.mtype
        };

        socket.emit('join', socket_data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});



/*
let contextMenu = document.getElementById('context-menu');
document.addEventListener('click', function(event) {
    contextMenu.style.display = 'block';
    
    contextMenu.style.left = event.pageX + 'px';
    contextMenu.style.top = event.pageY + 'px';
    console.log('Clicked');
});
//*/

/*
var menu = document.querySelector('.menu');
var newItem = document.createElement('li');
newItem.className = 'item';
var newText = document.createElement('span');
newText.textContent = 'bbbbbb';
newItem.appendChild(newText);
menu.appendChild(newItem);
*/