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
}

function end(data){}


// ------------------ Important specific functions ------------------
// This are important functions specific for this game, cant be empty


function onCardPlayed(data){
    console.log('card-played',data);
    card = parseInt(data.cards[0]);    
    if (data.playerID == playerID){
        playCardAnimation(card);
    }
    else{
        console.log('played '+card+' by player '+data.playerID);
        playedCardAnimation(card)
    }
}


function showHand(){
    for(let i=0;i<maxCardsInHand;i++){
        card = hand['hand'][i] || 0;
        img = preloadedImages[card].src;

        cardsImages[i].src = img;
        cardsImages[i].classList.remove('hidden');
        cardsImages[i].setAttribute('used', 'false');
    }

}

function playCard(card,options=null){
    console.log('playCard',card);
    socket.emit('play-card', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype, 'cards':[parseInt(card)], 'handtype':['hand'],'options':options});
    
}




// ------------------ Custom Functions ------------------

const otherPlayershandArea = document.getElementById('otherPlayershand-area');
const tableArea = document.querySelector('#table-area');


function playCardAnimation(card) {
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
        tableArea.appendChild(cardElement);
    };

    cardElement.addEventListener('transitionend', onAnimationEnd);
}


function playedCardAnimation(card) {
    const img = document.createElement('img');

    img.src = preloadedImages[card].src;
    img.classList.add('card', 'played-card');

    otherPlayershandArea.appendChild(img);
    
    playCardAnimation(card);

    // tableArea.appendChild(img);
}

socket.on('next-level', async function(data) {
    console.log('next-level',data);
    await alert('Congratulations! You have reached level ' + data.level, 0, 'Level Up!');

    document.querySelectorAll('#table-area .card').forEach(card => card.remove());
    
    requestHand(partyID, playerID, mtype, 'hand');
});

socket.on('notify-left-lives', function(data) {
    console.log('notify-left-lives', data);
    alert(data.message, 1, 'Watch out!');

    // document.getElementById('lives').setAttribute('data-lives', data.lives.toString());
});
