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

async function connectAndLoadScript() {
    await socket_connect()
    let scriptURL = document.getElementById('scriptURL')
    if(scriptURL){
        var realScript = document.createElement('script');
        realScript.src = scriptURL.value;;
        document.body.appendChild(realScript);
    }else{
        console.log('No script to load');

    }
}

connectAndLoadScript()

//console.log('Socket connected to: ' + ip_address);
