/*
var ip_address = "localhost"

fetch('/static/server_stats.json')
    .then(response => response.json())
    .then(data => ip_address = data['ip'])
    .catch(error => console.error('Errore:', error));

var socket = io.connect('http://'+ip_address);
*/

//--------------------------------------------------------------------------------------------
var witheringLooks = [];
var maxHintCards = 2;
var witheringLooksImages = [];
var preloadedImages = [];
var turn = 0;
var playerList = [];

var urlParams = new URLSearchParams(window.location.search);
var playerID = parseInt(urlParams.get('playerID'));
var partyID = urlParams.get('partyID');
var mtype = urlParams.get('mtype');



var image = document.getElementById('card1');
//var contextMenu = document.getElementById('context-menu');
var bigCard = document.getElementById('showedCard');
var wlContext = document.getElementById('context-wl');

var menu = document.querySelector('.menu');
const contextMenu = document.querySelector(".wrapper");
var letDrawButton = document.getElementById('letDrawButton')
var turnButton = document.getElementById('turnButton')
var noiseButton = document.getElementById('noise-image');
//var contextPlayers = document.getElementById("context-choosePlayer");

/*
// Aggiungi un ascoltatore di eventi 'change' al select
contextMenu.addEventListener('click',async function(e) {
    var selectedOption = this.options[this.selectedIndex];
    var clickedElement = e.target;

    // Se l'elemento su cui è stato fatto clic non è un'opzione, cerca l'opzione più vicina
    if (clickedElement.tagName !== 'OPTION') {
        clickedElement = clickedElement.closest('option');
    }

    // Se abbiamo un'opzione, procediamo
    if (clickedElement && clickedElement.id) {
        switch (selectedOption.id) {
            case 'context-wl':
                //console.log('Hai selezionato "Gioca"');
                //playCard(contextMenu.getAttribute('selected-card'));
                
                //mtype = await choosePlayer(contextMenu.offsetLeft+contextMenu.offsetWidth+ 2,contextMenu.offsetTop,[1]);
                mtype = await choosePlayer([1]);
                if (mtype == null) 
                    return;
                console.log('wl',mtype);
                playWl(witheringLooks[mtype] + 1,mtype);
                break;
        }
    }
});
*/

wlContext.addEventListener('click', async function() {
    targetPlayer = await choosePlayer([1],turn);
    if (targetPlayer == null) 
        return;
    console.log('wl',targetPlayer);
    playWl(witheringLooks[targetPlayer] + 1,targetPlayer);
});

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

/*
function handlePlayerChoice(x, y,foreignPlayers){
    return new Promise((resolve, reject) => {

        for (var i = 0; i < foreignPlayers.length;i++) {
            contextPlayers.options[foreignPlayers[i]-1].style.display = 'none';
        }
        contextPlayers.style.left = x + 'px';
        contextPlayers.style.top = y + 'px';
        contextPlayers.style.display = 'block';

        

        
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

            // Risolvi la promessa con mtype
            resolve(mtype);
        });

        
    });
}

async function choosePlayer(x, y, foreignPlayers) {
    let mtype = await handlePlayerChoice(x, y,foreignPlayers);
    // Fai qualcosa con mtype
    //console.log(mtype);
    return parseInt(mtype);
}
*/
/*
image.addEventListener('click', function(event) {
    // Mostra il menu contestuale
    //contextPlayers.style.display = 'none';
    contextMenu.style.display = 'block';

    // Posiziona il menu contestuale nel punto in cui è stato fatto clic
    contextMenu.style.left = event.pageX + 'px';
    contextMenu.style.top = event.pageY + 'px';

    // Ottieni il src dell'immagine
    var imageSrc = this.src;
    var parts = imageSrc.split('/');

    contextMenu.setAttribute('selected-card', parts[parts.length - 1].split('.')[0]);
});
*/

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
        contextMenu.style.visibility = "visible";
        /*
        var imageSrc = this.src;
        console.log('imageSrc',imageSrc);
        var parts = imageSrc.split('/');
        */

        //menu.setAttribute('selected-card', parts[parts.length - 1].split('.')[0]);
        
    }
});

image.addEventListener('contextmenu', function (event) {
    // Prevenire l'apparizione del menu contestuale
    event.preventDefault();
});

document.addEventListener('click', function(e) {    

    /*
    if (e.target.className !== 'context-menu' && e.target.className !== 'contextMenu-option') {
        //console.log('click outside contextPlayers');
        contextPlayers.style.display = 'none';
        if (e.target.className !== 'card') {
            contextMenu.style.display = 'none';
        }
    }
    if (e.target.className == 'contextMenu-option') {
        contextMenu.style.display = 'none';
    }
    //console.log(e.target.className);
    */
    if (e.target.className !== 'card') {
        contextMenu.style.visibility = 'hidden';
    }
});

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


window.addEventListener('beforeunload', function(event) {
    socket.emit("leave", {'partyID': partyID, 'playerID':playerID});
    socket.close();
    console.log('Socket closed');
});

