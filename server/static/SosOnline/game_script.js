/*
var ip_address = "localhost"

fetch('/static/server_stats.json')
    .then(response => response.json())
    .then(data => ip_address = data['ip'])
    .catch(error => console.error('Errore:', error));

var socket = io.connect('http://'+ip_address);
*/

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
var playerList = [];
var witheringLooks = [];
//var firstAskHand = false;
var canShowHand = false;

var urlParams = new URLSearchParams(window.location.search);
var playerID = parseInt(urlParams.get('playerID'));
var partyID = urlParams.get('partyID');
var mtype = urlParams.get('mtype');



//var images = document.getElementsByClassName('card');
var images = document.querySelectorAll('.card');
var bigCard = document.getElementById('showedCard');
var playContext = document.getElementById('context-play');
var blockContext = document.getElementById('context-block');
var blameContext = document.getElementById('context-blame');
var menu = document.querySelector('.menu');
const contextMenu = document.querySelector(".wrapper");

//var contextMenu = document.getElementById('context-menu');
//var contextPlayers = document.getElementById("context-choosePlayer");

/*
// Aggiungi un ascoltatore di eventi 'change' al select
contextMenu.addEventListener('click', async function(e) {
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
                        //newTurn = await choosePlayer(contextMenu.offsetLeft+contextMenu.offsetWidth+ 2,contextMenu.offsetTop,[1,mtype]);
                        newTurn = await choosePlayer([1,parseInt(mtype)]);
                        if (newTurn == null) 
                            return;
                        playCard(contextMenu.getAttribute('selected-card'),hand['action'][i],others = {'newTurn':newTurn});

                        return;
                    }
                }
                alert("You don't have Blame Cards")
                break;
        }
    }
});
*/

playContext.addEventListener('click', function() {
    playCard(menu.getAttribute('selected-card'));
});

blockContext.addEventListener('click', function() {
    for(let i=0;i<maxActionHand;i++){
        if(hand['action'][i] < maxBlockCards){
            playCard(menu.getAttribute('selected-card'),hand['action'][i]);
            console.log('Blocco',hand['action'][i]);
            return;
        }
    }
    alert("You don't have Block Cards")
});

blameContext.addEventListener('click', async function() {
   
    for(let i=0;i<maxActionHand;i++){
        //console.log('Blame',hand['action'][i])
        if(hand['action'][i] >= maxBlockCards){
            newTurn = await choosePlayer([1,parseInt(mtype)]);
            if (newTurn == null) 
                return;
            playCard(menu.getAttribute('selected-card'),hand['action'][i],others = {'newTurn':newTurn});

            return;
        }
    }
    alert("You don't have Blame Cards")
});

window.addEventListener('beforeunload', function(event) {
    socket.emit("leave", {'partyID': partyID, 'playerID':playerID});
    socket.close();
    console.log('Socket closed');
});

/*
window.addEventListener("click", e => {
    e.preventDefault();
    let x = e.offsetX, y = e.offsetY,
    winWidth = window.innerWidth,
    winHeight = window.innerHeight,
    cmWidth = contextMenu.offsetWidth,
    cmHeight = contextMenu.offsetHeight;
    x = x > winWidth - cmWidth ? winWidth - cmWidth - 5 : x;
    y = y > winHeight - cmHeight ? winHeight - cmHeight - 5 : y;
    
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
    contextMenu.style.visibility = "visible";
});
*/


images.forEach(function(image) {
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

            
            blockContext.textContent = 'Blocca x'+hand['action'].filter(x => x < maxBlockCards).length;
            blameContext.textContent = 'Scaricabarile x'+hand['action'].filter(x => x >= maxBlockCards).length;

            contextMenu.style.visibility = "visible";
            /*
            var imageSrc = this.src;
            console.log('imageSrc',imageSrc);
            var parts = imageSrc.split('/');
            */

            //menu.setAttribute('selected-card', parts[parts.length - 1].split('.')[0]);
            
            menu.setAttribute('selected-card', card);
        }
    });
});

