

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