socket.on('response-turn', function(data) {
    //console.log('response-turn', data);
    turn = parseInt(data.turn);

    if (data.response['status'] == 0 && getPlayer(turn)){
        document.getElementById('playerTurn').innerHTML = 'Giocatore di turno: '+ getPlayer(turn).name;
        showHand();
    }

    if(data.playerID == playerID && data.response['status'] != 0){
        alert(data.response['message'])
    }
});

socket.on('response-points', function(data) {
    witheringLooks = data.points;
});

socket.on('response-playerList', function(data) {
    playerList = data.playerList;
    witheringLooks = new Array(playerList.length).fill(null);

    playerList.forEach((player, i) => {
        witheringLooks[player.mtype] = player.points;
    });

    socket.emit('get-turn', {'partyID':partyID, 'playerID':playerID});
    // Rimuovi tutte le opzioni esistenti
    /*
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


        // Aggiungi l'opzione al <contextPlayers>
        contextPlayers.appendChild(option);
    });

    contextPlayers.setAttribute("size", playerList.length);
    */
});

socket.on('response-inGameCards', function(data) {
    console.log('response-inGameCards',data.hand);
    data.hand.forEach((card, i) => {
        //console.log('preloadedImages[card]',preloadedImages[card]);
        if(preloadedImages[card] == undefined){
            preloadedImages[card] = new Image();
            preloadedImages[card].src = '/static/SosOnline/images/' + card + '.png';
            console.log("preloaded "+preloadedImages[card].src)
        }
    });
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



function shakeScreen(time){
    shakeable.classList.add('shake');
    setTimeout(function() {
        shakeable.classList.remove('shake');
    }, time);
}

socket.on('response-noise', function(data) {
    //console.log('response-noise',data);
    if(data.playerID == playerID){
        //console.log('response-noise');
        noisePoints = data.noisePoints;
    }
});

socket.on('player-joined', function(data) {
    if(data.playerID == playerID){
        //socket.emit('get-all-points', {'partyID':partyID});
        socket.emit('get-playerList', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype});
        socket.emit('get-turn', {'partyID':partyID, 'playerID':playerID});
        socket.emit('sosonline-get-inGameCards', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype});
        socket.emit('sosonline-get-noise', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype});
    }
});

socket.on('ping', function(data) {
    socket.emit('pong', {'partyID':partyID, 'playerID':playerID});
});

function getPlayer(mtype){
    for (let player of playerList) {
        if (player.mtype == mtype) {
            return player;
        }
    }
    return null;
}

turnButton.addEventListener('click', async function() {
    /*
    var newTurn = -1
    while(newTurn < 2){
        newTurn = parseInt(prompt("A quale giocatore vuoi passare il turno? "));
        
        console.log("got turn "+newTurn)
        if(newTurn == null) 
            return;
    }
    */
    var nextTurn = turn + 1;
    if(nextTurn > playerList.length){
        nextTurn = 2;
    }
    //console.log(nextTurn)
    newTurn = await choosePlayer([1,turn],nextTurn);
    if (newTurn == null) 
        return;
    console.log("changing turn in "+newTurn)
    socket.emit('sosonline-change-turn', {'partyID':partyID,'playerID':playerID, 'mtype':mtype, 'newTurn':newTurn} );
});

letDrawButton.addEventListener('click', async function() {
    
    /*
    var targetPlayer = -1
    var deck = 0;
    var verboseDeck = 'hint'
    while(targetPlayer < 2){
        targetPlayer = parseInt(prompt("Quale giocatore vuoi far pescare? "));
        //console.log("got turn "+targetPlayer)
        if(isNaN(targetPlayer)) 
            return;
        console.log("got targetPlayer "+targetPlayer)
    }
    while(deck != 1 && deck != 2){
        deck = parseInt(prompt("Quale tipo di carta vuoi far pescare? (1) Spunto, (2) Azione "));
        //console.log("got turn "+targetPlayer)
        console.log("got deck "+deck)
        if(isNaN(deck)) 
            return;
        
    }
    if(deck == 1)
        verboseDeck = 'hint'
    else if(deck == 2)
        verboseDeck = 'action'
    */

    var targetPlayer = await choosePlayer([1],turn);
    if (targetPlayer == null) 
        return;
    var verboseDeck = await chooseOther("Quale carta vuoi far pescare?",{'hint':'Carta Spunto','action':'Carta Azione'});
    if (verboseDeck == null) 
        return;

    console.log("Player "+targetPlayer+" is drawing from deck "+verboseDeck)
    socket.emit('draw', {'partyID':partyID,'playerID':playerID, 'mtype':mtype, 'targetPlayer':targetPlayer,'targetHand':verboseDeck,'handtype':verboseDeck} );
});

socket.on('response-letDraw', function(data) {
    
    //console.log('card-played', data);
    if(data.playerID == playerID){
        if(data.response['status'] == 0){
            alert("Carta pescata con successo",0);
        }else{
            alert(data.response['message'])
        }
        //console.log(data.response)
    }
    
});

