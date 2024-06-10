/*
var ip_address = "localhost"

fetch('/static/server_stats.json')
    .then(response => response.json())
    .then(data => ip_address = data['ip'])
    .catch(error => console.error('Errore:', error));

var socket = io.connect('http://'+ip_address);
*/

var maxHintHand = 3;
var maxActionHand = 3;
var maxHintCards = 2;
var maxBlockCards = 12;

//--------------------------------------------------------------------------------------------

var hand = {'hint':[], 'action':[]};
var preloadedImages = [];
var witheringLooksImages = []
var turn = 0;
var end = {'end':false, 'loser':0};
var bigCardCanDisappear = false;
var bigCardActive = false;
var playerList = [];
var witheringLooks = [];
//var firstAskHand = false;
var canShowHand = false;
var noisePoints = 0;

var urlParams = new URLSearchParams(window.location.search);
var playerID = parseInt(urlParams.get('playerID'));
var partyID = urlParams.get('partyID');
var mtype = urlParams.get('mtype');



//var images = document.getElementsByClassName('card');
var images = document.querySelectorAll('.card');
var bigCard = document.getElementById('showedCard');
var playContext = document.getElementById('context-play');
var blockContext = document.getElementById('context-block');
var blameContext = document.getElementById('context-blame');
var noiseButton = document.getElementById('noise-image');
var menu = document.querySelector('.menu');
const contextMenu = document.querySelector(".wrapper");

//var contextMenu = document.getElementById('context-menu');
//var contextPlayers = document.getElementById("context-choosePlayer");

/*
// Aggiungi un ascoltatore di eventi 'change' al select
contextMenu.addEventListener('click', async function(e) {
    var selectedOption = this.options[this.selectedIndex];
    var clickedElement = e.target;

    // Se l'elemento su cui è stato fatto clic non è un'opzione, cerca l'opzione più vicina
    if (clickedElement.tagName !== 'OPTION') {
        clickedElement = clickedElement.closest('option');
    }

    // Se abbiamo un'opzione, procediamo
    if (clickedElement && clickedElement.id) {
        switch (selectedOption.id) {
            case 'context-play':
                //console.log('Hai selezionato "Gioca"');
                playCard(contextMenu.getAttribute('selected-card'));
                break;
            case 'context-block':
                //console.log('Hai selezionato "Blocca"');
                for(let i=0;i<maxActionHand;i++){
                    if(hand['action'][i] < maxBlockCards){
                        playCard(contextMenu.getAttribute('selected-card'),hand['action'][i]);
                        console.log('Blocco',hand['action'][i]);
                        return;
                    }
                }
                alert("You don't have Block Cards")
                break;
            case 'context-blame':
                //console.log('Hai selezionato "Scaricabarile"');
                for(let i=0;i<maxActionHand;i++){
                    //console.log('Blame',hand['action'][i])
                    if(hand['action'][i] >= maxBlockCards){
                        //newTurn = await choosePlayer(contextMenu.offsetLeft+contextMenu.offsetWidth+ 2,contextMenu.offsetTop,[1,mtype]);
                        newTurn = await choosePlayer([1,parseInt(mtype)]);
                        if (newTurn == null) 
                            return;
                        playCard(contextMenu.getAttribute('selected-card'),hand['action'][i],others = {'newTurn':newTurn});

                        return;
                    }
                }
                alert("You don't have Blame Cards")
                break;
        }
    }
});
*/



playContext.addEventListener('click', function() {
    playCard(menu.getAttribute('selected-card'));
});
/*
interact('.card').draggable({
    inertia: true,
    modifiers: [
        interact.modifiers.restrict({
            restriction: 'parent',
            endOnly: true,
            elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
        })
    ],
    autoScroll: true,
    onstart: function (event) {
        event.target.style.cursor = 'default';
        event.target.style.transform = 'scale(1.1)'; // Aumenta la scala della carta
        event.target.style.boxShadow = '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)'; // Aggiungi un'ombra per dare un senso di elevazione
    },
    onmove: dragMoveListener,
    onend: function (event) {
        var target = event.target;
        var y = parseFloat(target.getAttribute('data-y')) || 0;

        if (y < -40) { // Se l'elemento è stato trascinato oltre 100px verso l'alto
            console.log('goooo')
            target.style.transform = 'translateY(-2000px) scale(1)'; // Continua a muovere l'elemento fuori dallo schermo e resetta la scala
            target.style.transition = 'transform 2s ease-in'; // Regola la durata e l'andamento dell'animazione
        } else {
            target.style.transform = 'translateY(0) scale(1)'; // Resetta la posizione e la scala
            target.style.transition = 'transform 500ms ease-out';
        }

        target.style.cursor = ''; // Reset the cursor style
        target.style.boxShadow = ''; // Reset the box shadow
    }
});

function dragMoveListener (event) {
    var target = event.target,
        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    target.style.webkitTransform =
    target.style.transform =
        'translateY(' + y + 'px) scale(1.1)'; // Mantieni la scala aumentata durante il trascinamento

    target.setAttribute('data-y', y);
}
*/


