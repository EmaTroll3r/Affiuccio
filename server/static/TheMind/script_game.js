let handtypes = ['hand']
let required_full_screen = 'True'
let showingHands = ['hand']             //handtypes che possono essere mostrate (ad es. in SosOnline mostriamo le carte hint, ma non le carte action)

// ------------------ All of this are functions specfic for this game, so maybe be empty ------------------
// They include specific additional functions beyond the basic ones that are already implemented 

function loadSpecificGeneralImages(){}

function onResponsePlayerList(){}

function onResponseTurn(){}

function onChangeTurn(){}

function additionalInitialRequests(){    
    // socket.emit('get-noise', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype});
    socket.emit('themind-get-gamePile', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype});
    console.log('additionalInitialRequests: get game pile');
}

function end(data){}


// ------------------ Important specific functions ------------------
// This are important functions specific for this game, cant be empty


function onCardPlayed(data){
    // console.log('card-played',data);
    card = parseInt(data.cards[0]);    
    if (data.playerID == playerID){
        playCardAnimation(card);
    }
    else{
        // console.log('played '+card+' by player '+data.playerID);
        playedCardAnimation(card)
    }
}


function showHand(){
    if (!hand['hand']){
        return;
    }


    for(let i=0;i<hand['hand'].length;i++){
        card = hand['hand'][i] || 0;
        if (card == 0){         //if the card is 0, it means that the card was not found, so we skip it
            continue;
        }
        img = preloadedImages[card].src;

        console.log('showHand', card, "n:", i);
        cardsImages[i].src = img;
        cardsImages[i].classList.remove('hidden');
        // cardsImages[i].setAttribute('used', 'false');
    }

}

function playCard(card,options=null){
    
    for(let i=0;i<hand['hand'].length;i++){
        console.log('Checking card', hand['hand'][i], 'against', card);
        if (hand['hand'][i] < card){
            alert('There are lower cards in your hand. You cannot play this card yet!');
            return;
        }
    }

    console.log('playCard',card);
    socket.emit('play-card', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype, 'cards':[parseInt(card)], 'handtype':['hand'],'options':options});
    
}




// ------------------ Custom Functions ------------------

const otherPlayershandArea = document.getElementById('otherPlayershand-area');
const tableArea = document.querySelector('#table-area');
const handArea = document.querySelector('#hand-area');
let gamePile = [];


function playCardAnimation(card, playedFromClient=true, animation=true) {
    // console.log('playCardAnimation', card);
    const cardElement = fromCardToElem(card);
    const cardRect = cardElement.getBoundingClientRect();
    const pileRect = tableArea.getBoundingClientRect();

    const deltaX = (pileRect.left + pileRect.width / 2) - (cardRect.left + cardRect.width / 2);
    const deltaY = (pileRect.top + pileRect.height / 2) - (cardRect.top + cardRect.height / 2);

    // 1. Passiamo le coordinate esatte al CSS
    cardElement.style.setProperty('--target-x', `${deltaX}px`);
    cardElement.style.setProperty('--target-y', `${deltaY}px`);    

    // cardElement.style.zIndex = document.querySelectorAll('#table-area .card').length + 2; // Assicuriamoci che la carta sia sopra le altre nel tavolo
    //                                                                                       //mettiamo +2 perché l'immagine game-pile ha z-index 1
    // console.log('zIndex', cardElement.style.zIndex);

    // 2. Aggiungiamo la classe che fa scattare l'animazione CSS
    cardElement.classList.add('is-playing');

    // 3. Spostiamo nel DOM solo quando il CSS ci avvisa di aver finito
    const onAnimationEnd = (e) => {
        if (e.propertyName !== 'transform') return;
        cardElement.removeEventListener('transitionend', onAnimationEnd);

        // Pulizia: togliamo le variabili temporanee e la classe di volo
        cardElement.style.removeProperty('--target-x');
        cardElement.style.removeProperty('--target-y');
        cardElement.classList.remove('is-playing');
        
        // Aggiungiamo la classe finale e spostiamo nell'HTML
        cardElement.classList.add('played-card');
        if (playedFromClient){
            cardElement.classList.add('played-from-me');
            removeCardFromHand(card);
        }
        tableArea.appendChild(cardElement);
    };

    cardElement.addEventListener('transitionend', onAnimationEnd);

    
}


function playedCardAnimation(card) {
    const img = document.createElement('img');

    img.src = preloadedImages[card].src;
    img.classList.add('card', 'played-card');

    otherPlayershandArea.appendChild(img);
    
    playCardAnimation(card,playedFromClient=false);

    // tableArea.appendChild(img);
}

socket.on('next-level', async function(data) {
    console.log('next-level',data);
    await alert('Congratulations! You have reached level ' + data.level, 0, 'Level Up!');
    console.log('Alert closed, proceeding to next level...');

    clearGamePile();

    requestHand(partyID, playerID, mtype, 'hand');
    get_InGameCards();
});

function clearGamePile(){
    document.querySelectorAll('#table-area .card.played-from-me').forEach(function(card) {
        console.log('Resetting card:', card);
        card.classList.add('hidden');
        card.classList.remove('played-card');
        card.classList.remove('played-from-me');
        handArea.appendChild(card);
        // card.remove();
    });

    document.querySelectorAll('#table-area .card:not(.played-from-me)').forEach(function(card) {
        card.remove();
    });
}

socket.on('notify-left-lives', async function(data) {
    console.log('notify-left-lives', data);
    await alert(data.message, 1, 'Watch out!');

    for(let i=0;i<hand['hand'].length;i++){
        card = hand['hand'][i] || 0;
        if (card == 0){         //if the card is 0, it means that the card was not found, so we skip it
            continue;
        }
        if (card < data.playedCard){
            const cardElement = fromCardToElem(card);
            cardElement.classList.add('hidden');
        }
    }

    if (mtype == 1)
        console.log('Requesting game pile after losing a life');
        socket.emit('themind-received-left-lives', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype});

    // document.getElementById('lives').setAttribute('data-lives', data.lives.toString());
});

socket.on('response-gamePile', function(data) {
    if (data.targetPlayerID == playerID){
        console.log('response-gamePile', data);
        gamePile = data.gamePile;
        showGamePile();
    }
});


function showGamePile(){
    clearGamePile();

    for(let i=0;i<gamePile.length;i++){
        card = gamePile[i] || 0;
        if (card == 0){         //if the card is 0, it means that the card was not found, so we skip it
            continue;
        }
        const img = document.createElement('img');

        img.src = preloadedImages[card].src;
        img.classList.add('card', 'played-card');

        tableArea.appendChild(img);
    }
}


function removeCardFromHand(card){
    const index = hand['hand'].indexOf(card); // Remove card from hand
    if (index > -1) {
        return hand['hand'].splice(index, 1);
    }
    return 0;
}