//document.addEventListener("click", () => contextMenu.style.visibility = "hidden");

document.addEventListener('click', function(e) {
    if(e.target.className === 'card'){
        var parts = e.target.src.split('/');
        var card = parts[parts.length - 1].split('.')[0];
        console.log('click',e.target.className,card)
        if(card == '0'){   
            contextMenu.style.visibility = 'hidden';
        }
    }else if (e.target.className !== 'card') {
        contextMenu.style.visibility = 'hidden';
    }
});


socket.on('response-inGameCards', function(data) {
    console.log('response-inGameCards',data.hand);
    
    /*
    var hintHand = JSON.parse(data.hand).map(function(item) {
        return parseInt(item);
    });
    */ 
    //console.log('response-inGameCards',data.targetPlayer,playerID);
    if(data.targetPlayer == playerID || data.targetPlayer == undefined){
        //console.log('in')
        data.hand.forEach((card, i) => {
            //console.log('preloadedImages[card]',preloadedImages[card]);
            if(preloadedImages[card] == undefined){
                preloadedImages[card] = new Image();
                preloadedImages[card].src = '/static/SosOnline/images/' + card + '.png';
                console.log("preloaded "+preloadedImages[card].src)
            }
        });
        canShowHand = true;
    }
    //socket.emit('get-hand', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype, 'handtype':'hint'});
    //socket.emit('get-hand', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype, 'handtype':'action'});
});

socket.on('response-hand', async function(data) {
    ///*
    while(canShowHand == false){
        //console.log('ShowHand -------- response-hand waiting');
        await new Promise(r => setTimeout(r, 100));
    }

    //console.log('response-hand',data);
    if(data.handtype == 'hint'){
        /*
        var hintHand = JSON.parse(data.hand).map(function(item) {
            return parseInt(item);
        });
        */
        data.hand.forEach((card, i) => {
            //console.log('preloadedImages[card]',preloadedImages[card]);
            if(preloadedImages[card] == undefined){
                preloadedImages[card] = new Image();
                preloadedImages[card].src = '/static/SosOnline/images/' + card + '.png';
                console.error("preloaded "+preloadedImages[card].src)
            }
        });
    }
    //*/

    if(data.playerID == playerID){
        
        //console.log('in')
        /*
        hand[data.handtype] = JSON.parse(data.hand).map(function(item) {
            return parseInt(item);
        });
        console.log('response-hand',hand);
        */
        /*
        hand[data.handtype] = JSON.parse(data.hand).map(function(item) {
            return parseInt(item);
        });
        //*/
        hand[data.handtype] = data.hand;
        //console.log('response-hand',hand[data.handtype]);
        /*
        if(firstAskHand == false){
            hand[data.handtype].forEach((card, i) => {
                preloadedImages[card] = new Image();
                preloadedImages[card].src = '/static/SosOnline/images/' + card + '.png';
                //console.log("Preloaded",preloadedImages[card].src);
            });
            
            //preloadedImages[0] = new Image();
            //preloadedImages[0].src = '/static/SosOnline/images/0.png';
        }
        //*/

        //console.log('show')
        //console.log('ShowHand -------- response-hand');
        showHand();
        /*
        if(firstAskHand == false){
            firstAskHand = true;
            //loadAllImages();
        }
        //*/
    }
});


socket.on('response-turn', function(data) {
    turn = parseInt(data.turn);

    if (data.response['status'] == 0){
        document.getElementById('playerTurn').innerHTML = 'Giocatore di turno: '+ getPlayer(turn).name;
        //console.log('ShowHand -------- response-turn');
        showHand();
    }
    
    if(data.playerID == playerID && data.response['status'] != 0){
        alert(data.response['message'])
    }
});