noiseButton.addEventListener('click', async function() {

    if(noisePoints == 0){
        alert("Hai speso tutti i tuoi Noise Points")
        return;
    }

    let targetPlayer = await choosePlayer([parseInt(mtype)],turn)
    if (targetPlayer == null)
        return;

    let noiseLevel = await Swal.fire({
        title: '<span style="color: #fff;">Seleziona un livello</span>',
        html: `<input type="range" id="noise-level" min="0" max="${noisePoints}" value="1" step="1">
               <span id="slider-value">1</span>`,
        showCancelButton: true,
        background: '#333',
        customClass: {
            content: 'swal-content-custom'
        },
        didOpen: () => {
            const input = Swal.getPopup().querySelector('#noise-level');
            const valueSpan = Swal.getPopup().querySelector('#slider-value');
            input.oninput = () => {
                valueSpan.textContent = input.value;
            };
        },
        preConfirm: () => {
            return document.getElementById('noise-level').value;
        }
    });

    if (noiseLevel.isConfirmed){
        console.log('noiseLevel',parseInt(noiseLevel.value))
        socket.emit('sosonline-noise', {'partyID':partyID, 'mtype':mtype, 'playerID':playerID, 'targetPlayer':targetPlayer, 'noiseLevel':parseInt(noiseLevel.value)});
    }

    /*
    inputOptions = {};
    for(let i=1;i<=noisePoints;i++){
        inputOptions[i] = i;
    }
    
    let noiseLevel = await Swal.fire({
        //title: 'Seleziona un giocatore',
        title: '<span style="color: #fff;">Seleziona un livello di fastidio</span>',
        input: 'select',
        inputOptions: inputOptions,
        //inputPlaceholder: 'Seleziona un\'opzione',
        showCancelButton: true,
        background: '#333',
        customClass: {
            content: 'swal-content-custom'
        }
    });

    if (noiseLevel.isConfirmed){
        
        console.log('noiseLevel',parseInt(noiseLevel.value))
        socket.emit('sosonline-noise', {'partyID':partyID, 'mtype':mtype, 'playerID':playerID, 'targetPlayer':targetPlayer, 'noiseLevel':parseInt(noiseLevel.value)});
    }
    */
});

blockContext.addEventListener('click', function() {
    for(let i=0;i<maxActionHand;i++){
        if(hand['action'][i] < maxBlockCards){
            playCard(menu.getAttribute('selected-card'),hand['action'][i]);
            console.log('Blocco',hand['action'][i]);
            return;
        }
    }
    alert("You don't have Block Cards")
});

blameContext.addEventListener('click', async function() {
   
    for(let i=0;i<maxActionHand;i++){
        //console.log('Blame',hand['action'][i])
        if(hand['action'][i] >= maxBlockCards){
            newTurn = await choosePlayer([1,parseInt(mtype)]);
            if (newTurn == null) 
                return;
            playCard(menu.getAttribute('selected-card'),hand['action'][i],others = {'newTurn':newTurn});

            return;
        }
    }
    alert("You don't have Blame Cards")
});

window.addEventListener('beforeunload', async function(event) {
    socket.emit("leave", {'partyID': partyID, 'playerID':playerID});
    socket.close();
    console.log('Socket closed');
});

