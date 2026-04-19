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



class mutex {
    constructor() {
        this.locked = false;
        this.queue = [];
    }

    // Richiede il lucchetto. Se è già preso, aspetta in coda.
    async lock() {
        return new Promise(resolve => {
            if (!this.locked) {
                this.locked = true; // Prende il lucchetto
                resolve();
            } else {
                this.queue.push(resolve); // Si mette in coda
            }
        });
    }

    // Rilascia il lucchetto e fa passare il prossimo in coda (se c'è)
    unlock() {
        if (this.queue.length > 0) {
            const nextResolve = this.queue.shift();
            nextResolve(); // Sblocca il prossimo della fila
        } else {
            this.locked = false; // Nessuno in coda, apre il lucchetto
        }
    }
}

alertMutex = new mutex();


socket.on('player-joined', function(data) {
    console.log('join', data);
    if(data.playerID == playerID){
        preloadCards();
        for (let handtype of handtypes) {
            requestHand(partyID, playerID, mtype, handtype);
        }
        socket.emit('get-playerList', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype});

        additionalInitialRequests();
    }
});


socket.on('responsepreloadCards',async  function(data) {
    console.log('responsepreloadCards',data.hand);

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
        // console.log('Received hand:', data.handtype, data.hand);
        showHand();
        
    }
});

socket.on('response-playerList', function(data) {
    playerList = data.playerList;

    onResponsePlayerList();

    if (playerID == data.playerID){
        socket.emit('get-turn', {'partyID':partyID, 'playerID':playerID});
    }
});


socket.on('response-turn', function(data) {
    turn = parseInt(data.turn);

    onResponseTurn();

    if (data.response['status'] == 0){
        if (playerID == data.playerID){
            showHand();
        }
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


socket.on('end-game', async function(data) {
    end(data);

    if (data.message)
        await alert(data.message);
    
    stopPing();
    window.location.href = '/';
});

socket.on('error', function(data) {
    alert(data.message, title='Error');
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

function preloadCards(){
    socket.emit('preloadCards', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype, 'gameName': endpoint});
}

function shakeScreen(time){
    shakeable.classList.add('shake');
    setTimeout(function() {
        shakeable.classList.remove('shake');
        bigCardCanDisappear = true;
    }, time);
}

function vibrateDevice(time){
    if (navigator.vibrate) {
        navigator.vibrate(time);
    }
}

function requestHand(partyID, playerID, mtype, handtype){
    socket.emit('get-hand', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype, 'handtype':handtype});
}

async function askFullScreen(orientationMode = 'landscape') {
    
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
        let isFullScreen = false;
        if (result.isConfirmed) {
            // L'utente ha cliccato su "Sì"
            isFullScreen = toggleFullScreen(document.documentElement, orientationMode = orientationMode);
            //console.log("L'utente ha confermato FullScreen");
        } else if (result.isDismissed) {
            //console.log("L'utente ha annullato o chiuso il popup");
        }

        additionalFullScreenActions(isFullScreen);
    });
}


function toggleFullScreen(elem, orientationMode = 'landscape') {
    let isFullScreen = false;

    if ((document.fullScreenElement !== undefined && document.fullScreenElement === null) || 
        (document.msFullscreenElement !== undefined && document.msFullscreenElement === null) || 
        (document.mozFullScreen !== undefined && !document.mozFullScreen) || 
        (document.webkitIsFullScreen !== undefined && !document.webkitIsFullScreen)) {
        
        isFullScreen = true; 

        if (elem.requestFullScreen) {
            elem.requestFullScreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullScreen) {
            elem.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }

        if (window.screen && window.screen.orientation && window.screen.orientation.lock) {
            window.screen.orientation.lock(orientationMode)
                .then(() => console.log('Orientation locked to: ' + orientationMode))
                .catch((err) => console.warn('Impossibile bloccare l\'orientamento:', err));
        }

    } else {
        isFullScreen = false; 

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

    return isFullScreen;
}


function loadGeneralImages(){

    loadSpecificGeneralImages();

}


async function alert(text, status = 1, title = '', YesNo = false) {

    console.log('Waiting for alert mutex...');
    await alertMutex.lock();
    console.log('Alert mutex acquired');

    try {
        const isMobile = window.matchMedia("(max-width: 750px)").matches;

        let swalConfig = {
            html: '<span style="color: #ddd;">' + text + '</span>',
            background: '#333',
            customClass: {
                content: 'swal-content-custom'
            }
        };

        if (isMobile) {
            swalConfig.width = '90%';
            swalConfig.padding = '1em';
            swalConfig.html = '<span style="color: #ddd; font-size: 0.9em; line-height: 1.4;">' + text + '</span>';
            swalConfig.customClass.popup = 'swal-popup-mobile';
            swalConfig.customClass.title = 'swal-title-mobile';
        }

        if (YesNo) {
            swalConfig.showCancelButton = true;
            swalConfig.confirmButtonText = 'Sì';
            swalConfig.cancelButtonText = 'No';
        } else {
            swalConfig.confirmButtonText = 'OK';
        }

        if (status === 0) {
            swalConfig.icon = 'success';
            finalTitle = title === '' ? 'Success!' : title;
        }else if (status === 1) {
            swalConfig.icon = 'warning';
            finalTitle = title === '' ? 'Warning!' : title;
        }else if (status === 2) {
            swalConfig.icon = 'error';
            finalTitle = title === '' ? 'Error!' : title;
        }else if (status === -1) {
            finalTitle = title === '' ? 'Info' : title;
        }

        swalConfig.title = '<span style="color: #fff;">' + finalTitle + '</span>';

        return await Swal.fire(swalConfig);

    } finally {
        alertMutex.unlock();
        console.log('Alert mutex released.');
    }
}


function startingFunction() {
    
    socket.emit('join', {'playerID': playerID, 'partyID': partyID,'mtype': mtype});
    startPing();
    if (required_full_screen == 'True')
        askFullScreen(fullScreenOrientationMode);
    loadGeneralImages();
}

startingFunction();