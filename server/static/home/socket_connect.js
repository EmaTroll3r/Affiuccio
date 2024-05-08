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

async function socket_connect() {
    ip_address = await getIp();
    console.log('Connecting to: ' + ip_address);
    socket = io.connect('http://'+ip_address);
    console.log('Socket connected to: ' + ip_address);
}

socket_connect();
//console.log('Socket connected to: ' + ip_address);
