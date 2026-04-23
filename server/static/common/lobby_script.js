


let gameEndpoint = document.getElementById('gameEndpoint').value;

let urlParams = new URLSearchParams(window.location.search);
let mtype = urlParams.get('mtype');
let partyID = urlParams.get('partyID');
let playerID = parseInt(urlParams.get('playerID'));

document.getElementById('party-id').querySelector('span').textContent = partyID;
let playerListElem = document.getElementById('player-list');
let players = [];
let playerList = [];
let pingInterval;

function refreshPlayerList() {
    fetch('/home/playerList?partyID=' + partyID)
        .then(response => response.json())
        .then(playerss => {
            while (playerListElem.firstChild) {
                playerListElem.removeChild(playerListElem.firstChild);
            }

            playerList = [];
            players = [];

            playerss.forEach(player => {
                let li = document.createElement('li');
                players.push(player.name);
                playerList.push({name: player.name, mtype: player.mtype, playerID: player.playerID});
                li.textContent = player.name;
                playerListElem.appendChild(li);
            });
        })
        .catch(error => console.error('Error:', error));
}

if (mtype == 1) {
    let buttons = document.querySelectorAll('.host-buttons');
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].style.display = 'block';
    }

}

window.addEventListener('beforeunload', function(event) {
    socket.emit("leave", {'partyID': partyID, 'playerID':playerID});
    socket.close();
    console.log('Socket closed');
});

socket.on('player-joined', function(data) {
    refreshPlayerList();
});


socket.on('playerList', function(data) {
    if(data.response['status'] == 0){
        let playerss = data.playerList;
        //console.log(playerss);

        while (playerListElem.firstChild) {
            playerListElem.removeChild(playerListElem.firstChild);
            players = [];
            playerList = [];
        }

        // Aggiungere un nuovo elemento <li> per ogni giocatore
        playerss.forEach(player => {
            let li = document.createElement('li');
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
    //socket.close();
    window.location.href = data.links[mtype]
});

socket.on('kicked-player', function(data){
    if(data.kickedPlayer == mtype){
        alert("You were kicked off by the Host!")
        window.location.href = data.homeLink
    }
});

function alert(text,status = 1) {
    let title = '<span style="color: #fff;">Attenzione!</span>';
    let icon = 'warning'
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

document.getElementById('start-game').addEventListener('click', function() {

    if(players.length < 2) {
        alert('Devi avere almeno 2 giocatori per iniziare il gioco');
        return;
    }

    socket.emit("ask-start-game", {'partyID': partyID, 'gameName': gameEndpoint});
    console.log("start-game emitted to",partyID)
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

document.getElementById('invite-player').addEventListener('click', async () => {

    const inviteUrl = `${window.location.origin}/${gameEndpoint}/invite?partyID=${partyID}&playerID=${playerID}`;

    if (navigator.share) {
        try {
            const shareData = {
                title: 'Play with me!',
                text: 'Play ' + gameEndpoint + ' with me!\n Click here to join the lobby',
                url: inviteUrl
            };

            if (navigator.canShare) {
                try {
                    const imageCandidates = [
                        `${window.location.origin}/static/${gameEndpoint}/images/share.png`,
                        `${window.location.origin}/static/${gameEndpoint}/images/share.jpg`,
                        `${window.location.origin}/static/${gameEndpoint}/images/favicon.png`,
                        `${window.location.origin}/static/${gameEndpoint}/images/favicon.jpg`
                    ];

                    const buildLargerShareFile = async (imageBlob) => {
                        const localImageUrl = URL.createObjectURL(imageBlob);
                        try {
                            const img = await new Promise((resolve, reject) => {
                                const image = new Image();
                                image.onload = () => resolve(image);
                                image.onerror = () => reject(new Error('image decode failed'));
                                image.src = localImageUrl;
                            });

                            const size = 1200;
                            const canvas = document.createElement('canvas');
                            canvas.width = size;
                            canvas.height = size;

                            const ctx = canvas.getContext('2d');
                            if (!ctx) {
                                return null;
                            }

                            ctx.fillStyle = '#0c0c12';
                            ctx.fillRect(0, 0, size, size);

                            const scale = Math.max(size / img.width, size / img.height);
                            const drawWidth = img.width * scale;
                            const drawHeight = img.height * scale;
                            const drawX = (size - drawWidth) / 2;
                            const drawY = (size - drawHeight) / 2;

                            ctx.drawImage(img, 0, 0, 500, 500);

                            const outBlob = await new Promise((resolve) => {
                                canvas.toBlob(resolve, 'image/jpeg', 0.92);
                            });

                            if (!outBlob) {
                                return null;
                            }

                            return new File([outBlob], `${gameEndpoint}-invite.jpg`, { type: 'image/jpeg' });
                        } finally {
                            URL.revokeObjectURL(localImageUrl);
                        }
                    };

                    for (const imageUrl of imageCandidates) {
                        const imageResponse = await fetch(imageUrl, { cache: 'no-store' });
                        if (!imageResponse.ok) {
                            continue;
                        }

                        const imageBlob = await imageResponse.blob();
                        const largerShareFile = await buildLargerShareFile(imageBlob);

                        if (largerShareFile && navigator.canShare({ files: [largerShareFile] })) {
                            shareData.files = [largerShareFile];
                            break;
                        }
                    }
                } catch (fileErr) {
                    console.log('Share icon not attached', fileErr);
                }
            }

            await navigator.share(shareData);
            console.log('Share successfully sent');
        } catch (err) {
            console.log('Share failed', err);
        }
    } else {
        try {
            await navigator.clipboard.writeText(inviteUrl);
            
            Swal.fire({
                icon: 'success',
                title: 'Copied Link!',
                text: 'The lobby link has been copied. Paste it to your friends!',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            alert('Failed to copy the link. Please try copying it manually: ' + inviteUrl);
        }
    }
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


function ping(){
    socket.emit('ping', {'partyID':partyID, 'playerID':playerID});
}


function startPing() {
    console.log('startPing')
    pingInterval = setInterval(ping, 3000);
}

function stopPing() {
    console.log('stopPing')
    clearInterval(pingInterval);
}

document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // La scheda è inattiva, interrompe l'invio di ping
        //stopPing();
    } else {
        // La scheda è attiva, inizia a inviare ping
        startPing();
    }
});

function startingFunction() {
    let socket_data = {
        playerID: playerID,
        partyID: partyID,
        mtype: mtype
    };

    
    socket.emit('join', socket_data);
    refreshPlayerList();
    startPing() 
    //console.log('join', socket_data);
}


startingFunction()

