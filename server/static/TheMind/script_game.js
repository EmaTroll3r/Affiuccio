


function playCardAnimation(cardElement) {
    const cardRect = cardElement.getBoundingClientRect();
    const pileRect = tableArea.getBoundingClientRect();

    const deltaX = (pileRect.left + pileRect.width / 2) - (cardRect.left + cardRect.width / 2);
    const deltaY = (pileRect.top + pileRect.height / 2) - (cardRect.top + cardRect.height / 2);

    // 1. Passiamo le coordinate esatte al CSS
    cardElement.style.setProperty('--target-x', `${deltaX}px`);
    cardElement.style.setProperty('--target-y', `${deltaY}px`);

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

function playCard(card,options=null){
    console.log('playCard',card);
    socket.emit('play-card', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype, 'cards':[parseInt(card)], 'handtype':['hand'],'options':options});
}