/*
window.addEventListener('popstate', async function(event) {
    event.preventDefault();

    const result = await Swal.fire({
        title: '<span style="color: #fff;">Sei sicuro di voler uscire?</span>',
        showCancelButton: true,
        confirmButtonText: 'Sì',
        cancelButtonText: 'No',
        background: '#333',
        customClass: {
            content: 'swal-content-custom'
        }
    });

    if (result.isConfirmed) {
        // L'utente ha cliccato su "Sì"
        socket.emit("leave", {'partyID': partyID, 'playerID':playerID});
        socket.close();
        console.log('Socket closed');
        history.go(-1); // Permette di tornare indietro se l'utente conferma
    } else if (result.isDismissed) {
        // L'utente ha annullato o chiuso il popup
        history.pushState(null, null, location.href); // Impedisce di tornare indietro se l'utente annulla
    }
});

// Impedisce di tornare indietro quando la pagina viene caricata
history.pushState(null, null, location.href);
window.onpopstate = function () {
    history.go(1);
};
*/

/*
window.addEventListener("click", e => {
    e.preventDefault();
    let x = e.offsetX, y = e.offsetY,
    winWidth = window.innerWidth,
    winHeight = window.innerHeight,
    cmWidth = contextMenu.offsetWidth,
    cmHeight = contextMenu.offsetHeight;
    x = x > winWidth - cmWidth ? winWidth - cmWidth - 5 : x;
    y = y > winHeight - cmHeight ? winHeight - cmHeight - 5 : y;
    
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
    contextMenu.style.visibility = "visible";
});
*/


images.forEach(function(image) {
    image.addEventListener('click', function(e) {
        var parts = this.src.split('/');
        var card = parts[parts.length - 1].split('.')[0];
        if(card != '0'){
            e.preventDefault();
            let x = e.pageX, y = e.pageY,
            winWidth = window.innerWidth,
            winHeight = window.innerHeight,
            cmWidth = contextMenu.offsetWidth,
            cmHeight = contextMenu.offsetHeight;

            x = x > winWidth - cmWidth ? winWidth - cmWidth - 5 : x;
            y = y > winHeight - cmHeight ? winHeight - cmHeight - 5 : y;
            
            contextMenu.style.left = `${x}px`;
            contextMenu.style.top = `${y}px`;

            
            blockContext.textContent = 'Blocca x'+hand['action'].filter(x => x < maxBlockCards).length;
            blameContext.textContent = 'Scaricabarile x'+hand['action'].filter(x => x >= maxBlockCards).length;

            contextMenu.style.visibility = "visible";
            /*
            var imageSrc = this.src;
            console.log('imageSrc',imageSrc);
            var parts = imageSrc.split('/');
            */

            //menu.setAttribute('selected-card', parts[parts.length - 1].split('.')[0]);
            
            menu.setAttribute('selected-card', card);
        }
    });


    image.addEventListener('contextmenu', function (event) {
        // Prevenire l'apparizione del menu contestuale
        event.preventDefault();
      });
});

//document.addEventListener("click", () => contextMenu.style.visibility = "hidden");

document.addEventListener('click', function(e) {
    if(e.target.className === 'card'){
        var parts = e.target.src.split('/');
        var card = parts[parts.length - 1].split('.')[0];
        console.log('click',e.target.className,card)
        if(card == '0'){   
            contextMenu.style.visibility = 'hidden';
        }
    }else if (e.target.className !== 'card') {
        contextMenu.style.visibility = 'hidden';
    }
});

/*
socket.on('response-inGameCards', function(data) {
    console.log('response-inGameCards',data.hand);
    
    if(data.targetPlayer == playerID || data.targetPlayer == undefined){
        //console.log('in')
        data.hand.forEach((card, i) => {
            //console.log('preloadedImages[card]',preloadedImages[card]);
            if(preloadedImages[card] == undefined){
                preloadedImages[card] = new Image();
                preloadedImages[card].src = '/static/SosOnline/images/' + card + '.png';
                console.log("preloaded "+preloadedImages[card].src)
            }
        });
        canShowHand = true;
    }
    //socket.emit('get-hand', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype, 'handtype':'hint'});
    //socket.emit('get-hand', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype, 'handtype':'action'});
});
*/
socket.on('response-inGameCards',async  function(data) {
    console.log('response-inGameCards',data.hand);

    if(data.targetPlayer == playerID || data.targetPlayer == undefined){
        // Mostra la barra di caricamento
        let loadingBar = document.getElementById('loadingBar');
        //loadingBar.style.display = 'block';
        loadingBar.value = 0;

        data.hand.forEach( async (card, i) => {
            if(preloadedImages[card] == undefined){
                preloadedImages[card] = new Image();
                preloadedImages[card].src = '/static/SosOnline/images/' + card + '.png';
                console.log("preloaded "+preloadedImages[card].src)

                // Ascolta l'evento 'load' per sapere quando l'immagine è stata caricata
                preloadedImages[card].addEventListener('load', async function() {
                    // Aggiorna il valore della barra di caricamento
                    loadingBar.value++;
                    // Se tutte le immagini sono state caricate, nascondi la barra di caricamento
                    if (loadingBar.value === 3) {
                        loadingBar.style.display = 'none';
                        canShowHand = true;
                    }
                });
            }
        });
        //canShowHand = true;
    }
});


