const contextMenu = document.querySelector(".context-menu");
const cardsImages = document.querySelectorAll('.card');
const playOption = document.getElementById('context-play');
const supportsHover = window.matchMedia('(hover: hover)').matches;

let timeoutHideMenu;

function hideMenu() {
    // contextMenu.style.visibility = "hidden";
    contextMenu.classList.add('hidden');
}

function handleMenu(card){
    let current_card = contextMenu.getAttribute('selected-card');
    if(current_card == card)
        clearTimeout(timeoutHideMenu); 
}

cardsImages.forEach(function(cardImage) {
    cardImage.addEventListener('click', function(e) {
        let parts = this.src.split('/');
        let card = parts[parts.length - 1].split('.')[0];

        if(card != '0' && !this.classList.contains("played-card")){
            e.preventDefault();
            e.stopPropagation();
            clearTimeout(timeoutHideMenu);

            let x = e.pageX, y = e.pageY,
            winWidth = window.innerWidth,
            winHeight = window.innerHeight,
            cmWidth = contextMenu.offsetWidth,
            cmHeight = contextMenu.offsetHeight;

            x = x > winWidth - cmWidth ? winWidth - cmWidth - 5 : x;
            y = y > winHeight - cmHeight ? winHeight - cmHeight - 5 : y;
            
            contextMenu.style.left = `${x}px`;
            contextMenu.style.top = `${y}px`;

            // contextMenu.style.visibility = "visible";
            contextMenu.classList.remove('hidden');
            
            contextMenu.setAttribute('selected-card', card);
        }
    });

    cardImage.addEventListener('contextmenu', function (event) {
        // Prevenire l'apparizione del menu contestuale
        event.preventDefault();
    });

    if (supportsHover) {
        cardImage.addEventListener('mouseleave', function () {
            timeoutHideMenu = setTimeout(hideMenu, 200);
        });

        cardImage.addEventListener('mouseenter', function () {
            handleMenu(this.src.split('/').slice(-1)[0].split('.')[0]);
        });
    }
});

document.addEventListener('click', function(e) {
    const clickedCard = e.target.closest('.card');
    const clickedInsideMenu = e.target.closest('.context-menu');

    if (clickedInsideMenu) {
        return;
    }

    if (clickedCard) {
        let parts = clickedCard.src.split('/');
        let card = parts[parts.length - 1].split('.')[0];
        // console.log('click',e.target.className,card)

        if(card == '0'){   
            // contextMenu.style.visibility = 'hidden';
            contextMenu.classList.add('hidden');
        }
        return;
    }

    // contextMenu.style.visibility = 'hidden';
    contextMenu.classList.add('hidden');
});


if (supportsHover) {
    contextMenu.addEventListener('mouseenter', function() {
        // Il mouse è entrato nel menu in tempo! Fermiamo la chiusura.
        clearTimeout(timeoutHideMenu); 
    });

    contextMenu.addEventListener('mouseleave', function() {
        // Il mouse è uscito anche dal menu, quindi ora possiamo nasconderlo.
        timeoutHideMenu = setTimeout(hideMenu, 200);
    });
}


playOption.addEventListener('click', function() {
    let selectedCard = contextMenu.getAttribute('selected-card');
    playCard(selectedCard);
});