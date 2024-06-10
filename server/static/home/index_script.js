//socket_connect();
//var socket;
//socket_connect();
//console.log('Start of script '+socket);

//socket.emit('leave', {'playerID': playerID, 'partyID': partyID,'mtype': mtype});


/*
window.addEventListener('pageshow', function(event) {
    //console.log('Page show event',performance.getEntriesByType('navigation')[0].type);
    //location.reload();
});
*/

let gameEndpoint = document.getElementById('gameEndpoint').value;
let nickname = document.getElementById('nickname');

document.getElementById('host-lobby').addEventListener('click', function() {
    var playername = nickname.value;
    if (playername == '') {
        alert('Inserisci un nome valido');
        return;
    }
    localStorage.setItem(gameEndpoint+'_playername', playername);

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

        //socket.emit('join', socket_data);
        window.location.href = `/`+gameEndpoint+`/lobby?mtype=${data.mtype}&partyID=${data.partyID}&playerID=${data.playerID}`
        console.log('Socket connected to partyID: ' + data.partyID);
    })
    .catch((error) => {
        console.error('Error:', error);
    });

    
});

/*
window.addEventListener('beforeunload', function(event) {
    //socket.close();
    console.log('Socket closed');
});
*/


/*
window.onunload = function() {
    return null;
}

window.addEventListener("pageshow", function ( event ) {
    window.location.reload();
})
*/

    
/*
socket.on('player-joined', function(data) {
    //console.log('A player joined with ID: ' + data.playerID);
    //alert('A player joined with ID: ' + data.playerID);
    localStorage.setItem('playerID', data.playerID);
    //socket.close();
    window.location.href = `/`+gameEndpoint+`/lobby?mtype=${data.mtype}&partyID=${data.partyID}&playerID=${data.playerID}`
});
*/

document.getElementById('join-lobby').addEventListener('click', async function() {
    var playername = nickname.value;
    if (playername == '') {
        alert('Inserisci un nome valido');
        return;
    }
    
    localStorage.setItem(gameEndpoint+'_playername', playername);

    //var partyID = parseInt(prompt("Inserisci il partyID"));
    const swalWithInput = Swal.mixin({
        input: 'tel',
        inputPlaceholder: '1234',
        background: '#333',
        width: '400px',
        customClass: {
            content: 'swal-content-custom',
            input: 'swal-input-custom'
        },
        inputAttributes: {
            pattern: "[0-9]*",
            inputmode: "numeric"
        },
        didOpen: () => {
            Swal.getInput().addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                if (e.target.value.length > 4) {
                    e.target.value = e.target.value.slice(0, 4);
                }
            });
        }
    });

    const result = await swalWithInput.fire({
        title: '<span style="color: #fff;">Inserisci il partyID</span>',
    });

    if (result.isConfirmed) {
        var partyID = parseInt(result.value);
    }else{
        return;
    }

    if (isNaN(partyID)) {
        //alert('Inserisci un partyID valido');
        return;
    }

    //var player = nickname.value;

    fetch(`/`+gameEndpoint+`/join?partyID=${partyID}&player=${playername}`, {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        //console.log(data);
        /*
        var socket_data = {
            playerID: data.playerID,
            partyID: data.partyID,
            mtype: data.mtype
        };
        */

        //socket.emit('join', socket_data);
        window.location.href = `/`+gameEndpoint+`/lobby?mtype=${data.mtype}&partyID=${data.partyID}&playerID=${data.playerID}`
    })
    .catch((error) => {
        //console.error('Error:', error);
        alert("No Party Found!");
    });
});

function alert(text,status = 1) {
    var title = '<span style="color: #fff;">Attenzione!</span>';
    var icon = 'warning'
    if(status == 0){
        title = '<span style="color: #fff;">Successo!</span>'
        icon = 'success'
    }
    Swal.fire({
        title: title,
        html: '<span style="color: #fff;">' + text + '</span>',
        icon: icon,
        confirmButtonText: 'OK',
        background: '#333',
        customClass: {
            content: 'swal-content-custom'
        }
    });
}


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