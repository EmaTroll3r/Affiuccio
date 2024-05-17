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
    mtype = await choosePlayer([1]);
    if (mtype == null) 
        return;
    console.log('wl',mtype);
    playWl(witheringLooks[mtype] + 1,mtype);
});

async function choosePlayer(foreignPlayers) {
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


socket.on('response-turn', function(data) {
    turn = parseInt(data.turn);

    if (data.response['status'] == 0){
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

socket.on('player-joined', function(data) {
    if(data.playerID == playerID){
        //socket.emit('get-all-points', {'partyID':partyID});
        socket.emit('get-playerList', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype});
        socket.emit('get-turn', {'partyID':partyID, 'playerID':playerID});
    }
});

function getPlayer(mtype){
    for (let player of playerList) {
        if (player.mtype == mtype) {
            return player;
        }
    }
    return null;
}

document.getElementById('turnButton').addEventListener('click', async function() {
    /*
    var newTurn = -1
    while(newTurn < 2){
        newTurn = parseInt(prompt("A quale giocatore vuoi passare il turno? "));
        
        console.log("got turn "+newTurn)
        if(newTurn == null) 
            return;
    }
    */
    newTurn = await choosePlayer([1]);
    if (newTurn == null) 
        return;
    console.log("changing turn in "+newTurn)
    socket.emit('sosonline-change-turn', {'partyID':partyID,'playerID':playerID, 'mtype':mtype, 'newTurn':newTurn} );
});

document.getElementById('letDrawButton').addEventListener('click', async function() {
    
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

    var targetPlayer = await choosePlayer([1]);
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
            alert("Carta pescata con successo");
        }else{
            alert(data.response['message'])
        }
        //console.log(data.response)
    }
    
});

socket.on('card-played', function(data) {
    card = parseInt(data.cards[0]);
    //console.log('card-played', data);

    if(data.response['status'] == 0){
        if(data.handtype[0] == "wl"){
            witheringLooks[data.others.victim] = card;
            console.log('wlLevel ',card, ' to player ', data.others.victim);
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

function playWl(wl,mtype){
    //console.log('play-card', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype, 'cards': [wl], 'handtype':['wl'],others:{'victim':mtype}});
    socket.emit('play-card', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype, 'cards': [wl], 'handtype':['wl'],others:{'victim':mtype}, 'askHand':0} );
}



function handleBigCardClick() {
    bigCard.style.display = 'none'; // Nascondi bigCard
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
    bigCard.style.display = 'block'; // Mostra bigCard
    //console.log('showPlayedCard',img);


    bigCard.addEventListener('click', handleBigCardClick);
}

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


function alert(text) {
    Swal.fire({
        title: '<span style="color: #fff;">Attenzione!</span>',
        html: '<span style="color: #fff;">' + text + '</span>',
        icon: 'warning',
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


function startingFunction(){
    askFullScreen();
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
        socket.emit('join', {'playerID': playerID, 'partyID': partyID,'mtype': mtype});
    })
    .catch(error => console.error('Errore:', error));

    
    //showHand();
}

startingFunction()