handtypes = ['hand']
required_full_screen = 'True'
showingHands = ['hand']             //handtypes che possono essere mostrate (ad es. in SosOnline mostriamo le carte hint, ma non le carte action)


// ------------------ All of this are functions specfic for this game, so maybe be empty ------------------
// They include specific additional functions beyond the basic ones that are already implemented 

function loadSpecificGeneralImages(){}

function onResponsePlayerList(){}

function onResponseTurn(){}

function onChangeTurn(){}

function additionalInitialRequests(){    
    // socket.emit('get-noise', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype});
}

// --------------------------------------------------------------------------------------------------------

function showHand(){
    for(let i=0;i<maxCardsInHand;i++){
        card = hand['hand'][i] || 0;
        img = preloadedImages[card].src;

        cardsImages[i].src = img;
        cardsImages[i].style.display = 'visible';
        cardsImages[i].setAttribute('used', 'false');
    }

}