socket.on('response-hand', async function(data) {
    ///*
    while(canShowHand == false){
        //console.log('ShowHand -------- response-hand waiting');
        await new Promise(r => setTimeout(r, 100));
    }

    //console.log('response-hand',data);
    if(data.handtype == 'hint'){
        /*
        var hintHand = JSON.parse(data.hand).map(function(item) {
            return parseInt(item);
        });
        */
        data.hand.forEach((card, i) => {
            //console.log('preloadedImages[card]',preloadedImages[card]);
            if(preloadedImages[card] == undefined){
                preloadedImages[card] = new Image();
                preloadedImages[card].src = '/static/SosOnline/images/' + card + '.png';
                console.error("preloaded "+preloadedImages[card].src)
            }
        });
    }
    //*/

    if(data.playerID == playerID){
        
        //console.log('in')
        /*
        hand[data.handtype] = JSON.parse(data.hand).map(function(item) {
            return parseInt(item);
        });
        console.log('response-hand',hand);
        */
        /*
        hand[data.handtype] = JSON.parse(data.hand).map(function(item) {
            return parseInt(item);
        });
        //*/
        hand[data.handtype] = data.hand;
        //console.log('response-hand',hand[data.handtype]);
        /*
        if(firstAskHand == false){
            hand[data.handtype].forEach((card, i) => {
                preloadedImages[card] = new Image();
                preloadedImages[card].src = '/static/SosOnline/images/' + card + '.png';
                //console.log("Preloaded",preloadedImages[card].src);
            });
            
            //preloadedImages[0] = new Image();
            //preloadedImages[0].src = '/static/SosOnline/images/0.png';
        }
        //*/

        //console.log('show')
        //console.log('ShowHand -------- response-hand');
        showHand();
        /*
        if(firstAskHand == false){
            firstAskHand = true;
            //loadAllImages();
        }
        //*/
    }
});

socket.on('receive-noise', function(data) {
    console.log('receive-noise',data,playerID);
    if(data.response['status'] == 0){
        if(data.targetPlayer == parseInt(mtype)){
            console.log('receive-noise',data.noiseLevel);
            navigator.vibrate(1000 * data.noiseLevel)
            shakeScreen(1000 * data.noiseLevel);
        }
    }
    if(data.playerID == playerID){
        alert(data.response['message'],data.response['status'])
    }
});

/*
function shakeScreen(intensity, duration) {
    var body = document.body;
    var shakes = duration / 100;
    var speed = 100; // quanto velocemente dovrebbe "shakare" lo schermo
    var angle = intensity; // quanto dovrebbe ruotare lo schermo
    var count = 0;

    var shakeInterval = setInterval(function() {
        if (count++ % 2 === 0) {
            body.style.transform = 'rotate(' + angle + 'deg)';
        } else {
            body.style.transform = 'rotate(-' + angle + 'deg)';
        }

        if (count > shakes) {
            clearInterval(shakeInterval);
            body.style.transform = '';
        }
    }, speed);
}
*/

function shakeScreen(time){
    shakeable.classList.add('shake');
    setTimeout(function() {
        shakeable.classList.remove('shake');
        bigCardCanDisappear = true;
    }, time);
}


socket.on('response-noise', function(data) {
    //console.log('response-noise',data);
    if(data.playerID == playerID){
        //console.log('response-noise');
        noisePoints = data.noisePoints;
    }
});

socket.on('response-turn', function(data) {
    turn = parseInt(data.turn);

    if (data.response['status'] == 0){
        document.getElementById('playerTurn').innerHTML = 'Giocatore di turno: '+ getPlayer(turn).name;
        //console.log('ShowHand -------- response-turn');
        showHand();
    }

    //console.log('response-turn',parseInt(mtype),turn,parseInt(mtype) == turn,data.response['status']);
    if(parseInt(mtype) == turn && data.response['status'] == 0 && data.requestType == 'changeTurn'){
        console.log('response-turn in');
        navigator.vibrate(400)
    }
    
    if(data.playerID == playerID && data.response['status'] != 0){
        alert(data.response['message'])
    }
});


