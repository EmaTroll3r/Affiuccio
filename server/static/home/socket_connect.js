var domain = "http://localhost"
var socket;

async function getDoamin() {
    try {
        const response = await fetch('/static/server_stats.json');
        const data = await response.json();
        return data['domain'];
    } catch (error) {
        console.error('Errore:', error);
    }
}

async function socket_connect() {
    domain = await getDoamin();
    //console.log('Connecting to: ' + ip_address);
    //socket = io.connect('http://'+ip_address);
    
    console.log('Connecting to: ' + domain);
    socket = io.connect(domain, {secure: true})
    console.log('Socket connected to: ' + domain);
}

socket_connect();
//console.log('Socket connected to: ' + ip_address);
