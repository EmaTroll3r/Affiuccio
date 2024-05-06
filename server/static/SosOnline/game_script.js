var socket = io.connect('http://localhost');


var maxHintHand = 3;
var maxActionHand = 3;
var maxHintCards = 2;
var maxBlockCards = 12;

//--------------------------------------------------------------------------------------------

var hand = {'hint':[], 'action':[]};
var preloadedImages = [];
var witheringLooksImages = []
var turn = 0;
var bigCardActive = false;

var urlParams = new URLSearchParams(window.location.search);
var playerID = parseInt(urlParams.get('playerID'));
var partyID = urlParams.get('partyID');
var mtype = urlParams.get('mtype');



var images = document.getElementsByClassName('card');
var bigCard = document.getElementById('showedCard');
var contextMenu = document.getElementById('context-menu');

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
                        var newTurn = 0;
                        while(newTurn < 1 || newTurn == turn){
                            newTurn = parseInt(prompt("Quale giocatore vuoi incolpare? "));
                            console.log('newTurn',newTurn);
                            if(newTurn == null) 
                               return;
                        }
                        playCard(contextMenu.getAttribute('selected-card'),hand['action'][i],others = {'newTurn':newTurn});

                        //console.log('Blocco',hand['action'][i]);
                        return;
                    }
                }
                alert("You don't have Blame Cards")
                break;
        }
    }
});

for (var i = 0; i < images.length; i++) {
    images[i].addEventListener('click', function(event) {
        if(this.src != preloadedImages[0].src){
            console.log(this.src)
            // Mostra il menu contestuale
            var options = contextMenu.getElementsByTagName('option');
            options[1].textContent = 'Blocca x'+hand['action'].filter(x => x < maxBlockCards).length;
            options[2].textContent = 'Scaricabarile x'+hand['action'].filter(x => x >= maxBlockCards).length;
            
            contextMenu.style.display = 'block';

            // Posiziona il menu contestuale nel punto in cui è stato fatto clic
            contextMenu.style.left = event.pageX + 'px';
            contextMenu.style.top = event.pageY + 'px';

            // Ottieni il src dell'immagine
            var imageSrc = this.src;
            var parts = imageSrc.split('/');

            contextMenu.setAttribute('selected-card', parts[parts.length - 1].split('.')[0]);
        }else{
            contextMenu.style.display = 'none';
        }
    });
}

document.addEventListener('click', function(e) {
    if (e.target.className !== 'card') {
        contextMenu.style.display = 'none';
    }
});

socket.on('response-hand', function(data) {
    //console.log('response-hand', data);
    if(data.playerID == playerID){
        //console.log('in')
        hand[data.handtype] = JSON.parse(data.hand).map(function(item) {
            return parseInt(item);
        });
        showHand();
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

socket.on('player-joined', function(data) {
    //console.log('join', data);
    if(data.playerID == playerID){
        socket.emit('get-hand', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype, 'handtype':'hint'});
        socket.emit('get-hand', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype, 'handtype':'action'});
        socket.emit('get-turn', {'partyID':partyID, 'playerID':playerID});

    }
    //document.getElementById('playerTurn').innerHTML = 'Giocatore di turno: ' + data.playerID;
});

socket.on('card-played', function(data) {
    card = parseInt(data.cards[0]);
    if(data.response['status'] == 0){
        if(data.handtype[0] == "wl"){
            //console.log('wl ',card);
            showPlayedCard(card,data.handtype[0]);
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
});


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


function showHand(){
    if(bigCardActive == false){
        console.log('showHand',hand);
        //var ncard = 1;
        for(let i=0;i<maxHintHand;i++){
            /*
            var imageElement = document.getElementById('card'+ncard);
            */
            pos = hand['hint'][i] || 0;
            img = preloadedImages[pos].src;
            //imageElement.src = img;
            images[i].src = img;
            //ncard++;
        }
    }
}

function handleBigCardClick() {
    bigCard.style.display = 'none'; // Nascondi bigCard
    bigCardActive = false;
    showHand();
    bigCard.removeEventListener('click', handleBigCardClick); // Rimuovi il listener di eventi
}

function showPlayedCard(card,handtype){
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
    bigCard.style.display = 'block'; // Mostra bigCard
    //console.log('showPlayedCard',img);


    bigCard.addEventListener('click', handleBigCardClick);
}

window.onload = function() {

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

    

    
    socket.emit('join', {'playerID': playerID, 'partyID': partyID,'mtype': mtype});
    //showHand();
}