socket.on('response-hand', function(data) {
    ///*
    if(data.handtype == 'hint'){
        data.hand.forEach((card, i) => {
            //console.log('preloadedImages[card]',preloadedImages[card]);
            if(preloadedImages[card] == undefined){
                preloadedImages[card] = new Image();
                preloadedImages[card].src = '/static/SosOnline/images/' + card + '.png';
                console.log("preloaded "+preloadedImages[card].src)
            }
        });
    }
});

socket.on('card-played', function(data) {
    card = parseInt(data.cards[0]);
    //console.log('card-played', data);

    if(data.response['status'] == 0){
        if(data.handtype[0] == "wl"){
            witheringLooks[data.others.victim] = card;
            //console.log('wlLevel ',card, ' to player ', data.others.victim);
            alert("Occhiataccia lanciata con successo!",data.response['status'])
            showHand();
        }else{
            //console.log('card-played', card);
            showPlayedCard(card,data.handtype[0]);

        }
    }
    if(data.playerID == playerID && data.response['status'] != 0){
        alert(data.response['message'])
    }
    
});

socket.on('game-end', function(data) {
    console.log('game-end', data);
});

function playWl(wl,targetPlayer){
    //console.log('play-card', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype, 'cards': [wl], 'handtype':['wl'],others:{'victim':mtype}});
    socket.emit('play-card', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype, 'cards': [wl], 'handtype':['wl'],others:{'victim':targetPlayer}, 'askHand':0} );
}

function handleBigCardClick() {
    bigCard.style.display = 'none'; // Nascondi bigCard
    
    //turnButton.style.visibility = 'visible';
    //letDrawButton.style.visibility = 'visible';
    showHand();
    bigCard.removeEventListener('click', handleBigCardClick); // Rimuovi il listener di eventi
}

function showPlayedCard(card,handtype){
    if(handtype == 'wl'){
        img = witheringLooksImages[card].src;
    }else{
        img = preloadedImages[card].src;
    }

    image.src = preloadedImages[0].src;
    
    bigCard.src = img;
    contextMenu.style.visibility = 'hidden';
    //turnButton.style.visibility = 'hidden';
    //letDrawButton.style.visibility = 'hidden';

    bigCard.style.display = 'block'; // Mostra bigCard
    bigCard.classList.add('card-drop');
    //console.log('showPlayedCard',img);


    bigCard.addEventListener('click', handleBigCardClick);
}

bigCard.addEventListener('animationend', function() {
    this.classList.remove('card-drop');
  });

function showHand(){
    //console.log(witheringLooks[turn])
    let wlLevel = witheringLooks[turn] + 1;
    if(wlLevel >= 4) 
        wlLevel = 3;
    //console.log('wlLevel',wlLevel);
    image.src = witheringLooksImages[wlLevel].src;
    console.log('showHand',wlLevel);
}

/*
window.onload = function() {
    startingFunction()
}
*/

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


function alert(text,status = 1) {
    var title = '<span style="color: #fff;">Attenzione!</span>';
    var icon = 'warning'
    //console.log(status)
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
            console.log("L'utente ha confermato FullScreen");
        } else if (result.isDismissed) {
            console.log("L'utente ha annullato o chiuso il popup");
        }
    });
}

async function loadAllImages() {
    fetch('/static/SosOnline/SosOnlineLimits.json')
    .then(response => response.json())
    .then(data => {
        maxHintCards = data.maxHintCards;

        for (var i = 1; i < 4; i++) {
            witheringLooksImages[i] = new Image();
            witheringLooksImages[i].src = '/static/SosOnline/images/wl' + i + '.png';
            
            //console.log("Preloaded wl",witheringLooksImages[i].src);
        }

        for (var i = 0; i < maxHintCards+1; i++) {
            preloadedImages[i] = new Image();
            preloadedImages[i].src = '/static/SosOnline/images/' + i + '.png';
            //console.log("Preloaded",preloadedImages[i].src);
        }
        
        //console.log('playerID',playerID);
        //console.log(preloadedImages[5].src);
    })
    .catch(error => console.error('Errore:', error));
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

function ping(){
    console.log('ping', {'partyID':partyID, 'playerID':playerID})
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

function startingFunction(){
    witheringLooksImages[1] = new Image();
    witheringLooksImages[1].src = '/static/SosOnline/images/wl1.png';


    witheringLooksImages[1].addEventListener('load', async function() {
        loadingBar.value++;
        if (loadingBar.value === 1) {
            await new Promise(r => setTimeout(r, 500));
            loadingBar.style.display = 'none';
            canShowHand = true;
        }
    });
    socket.emit('join', {'playerID': playerID, 'partyID': partyID,'mtype': mtype});
    startPing();
    askFullScreen();
    loadGeneralImages();
    //loadAllImages();
    //showHand();
}

startingFunction()