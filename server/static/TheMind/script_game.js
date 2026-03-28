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
    socket.emit('themind-get-otherInitialInformations', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype});
    // console.log('additionalInitialRequests: get game pile');
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
        updatePlayerHandTracker(data.mtype, document.querySelector(`.info-container#player-${data.mtype} .info-numberOfCardsInHand`).getAttribute('data-numberOfCardsInHand') - 1);
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
    socket.emit('play-card', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype, 'cards':[parseInt(card)], 'handtype':['hand'],'options':options, 'askHand':0});
    
}




// ------------------ Custom Functions ------------------

const otherPlayershandArea = document.getElementById('otherPlayershand-area');
const tableArea = document.querySelector('#table-area');
const handArea = document.querySelector('#hand-area');
const levelElement = document.getElementById('level-text');
const livesElement = document.getElementById('lives-text');
const shurikensElement = document.getElementById('shurikens-text');
const infoRightPanel = document.getElementById('info-rightPanel');
const shurikenButton = document.getElementById('shurikens-icon');
const livesOptionsElement = document.getElementById('lives-options-text');
const shurikensOptionsElement = document.getElementById('shurikens-options-text');
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
    await alert('Congratulations! You have reached level ' + data.level, 0, 'Level Up!');
    levelElement.setAttribute('data-text', data.level.toString());

    if (data.livesOptions)
        livesOptionsElement.setAttribute('data-text', data.livesOptions ? '(+' + data.livesOptions.toString() + ')' : '');
    if (data.shurikensOptions)
        shurikensOptionsElement.setAttribute('data-text', data.shurikensOptions ? '(+' + data.shurikensOptions.toString() + ')' : '');

    updateAllPlayerHandTrackers(data.handsTracker);

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
            hideCardElemFromHand(card);
        }
    }

    updateAllPlayerHandTrackers(data.handsTracker);

    livesElement.setAttribute('data-text', data.lives.toString());

    if (mtype == 1)
        console.log('Requesting game pile after losing a life');
        socket.emit('themind-received-left-lives', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype});

    // document.getElementById('lives').setAttribute('data-lives', data.lives.toString());
});

socket.on('response-gamePile', function(data) {
    if (data.targetPlayer == playerID){
        console.log('response-gamePile', data);
        gamePile = data.gamePile;
        showGamePile();
    }
});

socket.on('response-otherInitialInformations', function(data) {
    if (data.targetPlayer == playerID){
        
        levelElement.setAttribute('data-text', data.level.toString());

        if (data.livesOptions)
            livesOptionsElement.setAttribute('data-text', '(+' + data.livesOptions.toString() + ')');
        if (data.shurikensOptions)
            shurikensOptionsElement.setAttribute('data-text', '(+' + data.shurikensOptions.toString() + ')' );

        livesElement.setAttribute('data-text', data.lives.toString());
        shurikensElement.setAttribute('data-text', data.shurikens.toString());

        console.log('response-otherInitialInformations', data.handsTracker, data.handsTracker.length);
        for (let i = 0; i < data.handsTracker.length; i++) {
            const playerInfo = data.handsTracker[i];

            if (playerInfo.mtype == parseInt(mtype))
                continue;

            console.log('Creating info container for player:', playerInfo);
            const container = document.createElement('div');
            container.id = `player-${playerInfo.mtype}`;
            container.classList.add('info-container');

            const icon = document.createElement('img');
            icon.classList.add('info-icon');
            icon.src = '/static/TheMind/images/player_icon.png'; 

            const nameDiv = document.createElement('div');
            nameDiv.classList.add('info-text', 'info-playerName');
            nameDiv.textContent = playerInfo.name;

            const countDiv = document.createElement('div');
            countDiv.classList.add('info-text', 'info-numberOfCardsInHand');
            countDiv.setAttribute('data-numberOfCardsInHand', playerInfo.numberOfCardsInHand.toString());

            container.appendChild(icon);
            container.appendChild(nameDiv);
            container.appendChild(countDiv);

            infoRightPanel.appendChild(container);
        }
    }
});

socket.on('used-shuriken', function(data) {
    for(let i=0;i<data.removedCards.length;i++){
        card = data.removedCards[i];
        if (hand['hand'].includes(card)){
            hideCardElemFromHand(card);
            continue;
        }
    }
    updateAllPlayerHandTrackers(data.handsTracker);
    shurikensElement.setAttribute('data-text', data.shurikens.toString());
});

socket.on('vote-for-shuriken', async function(data) {
    if (data.playerID != playerID){
        let res = await alert('Player '+ playerList[data.mtype - 1].name +' has proposed to use a shuriken. Do you agree?', 1, 'Shuriken Proposal', YesNo=true)
        if (res.isConfirmed){
            vote = 1;
        }else{
            vote = 0;
        }
        console.log('Voting for shuriken', vote);
        socket.emit('themind-shuriken-vote', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype, 'vote': vote});
    }
});

socket.on('shuriken-votation-result', async function(data) {
    if (data.result == 1){
        alert('All players agreed to use a shuriken.<br>Using shuriken...', 0, 'Shuriken Proposal Accepted');
    } else {
        let message = 'The shuriken proposal has been rejected!<br><br>'
        for (let i = 0; i < data.disagreeVotes.length; i++) {
            const player_mtype = data.disagreeVotes[i];
            message += 'Player ' + playerList[player_mtype - 1].name + ' voted No<br>';
        }
        alert(message, 1, 'Shuriken Proposal Rejected');
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


function updatePlayerHandTracker(mtype, numberOfCardsInHand){
    let nCardsInHandElem = document.querySelector(`.info-container#player-${mtype} .info-numberOfCardsInHand`);
    nCardsInHandElem.setAttribute('data-numberOfCardsInHand', numberOfCardsInHand.toString());
}


function fromCardToElem(cardValue) {
    const selector = `.card[src$="/${cardValue}.png"]`;
    
    const cardElement = document.querySelector(selector);
    
    return cardElement;
}

function updateAllPlayerHandTrackers(handsTracker){
    console.log('updateAllPlayerHandTrackers');
    handsTracker.forEach(playerInfo => {
        console.log('Updating hand tracker for player:', playerInfo.mtype, parseInt(mtype));    
        if (playerInfo.mtype != parseInt(mtype)){
            updatePlayerHandTracker(playerInfo.mtype, playerInfo.numberOfCardsInHand);
        }
    });
}

function removeCardFromHand(card){
    const index = hand['hand'].indexOf(card); // Remove card from hand
    if (index > -1) {
        return hand['hand'].splice(index, 1);
    }
    return 0;
}

function hideCardElemFromHand(card){
    const cardElement = fromCardToElem(card);
    cardElement.classList.add('hidden');
    removeCardFromHand(card);
}


shurikenButton.addEventListener('click', async function() {

    let res = await alert('Do you want to use a shuriken?', 1, 'Use Shuriken?',YesNo=true)

    if (res.isConfirmed) {
        // socket.emit('themind-use-shuriken', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype});
        socket.emit('themind-propose-votation-for-shuriken', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype});
    }
});