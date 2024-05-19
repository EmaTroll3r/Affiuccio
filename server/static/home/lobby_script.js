


let gameEndpoint = document.getElementById('gameEndpoint').value;

var urlParams = new URLSearchParams(window.location.search);
var mtype = urlParams.get('mtype');
var partyID = urlParams.get('partyID');
var playerID = parseInt(localStorage.getItem('playerID'));

document.getElementById('party-id').querySelector('span').textContent = partyID;
var playerListElem = document.getElementById('player-list');
var players = [];
var playerList = [];

if (mtype == 1) {
    var buttons = document.querySelectorAll('.host-buttons');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].style.display = 'block'; // o 'inline', 'inline-block', a seconda del tuo layout
    }

    //document.getElementById('remove-player').style.display = 'none'; // o 'inline', 'inline-block', a seconda del tuo layout
}

socket.on('player-joined', function(data) {
    //if (data.playerID != playerID)
        //alert('A player joined with ID: ' + data.playerName);
    fetch('/home/playerList?partyID=' + partyID)
        .then(response => response.json())
        .then(playerss => {
            

            // Rimuovere tutti i figli precedenti
            while (playerListElem.firstChild) {
                playerListElem.removeChild(playerListElem.firstChild);
                playerList = [];
                players = [];
            }

            // Aggiungere un nuovo elemento <li> per ogni giocatore
            //console.log(playerss)
            playerss.forEach(player => {
                var li = document.createElement('li');
                players.push(player.name);
                //console.log(player)
                playerList.push({name: player.name, mtype: player.mtype, playerID: player.playerID});
                li.textContent = player.name;
                playerListElem.appendChild(li);
            //console.log(players);
            });
            console.log(playerList);
        })
        .catch(error => console.error('Error:', error));
    //console.log('A player joined with ID: ' + data.playerID);
});

socket.on('playerList', function(data) {
    if(data.response['status'] == 0){
        var playerss = data.playerList;
        //console.log(playerss);

        while (playerListElem.firstChild) {
            playerListElem.removeChild(playerListElem.firstChild);
            players = [];
            playerList = [];
        }

        // Aggiungere un nuovo elemento <li> per ogni giocatore
        playerss.forEach(player => {
            var li = document.createElement('li');
            players.push(player.name);
            
            playerList.push({name: player.name, mtype: player.mtype, playerID: player.playerID});
            
            li.textContent = player.name;
            playerListElem.appendChild(li);
        //console.log(players);
        });
        console.log(playerList);
    }else{
        alert(data.response['message'])
    }
});

socket.on('start-game', function(data){
    console.log("received")
    //console.log(data)
    //console.log(data.links[mtype])
    //console.log(mtype)
    window.location.href = data.links[mtype]
});

socket.on('kicked-player', function(data){
    if(data.kickedPlayer == mtype){
        alert("You were kicked off by the Host!")
        window.location.href = data.homeLink
    }
});

document.getElementById('start-game').addEventListener('click', function() {

    socket.emit(gameEndpoint.toLowerCase()+"-ask-start-game", {'partyID': partyID})
    console.log("start-game emitted",partyID)
    /*
    fetch(`/SosOnline/game?mtype=${mtype}&partyID=${partyID}`, {
        method: 'GET',
    })
    .then(response => response.text())
    .then(data => {
        document.body.innerHTML = data;  // Aggiorna il corpo della pagina con i dati ricevuti
    })
    .catch((error) => {
        console.error('Error:', error);
    });
    */
});

document.getElementById('remove-player').addEventListener('click', async function() {
    /*
    targetMtype = -1;

    while(isNaN(targetMtype) || targetMtype < 2 || targetMtype >= players.length) {
        targetMtype = parseInt(prompt("Inserisci l'ID del giocatore da rimuovere"));
        if(targetMtype == null) 
            return;
        if(targetMtype == 1){
            alert("You can't remove the host")
        }
    }
    */
    targetMtype = await choosePlayer([1])
    if(targetMtype == null || isNaN(targetMtype) || targetMtype < 2 || targetMtype > players.length) 
        return;
    socket.emit("remove-player", {'partyID': partyID, 'playerID':playerID,'targetMtype': targetMtype, 'homeLink':"/"+gameEndpoint});
    console.log("remove-player",partyID,targetMtype)
});

async function choosePlayer(foreignPlayers) {
    console.log('choosePlayer',foreignPlayers);
    let inputOptions = {};
    for (let player of playerList) {
        //console.log(player);
        if (!foreignPlayers.includes(player.mtype)) {
            //console.log('in');
            inputOptions[player.mtype] = player.name;
        }
    }

    //console.log('inputOptions',inputOptions);
    let result = await Swal.fire({
        //title: 'Seleziona un giocatore',
        title: '<span style="color: #fff;">Seleziona un giocatore</span>',
        input: 'select',
        inputOptions: inputOptions,
        //inputPlaceholder: 'Seleziona un\'opzione',
        showCancelButton: true,
        background: '#333',
        customClass: {
            content: 'swal-content-custom'
        }
    });

    console.log('result',result);
    if (result.isConfirmed) {
        return parseInt(result.value);
    } else {
        return null;
    }
}
/*
window.onload = function() {
    startingFunction()
}
*/


function startingFunction() {
    var socket_data = {
        playerID: playerID,
        partyID: partyID,
        mtype: mtype
    };

    socket.emit('join', socket_data);
    //console.log('join', socket_data);
}

startingFunction()

/*
socket.on('plaer_joined', function(data) {
    console.log('A player joined with ID: ' + data.playerID);
    socket.emit('get-hand', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype, 'hand':'hint'});
});
*/
