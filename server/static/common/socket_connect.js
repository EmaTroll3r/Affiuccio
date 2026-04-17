let domain = "http://localhost"
let socket;

function isLocalOrigin(hostname) {
    return hostname === 'localhost'
        || hostname === '127.0.0.1'
        || hostname === '0.0.0.0'
        || hostname.startsWith('192.168.')
        || hostname.startsWith('10.')
        || /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);
}

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
    const fetchedDomain = await getDoamin();
    const socketDomain = isLocalOrigin(window.location.hostname)
        ? window.location.origin
        : (fetchedDomain || window.location.origin);
    const socketOptions = socketDomain.startsWith('https://') ? {secure: true} : {};

    domain = socketDomain;
    console.log('Connecting to: ' + domain);
    socket = io.connect(domain, socketOptions);
    socket.on('connect_error', function(error) {
        console.error('Socket connect error:', error);
    });
    console.log('Socket connected to: ' + domain);
}

async function connectAndLoadScript() {
    await socket_connect()


    let scriptInputs = document.querySelectorAll('.dynamic-script-url');
    if (scriptInputs.length > 0) {
        scriptInputs.forEach(input => {
            let scriptTag = document.createElement('script');
            scriptTag.src = input.value;
            
            // Fondamentale: disabilita l'asincronia per mantenere l'ordine esatto!
            scriptTag.async = false; 
            
            document.body.appendChild(scriptTag);
            console.log('Caricato script:', input.value); // Un log per darti conferma
        });
    } else {
        console.log('No additional scripts to load');
    }
}

connectAndLoadScript()

//console.log('Socket connected to: ' + ip_address);
