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

var urlParams = new URLSearchParams(window.location.search);
var playerID = parseInt(urlParams.get('playerID'));
var partyID = urlParams.get('partyID');
var mtype = urlParams.get('mtype');



var image = document.getElementById('card1');
var contextMenu = document.getElementById('context-menu');
var bigCard = document.getElementById('showedCard');

// Aggiungi un ascoltatore di eventi 'change' al select
contextMenu.addEventListener('click', function(e) {
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
                mtype = -1
                while(mtype < 2){
                    var mtype = parseInt(prompt("A quale giocatore vuoi lanciare l'occhiataccia? "));
                    if(mtype == null) 
                        return;
                }
                playWl(witheringLooks[mtype] + 1,mtype);
                break;
        }
    }
});

image.addEventListener('click', function(event) {
    // Mostra il menu contestuale
    contextMenu.style.display = 'block';

    // Posiziona il menu contestuale nel punto in cui è stato fatto clic
    contextMenu.style.left = event.pageX + 'px';
    contextMenu.style.top = event.pageY + 'px';

    // Ottieni il src dell'immagine
    var imageSrc = this.src;
    var parts = imageSrc.split('/');

    contextMenu.setAttribute('selected-card', parts[parts.length - 1].split('.')[0]);
});

document.addEventListener('click', function(e) {
    if (e.target.className !== 'card') {
        contextMenu.style.display = 'none';
    }
});

socket.on('response-turn', function(data) {
    turn = parseInt(data.turn);

    if (data.response['status'] == 0){
        document.getElementById('playerTurn').innerHTML = 'Giocatore di turno: '+ turn ;
        showHand();
    }

    if(data.playerID == playerID && data.response['status'] != 0){
        alert(data.response['message'])
    }
});

socket.on('response-points', function(data) {
    witheringLooks = data.points;
    socket.emit('get-turn', {'partyID':partyID, 'playerID':playerID});
});

socket.on('player-joined', function(data) {
    if(data.playerID == playerID){
        socket.emit('get-all-points', {'partyID':partyID});
    }
});

document.getElementById('turnButton').addEventListener('click', function() {
    var newTurn = -1
    while(newTurn < 2){
        newTurn = parseInt(prompt("A quale giocatore vuoi passare il turno? "));
        
        console.log("got turn "+newTurn)
        if(newTurn == null) 
            return;
    }
    console.log("changing turn in "+newTurn)
    socket.emit('sosonline-change-turn', {'partyID':partyID,'playerID':playerID, 'mtype':mtype, 'newTurn':newTurn} );
});

document.getElementById('letDrawButton').addEventListener('click', function() {
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
    let wlLevel = witheringLooks[turn] + 1;
    if(wlLevel >= 4) 
        wlLevel = 3;
    image.src = witheringLooksImages[wlLevel].src;
    console.log('showHand',wlLevel);
}

/*
window.onload = function() {
    startingFunction()
}
*/

function startingFunction(){
    
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
        
        socket.emit('join', {'playerID': playerID, 'partyID': partyID,'mtype': mtype});
    })
    .catch(error => console.error('Errore:', error));

    
    //showHand();
}

startingFunction()