

document.getElementById('restart-button').addEventListener('click', function() {
    var password = prompt("Inserisci la password:");

    fetch('/manager/restart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            confirm: true,
            password: password,
        }),
    })
    .then(response => response.json())
    .then(data => alert(data.message))
    .catch((error) => {
        console.error('Errore:', error);
    });
});

document.getElementById('run-button').addEventListener('click', function() {
    var password = prompt("Inserisci la password:");

    fetch('/manager/run', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            confirm: true,
            password: password,
        }),
    })
    .then(response => response.json())
    .then(data => alert(data.message))
    .catch((error) => {
        console.error('Errore:', error);
    });
});

document.getElementById('runp-button').addEventListener('click', function() {
    var password = prompt("Inserisci la password:");

    fetch('/manager/runp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            confirm: true,
            password: password,
        }),
    })
    .then(response => response.json())
    .then(data => alert(data.message))
    .catch((error) => {
        console.error('Errore:', error);
    });
});