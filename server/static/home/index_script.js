var ip_address = "localhost"

fetch('/static/server_stats.json')
    .then(response => response.json())
    .then(data => ip_address = data['ip'])
    .catch(error => console.error('Errore:', error));

var socket = io.connect('http://'+ip_address);


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
    var partyID = parseInt(prompt("Inserisci il partyID"));
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