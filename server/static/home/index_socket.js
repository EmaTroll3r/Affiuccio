/*
var ip_address = "localhost"
var socket;

async function getIp() {
    try {
        const response = await fetch('/static/server_stats.json');
        const data = await response.json();
        return data['ip'];
    } catch (error) {
        console.error('Errore:', error);
    }
}

async function connect() {
    ip_address = await getIp();
    console.log('Connecting to: ' + ip_address);
    socket = io.connect('http://'+ip_address);



    socket.on('player-joined', function(data) {
        //console.log('A player joined with ID: ' + data.playerID);
        //alert('A player joined with ID: ' + data.playerID);
        localStorage.setItem('playerID', data.playerID);
        window.location.href = `/`+gameEndpoint+`/lobby?mtype=${data.mtype}&partyID=${data.partyID}&playerID=${data.playerID}`
    });

}
*/