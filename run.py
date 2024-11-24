#https://affiuccio.duckdns.org/SosOnline
import logging
from server import create_app
from global_vars import socketio, test
from flask_cors import CORS
from server.garbageColletor import garbageCollector

app = create_app()
CORS(app)

#socketio = SocketIO(app, cors_allowed_origins="*")

socketio.init_app(app)

if not test:
    garbageCollector()

if __name__ == '__main__':

    logging.basicConfig(level=logging.DEBUG)

    try:
        #Only need for test in local
        if test == True:
            socketio.run(app, host='0.0.0.0', port=80)

        #Only need for test in server
        elif test == False:
            context = ('/etc/letsencrypt/live/affiuccio.duckdns.org/fullchain.pem', '/etc/letsencrypt/live/affiuccio.duckdns.org/privkey.pem')
            socketio.run(app, host='0.0.0.0', port=443, ssl_context=context)
    
    except Exception as e:
        logging.error("Errore durante l'avvio del server: %s", e)
        