socket.on('player-joined', function(data) {
    //console.log('join', data);
    if(data.playerID == playerID){
        socket.emit('sosonline-get-inGameCards', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype});
        socket.emit('get-hand', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype, 'handtype':'hint'});
        socket.emit('get-hand', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype, 'handtype':'action'});
        socket.emit('get-playerList', {'partyID':partyID, 'playerID':playerID, 'mtype':mtype});
    }
    //document.getElementById('playerTurn').innerHTML = 'Giocatore di turno: ' + data.playerID;
});

socket.on('response-playerList', function(data) {
    playerList = data.playerList;
    witheringLooks = new Array(playerList.length).fill(null);
    socket.emit('get-turn', {'partyID':partyID, 'playerID':playerID});
    /*
    // Rimuovi tutte le opzioni esistenti
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
        //console.log('response-playerList added',player);

        // Aggiungi l'opzione al <contextPlayers>
        contextPlayers.appendChild(option);
    });

    contextPlayers.setAttribute("size", playerList.length);
    //console.log('response-playerList',playerList);
    //console.log('response-playerList',contextPlayers);
    */
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

function alert(text,status = 1) {
    var title = '<span style="color: #fff;">Attenzione!</span>';
    var icon = 'warning'
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

function getPlayer(mtype){
    for (let player of playerList) {
        if (player.mtype == mtype) {
            return player;
        }
    }
    return null;
}

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

/*
function handlePlayerChoice(x, y,foreignPlayers){
    return new Promise((resolve, reject) => {

        for (var i = 0; i < foreignPlayers.length;i++) {
            contextPlayers.options[foreignPlayers[i]-1].style.display = 'none';
        }
        contextPlayers.style.left = x + 'px';
        contextPlayers.style.top = y + 'px';
        

        //contextPlayers.setAttribute("size", playerList.length - foreignPlayers.length);
        contextPlayers.style.display = 'block';
        //console.log('handlePlayerChoice',contextPlayers.style.display,contextPlayers.style.left,contextPlayers.style.top)
        
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
            //contextPlayers.setAttribute("size", playerList.length);

            // Risolvi la promessa con mtype
            resolve(mtype);
        });

        
    });
}

async function choosePlayer(x, y, foreignPlayers) {
    console.log('choosePlayer',x,y,foreignPlayers);
    let mtype = await handlePlayerChoice(x, y,foreignPlayers);
    // Fai qualcosa con mtype
    //console.log(mtype);
    return parseInt(mtype);
}
*/

async function choosePlayer(foreignPlayers) {
    console.log('choosePlayer',foreignPlayers);
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

function showHand(){
    if(bigCardActive == false){
        //console.log('showHand',hand);
        //var ncard = 1;
        for(let i=0;i<maxHintHand;i++){
            /*
            var imageElement = document.getElementById('card'+ncard);
            */
            pos = hand['hint'][i] || 0;
            img = preloadedImages[pos].src;
            //imageElement.src = img;
            images[i].src = img;
            images[i].setAttribute('used', 'false');
            //ncard++;
        }
    }
}

function handleBigCardClick() {
    bigCard.style.display = 'none'; // Nascondi bigCard
    bigCardActive = false;
    //console.log('ShowHand -------- handleBigCardClick');
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
    contextMenu.style.visibility = 'hidden';
    bigCard.style.display = 'block'; // Mostra bigCard
    //console.log('showPlayedCard',img);


    bigCard.addEventListener('click', handleBigCardClick);
}

/*
window.onload = function() {
    startingFunction()
}
*/


function loadAllImages(){
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
            //console.log("L'utente ha confermato FullScreen");
        } else if (result.isDismissed) {
            //console.log("L'utente ha annullato o chiuso il popup");
        }
    });
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

function startingFunction() {
    
    //loadAllImages();
    
    socket.emit('join', {'playerID': playerID, 'partyID': partyID,'mtype': mtype});
    askFullScreen();
    loadGeneralImages();
}

startingFunction()