

let gameEndpoint = document.getElementById('gameEndpoint').value;
let nickname = document.getElementById('nickname');

document.getElementById('host-lobby').addEventListener('click', function(event) {
    var playername = nickname.value;
    if (playername == '') {
        alert('Inserisci un nome valido');
        return;
    }
    
    localStorage.setItem(gameEndpoint+'_playername', playername);

    fetch('/'+gameEndpoint+'/host', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ player: playername })  // Aggiungi il corpo della richiesta
    })
    .then(response => response.json())
    .then(data => {// Connetti al server Socket.IO
        
        var socket_data = {
            playerID: data.playerID,
            partyID: data.partyID,
            mtype: data.mtype
        };

        window.location.href = `/`+gameEndpoint+`/lobby?partyID=${data.partyID}&mtype=${data.mtype}&playerID=${data.playerID}`
        console.log('Socket connected to partyID: ' + data.partyID);
    })
    .catch((error) => {
        console.error('Error:', error);
    });

    
});

document.getElementById('join-lobby').addEventListener('click', async function() {
    var playername = nickname.value;
    if (playername == '') {
        alert('Inserisci un nome valido');
        return;
    }
    
    localStorage.setItem(gameEndpoint+'_playername', playername);

    const swalWithInput = Swal.mixin({
        input: 'tel',
        inputPlaceholder: '1234',
        background: '#333',
        color: 'white',
        width: '400px',
        customClass: {
            content: 'swal-content-custom',
            input: 'swal-input-custom'
        },
        inputAttributes: {
            pattern: "[0-9]*",
            inputmode: "numeric",
            style: "color: white"
        },
        didOpen: () => {
            Swal.getInput().addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                if (e.target.value.length > 4) {
                    e.target.value = e.target.value.slice(0, 4);
                }
            });
        }
    });

    const result = await swalWithInput.fire({
        title: '<span style="color: #fff;">Inserisci il partyID</span>',
    });

    if (result.isConfirmed) {
        var partyID = parseInt(result.value);
    }else{
        return;
    }

    if (isNaN(partyID)) {
        return;
    }


    fetch(`/`+gameEndpoint+`/join?partyID=${partyID}&player=${playername}`, {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data.status == 0)
            window.location.href = `/`+gameEndpoint+`/${data.page}?partyID=${data.partyID}&mtype=${data.mtype}&playerID=${data.playerID}`
        else
            alert(data.verbouse_error)
    })
    .catch((error) => {
        alert("Generic Error");
    });
});


document.getElementById('join-lobby-by-invite').addEventListener('click', async function() {
    var playername = nickname.value;
    if (playername == '') {
        alert('Inserisci un nome valido');
        return;
    }
    
    localStorage.setItem(gameEndpoint+'_playername', playername);

    partyID = new URLSearchParams(window.location.search).get('partyID');

    fetch(`/`+gameEndpoint+`/join?partyID=${partyID}&player=${playername}`, {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data.status == 0)
            window.location.href = `/`+gameEndpoint+`/${data.page}?partyID=${data.partyID}&mtype=${data.mtype}&playerID=${data.playerID}`
        else
            alert(data.verbouse_error)
    })
    .catch((error) => {
        alert("Generic Error");
    });
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