socket.on('player-joined', function(data) {
    //console.log('join', data);
    if(data.playerID == playerID){
        socket.emit('sosonline-get-inGameCards', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype});
        socket.emit('get-hand', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype, 'handtype':'hint'});
        socket.emit('get-hand', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype, 'handtype':'action'});
        socket.emit('get-playerList', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype});
        socket.emit('sosonline-get-noise', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype});
    }
    //document.getElementById('playerTurn').innerHTML = 'Giocatore di turno: ' + data.playerID;
});

socket.on('response-playerList', function(data) {
    playerList = data.playerList;
    witheringLooks = new Array(playerList.length).fill(null);
    socket.emit('get-turn', {'partyID':partyID, 'playerID':playerID});
    /*
    // Rimuovi tutte le opzioni esistenti
    while (contextPlayers.firstChild) {
        contextPlayers.removeChild(contextPlayers.firstChild);
    }

    playerList.forEach((player, i) => {
        witheringLooks[player.mtype] = player.points;

        // Crea una nuova opzione
        var option = document.createElement("option");
        option.value = player.mtype;  // Imposta il valore dell'opzione come l'ID del giocatore
        option.text = player.name;  // Imposta il testo dell'opzione come il nome del giocatore
        option.setAttribute('data-mtype', player.mtype);  // Imposta un attributo data-* con il tipo del giocatore
        option.setAttribute('data-playerID', player.playerID);  // Imposta un attributo data-* con il tipo del giocatore
        //console.log('response-playerList added',player);

        // Aggiungi l'opzione al <contextPlayers>
        contextPlayers.appendChild(option);
    });

    contextPlayers.setAttribute("size", playerList.length);
    //console.log('response-playerList',playerList);
    //console.log('response-playerList',contextPlayers);
    */
});

socket.on('card-played', function(data) {
    card = parseInt(data.cards[0]);
    if(data.response['status'] == 0){
        if(data.handtype[0] == "wl"){            
            if(data.others['victim'] == parseInt(mtype)){
                showPlayedCard(card,data.handtype[0],1);
            }else{
                showPlayedCard(card,data.handtype[0]);
            }
            /*
            if(data.others['victim'] == parseInt(mtype)){
                navigator.vibrate(750 * card)
            }
            */

        }else{
            //console.log('card-played', card);
            showPlayedCard(card,data.handtype[0]);
        }
    }
    if(data.playerID == playerID && data.response['status'] != 0){
        alert(data.response['message'])
    }
    
    /*
    if(data.playerID == playerID){
        var cardIndex = hand['hint'].indexOf(card);
        if (cardIndex > -1) {
            hand['hint'].splice(cardIndex, 1);
        }
        showHand();
    }
    */
});

socket.on('game-end', function(data) {
    console.log('game-end', data);
    end = {'end':true, 'loser':data['loser']};
});

