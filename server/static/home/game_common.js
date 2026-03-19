let endpoint = document.getElementById('gameEndpoint').value;
let lowerEndpoint = endpoint.toLowerCase();
let preloadedImages = [];
let canShowHand = false;
let maxCardsInHand = 0;
let hand = {};
let playerList = [];

let urlParams = new URLSearchParams(window.location.search);
let playerID = parseInt(urlParams.get('playerID'));
let partyID = urlParams.get('partyID');
let mtype = urlParams.get('mtype');





socket.on('player-joined', function(data) {
    console.log('join', data);
    if(data.playerID == playerID){
        socket.emit(lowerEndpoint + '-get-inGameCards', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype});
        for (let handtype of handtypes) {
            requestHand(partyID, playerID, mtype, handtype);
        }
        socket.emit('get-playerList', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype});

        additionalInitialRequests();
    }
});


socket.on('response-inGameCards',async  function(data) {
    console.log('response-inGameCards',data.hand);

    if(data.targetPlayer == playerID || data.targetPlayer == undefined){
        // Mostra la barra di caricamento
        let loadingBar = document.getElementById('loadingBar');
        //loadingBar.style.display = 'block';
        loadingBar.value = 0;
        console.log('maxCardsInHand',data.cardsInHand);
        maxCardsInHand = data.cardsInHand
        loadingBar.max = maxCardsInHand;

        data.hand.forEach( async (card, i) => {
            if(preloadedImages[card] == undefined){
                preloadedImages[card] = new Image();
                preloadedImages[card].src = '/static/' + endpoint + '/images/' + card + '.png';
                console.log("preloaded "+preloadedImages[card].src)

                // Ascolta l'evento 'load' per sapere quando l'immagine è stata caricata
                preloadedImages[card].addEventListener('load', async function() {
                    // Aggiorna il valore della barra di caricamento
                    loadingBar.value++;
                    // Se tutte le immagini sono state caricate, nascondi la barra di caricamento
                    if (loadingBar.value === maxCardsInHand || loadingBar.value > maxCardsInHand) {
                        loadingBar.style.display = 'none';
                        canShowHand = true;
                    }
                });
            }
        });
    }
});


socket.on('response-hand', async function(data) {
    while(canShowHand == false){
        await new Promise(r => setTimeout(r, 100));
    }

    if(data.handtype in showingHands){

        data.hand.forEach((card, i) => {
            //console.log('preloadedImages[card]',preloadedImages[card]);
            if(preloadedImages[card] == undefined){
                preloadedImages[card] = new Image();
                preloadedImages[card].src = '/static/' + endpoint + '/images/' + card + '.png';
                console.error("preloaded "+preloadedImages[card].src)
            }
        });
    }

    if(data.playerID == playerID){
        hand[data.handtype] = data.hand;
        showHand();
        
    }
});

socket.on('response-playerList', function(data) {
    playerList = data.playerList;

    onResponsePlayerList();

    socket.emit('get-turn', {'partyID':partyID, 'playerID':playerID});
});


socket.on('response-turn', function(data) {
    turn = parseInt(data.turn);

    onResponseTurn();

    if (data.response['status'] == 0){
        showHand();
    }

    if(parseInt(mtype) == turn && data.response['status'] == 0 && data.requestType == 'changeTurn'){
        console.log('response-turn in');
        onChangeTurn();
    }
    
    if(data.playerID == playerID && data.response['status'] != 0){
        alert(data.response['message'])
    }
});

window.addEventListener('beforeunload', async function(event) {
    socket.emit("leave", {'partyID': partyID, 'playerID':playerID});
    socket.close();
    console.log('Socket closed');
});


socket.on('card-played', function(data) {
    if(data.response['status'] == 0){
        onCardPlayed(data);
    }
    if(data.playerID == playerID && data.response['status'] != 0){
        alert(data.response['message'])
    }

});

socket.on('end-game', function(data) {
    end(data);

    if (data.message)
        alert(data.message);
    
    stopPing();
    setTimeout(function() {
        window.location.href = '/';
    }, 3000);
});

function ping(){
    //console.log('ping', {'partyID':partyID, 'playerID':playerID})
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


function requestHand(partyID, playerID, mtype, handtype){
    socket.emit('get-hand', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype, 'handtype':handtype});
}

async function askFullScreen() {
    Swal.fire({
        title: '<span style="color: #fff;">Vuoi attivare il FullScreen?</span>',
        showCancelButton: true,
        confirmButtonText: 'Sì',
        cancelButtonText: 'No',
        background: '#333',
        customClass: {
            content: 'swal-content-custom'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // L'utente ha cliccato su "Sì"
            toggleFullScreen(document.documentElement);
            //console.log("L'utente ha confermato FullScreen");
        } else if (result.isDismissed) {
            //console.log("L'utente ha annullato o chiuso il popup");
        }
    });
}


function toggleFullScreen(elem) {
    // ## The below if statement seems to work better ## if ((document.fullScreenElement && document.fullScreenElement !== null) || (document.msfullscreenElement && document.msfullscreenElement !== null) || (!document.mozFullScreen && !document.webkitIsFullScreen)) {
    if ((document.fullScreenElement !== undefined && document.fullScreenElement === null) || (document.msFullscreenElement !== undefined && document.msFullscreenElement === null) || (document.mozFullScreen !== undefined && !document.mozFullScreen) || (document.webkitIsFullScreen !== undefined && !document.webkitIsFullScreen)) {
        if (elem.requestFullScreen) {
            elem.requestFullScreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullScreen) {
            elem.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }

        if (window.screen.orientation.lock) {
            window.screen.orientation.lock('landscape');
            console.log('Orientation locked');
        }

    } else {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}


function loadGeneralImages(){

    loadSpecificGeneralImages();

}

function alert(text,status = 1,title = '') {

    let real_title = ''
    if (title == '')
        real_title = '<span style="color: #fff;">Attenzione!</span>';
    else
        real_title = '<span style="color: #fff;">' + title + '</span>';
    
    let icon = 'warning'


    if(status == 0){
        if(title == '')
            title = '<span style="color: #fff;">Successo!</span>'
        else
            title = '<span style="color: #fff;">' + title + '</span>';

        icon = 'success'
    }
    return Swal.fire({
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

function startingFunction() {
    
    //loadAllImages();
    ///*
    socket.emit('join', {'playerID': playerID, 'partyID': partyID,'mtype': mtype});
    startPing();
    if (required_full_screen == 'True')
        askFullScreen();
    loadGeneralImages();
    //*/
}

startingFunction();