async function endGame(loser) {
    
    images.forEach(function(image) {
        image.style.display = 'none';
    });

    if(loser != mtype){
        var result = await Swal.fire({
            title: '<span style="color: #fff;">Partita terminata!</span>',
            //html: '<span style="color: #fff;">Il Signore Oscuro ha fatto molto male a '+getPlayer(loser).name+'</span>',
            html: '<span style="color: #fff;">Sei riuscito a sopravvivere all\'ira (giusta) dell\'Oscuro Signore <br>Goblin '+getPlayer(loser).name+' non è stato così fortunato</span>',
            icon: 'success',
            confirmButtonText: 'Torna alla home',
            background: '#333',
            width: '600px',
            customClass: {
                //content: 'swal-content-custom'
                popup: 'end-game-animation'
            },
            willOpen: function () {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        });
    }else{
        var result = await Swal.fire({
            title: '<span style="color: #fff;">Partita terminata!</span>',
            html: '<span style="color: #fff;">Sei un fallimento! E infatti sei schiattato male</span>',
            icon: 'error',
            confirmButtonText: 'Torna alla home',
            background: '#333',
            width: '600px',
            customClass: {
                popup: 'end-game-animation'
            }
        });
    }
    

    if (result.isConfirmed) {
        window.location.href = '/SosOnline';
    }
}

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

function getPlayer(mtype){
    for (let player of playerList) {
        if (player.mtype == mtype) {
            return player;
        }
    }
    return null;
}

function playCard(card,actionCard = 0,others=null){
    console.log('playCard',card);
    //console.log('play-card', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype, 'cards':[parseInt(card),parseInt(actionCard)], 'handtype':['hint','action'],'others':others})
    socket.emit('play-card', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype, 'cards':[parseInt(card),parseInt(actionCard)], 'handtype':['hint','action'],'others':others});
    /*
    if(actionCard != 0){
        socket.emit('play-card', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype, 'card':actionCard, 'handtype':'action', 'askHand':1});
    }
    */
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

/*
function handlePlayerChoice(x, y,foreignPlayers){
    return new Promise((resolve, reject) => {

        for (var i = 0; i < foreignPlayers.length;i++) {
            contextPlayers.options[foreignPlayers[i]-1].style.display = 'none';
        }
        contextPlayers.style.left = x + 'px';
        contextPlayers.style.top = y + 'px';
        

        //contextPlayers.setAttribute("size", playerList.length - foreignPlayers.length);
        contextPlayers.style.display = 'block';
        //console.log('handlePlayerChoice',contextPlayers.style.display,contextPlayers.style.left,contextPlayers.style.top)
        
        // Aggiungi un gestore di eventi per l'evento 'click'
        contextPlayers.addEventListener('click', function(event) {
            // L'elemento cliccato è event.target
            var clickedOption = event.target;

            // Ottieni l'attributo 'data-mtype' dell'elemento cliccato
            var mtype = clickedOption.getAttribute('data-mtype');

            // Nascondi contextPlayers
            contextPlayers.style.display = 'none';
            contextMenu.style.display = 'none';
            for (var i = 0; i < foreignPlayers.length;i++) {
                contextPlayers.options[foreignPlayers[i]-1].style.display = 'block';
            }
            //contextPlayers.setAttribute("size", playerList.length);

            // Risolvi la promessa con mtype
            resolve(mtype);
        });

        
    });
}

async function choosePlayer(x, y, foreignPlayers) {
    console.log('choosePlayer',x,y,foreignPlayers);
    let mtype = await handlePlayerChoice(x, y,foreignPlayers);
    // Fai qualcosa con mtype
    //console.log(mtype);
    return parseInt(mtype);
}
*/

async function choosePlayer(foreignPlayers,defaultChoice = null) {
    let inputOptions = {};
    for (let player of playerList) {
        if (!foreignPlayers.includes(player.mtype)) {
            inputOptions[player.mtype] = player.name;
        }
    }

    let result = await Swal.fire({
        //title: 'Seleziona un giocatore',
        title: '<span style="color: #fff;">Seleziona un giocatore</span>',
        input: 'select',
        inputValue: defaultChoice,
        inputOptions: inputOptions,
        //inputPlaceholder: 'Seleziona un\'opzione',
        showCancelButton: true,
        background: '#333',
        customClass: {
            content: 'swal-content-custom'
        }
    });

    if (result.isConfirmed) {
        return parseInt(result.value);
    } else {
        return null;
    }
}

async function chooseOther(title,list) {
    let result = await Swal.fire({
        //title: title,
        title: '<span style="color: #fff;">'+title+'</span>',
        input: 'select',
        inputOptions: list,
        //inputPlaceholder: 'Seleziona un\'opzione',
        showCancelButton: true,
        background: '#333',
        customClass: {
            content: 'swal-content-custom'
        }
    });

    if (result.isConfirmed) {
        return result.value;
    } else {
        return null;
    }
}

function showHand(){
    if(bigCardActive == false){
        //console.log('showHand',hand);
        //var ncard = 1;
        for(let i=0;i<maxHintHand;i++){
            /*
            var imageElement = document.getElementById('card'+ncard);
            */
            pos = hand['hint'][i] || 0;
            img = preloadedImages[pos].src;
            //imageElement.src = img;
            images[i].src = img;
            images[i].setAttribute('used', 'false');
            //ncard++;
        }
    }
}

function handleBigCardClick() {
    if(bigCardCanDisappear == true){
        bigCard.style.display = 'none'; // Nascondi bigCard
        bigCardActive = false;
        //console.log('ShowHand -------- handleBigCardClick');
        showHand();
        bigCard.removeEventListener('click', handleBigCardClick); // Rimuovi il listener di eventi
        bigCardCanDisappear = false;
        if(end['end'] == true){
            endGame(end['loser']);
        }
    }
}

async function showPlayedCard(card,handtype,vibration = 0){
    if(handtype == 'wl'){
        img = witheringLooksImages[card].src;

    }else{
        img = preloadedImages[card].src;
    }


    for (var i = 0; i < images.length; i++) {
        images[i].src = preloadedImages[0].src;
        //console.log('showPlayedCard',images[i].src);
    }

    bigCardActive = true;
    bigCard.src = img;
    contextMenu.style.visibility = 'hidden';
    bigCard.style.display = 'block'; // Mostra bigCard
    if(handtype == 'wl'){
        await waitForVisibility()

        bigCard.classList.add('card-grow');
        if(vibration == 1){
            setTimeout(function() {
                navigator.vibrate(2000 * card)
                shakeScreen(2000 * card)
                //navigator.vibrate(2000)
            }, 1720);
        }
    }else{
        bigCard.classList.add('card-drop');
    }
    //console.log('showPlayedCard',img);


    bigCard.addEventListener('click', handleBigCardClick);
}

function waitForVisibility() {
    return new Promise(resolve => {
        const intervalId = setInterval(() => {
            if (!document.hidden) {
                clearInterval(intervalId);
                resolve();
            }
        }, 100); // controlla ogni 100 ms
    });
}

bigCard.addEventListener('animationend', function() {
    this.classList.remove('card-grow');
    this.classList.remove('card-drop');

    if (!shakeable.classList.contains('shake')){
        bigCardCanDisappear = true;
    }

    //console.log('bigCard animationend');
    /*
    var vibrationClass = Array.from(this.classList).find(className => className.startsWith('vibration-'));
    if (vibrationClass) {
        var vibrationLevel = vibrationClass.replace('vibration-', '');
        console.log('Il numero dopo "vibration-" è: ' + vibrationLevel);
        navigator.vibrate(1000 * vibrationLevel)
        this.classList.remove('vibration-' + vibrationLevel);
    }
    */
});

/*
window.onload = function() {
    startingFunction()
}
*/


function loadAllImages(){
    fetch('/static/SosOnline/SosOnlineLimits.json')
    .then(response => response.json())
    .then(data => {
        maxHintHand = data.maxHintHand;
        maxActionHand = data.maxActionHand;
        maxHintCards = data.maxHintCards;
        maxBlockCards = data.maxBlockCards;

        //console.log("maxHintCards",maxHintCards);
        for (var i = 0; i < maxHintCards+1; i++) {
            preloadedImages[i] = new Image();
            preloadedImages[i].src = '/static/SosOnline/images/' + i + '.png';
            //console.log("Preloaded",preloadedImages[i].src);
        }

        //showPlayedCard(0,'');

        //bigCard.src = preloadedImages[0].src;

        for (var i = 1; i < 4; i++) {
            witheringLooksImages[i] = new Image();
            witheringLooksImages[i].src = '/static/SosOnline/images/wl' + i + '.png';
            
            //console.log("Preloaded wl",witheringLooksImages[i].src);
        }
    })
    .catch(error => console.error('Errore:', error));

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

function loadGeneralImages(){

    preloadedImages[0] = new Image();
    preloadedImages[0].src = '/static/SosOnline/images/0.png';

    for (var i = 1; i < 4; i++) {
        witheringLooksImages[i] = new Image();
        witheringLooksImages[i].src = '/static/SosOnline/images/wl' + i + '.png';
        //console.log("Preloaded wl",witheringLooksImages[i].src);
    }


}

async function fakeLoading(){
    for (var i = 0; i < 3; i++) {
        loadingBar.value++;
        await new Promise(r => setTimeout(r, 1000));
    }
    loadingBar.style.display = 'none';
}

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
    
    //loadAllImages();
    ///*
    socket.emit('join', {'playerID': playerID, 'partyID': partyID,'mtype': mtype});
    startPing();
    askFullScreen();
    loadGeneralImages();
    //*/
}

async function f(){
    
    askFullScreen();
    await fakeLoading()
    console.log('startingFunction');
    for(var i = 1; i < 4; i++){
        preloadedImages[i] = new Image();
        preloadedImages[i].src = '/static/SosOnline/images/' + i + '.png';
        hand['hint'].push(i);
        console.log("preloaded "+preloadedImages[i].src)
    }
    showHand();
}



//f()     /*
startingFunction()
//*/