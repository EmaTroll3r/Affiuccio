#https://affiuccio.duckdns.org/SosOnline
from server import create_app
from global_vars import socketio, test
from flask_cors import CORS
from server.garbageColletor import garbageCollector

from OpenSSL import SSL

try:

    app = create_app()
    CORS(app)

    #socketio = SocketIO(app, cors_allowed_origins="*")

    socketio.init_app(app)

    if not test:
        garbageCollector()

    if __name__ == '__main__':
        #Only need for test in local
        if test == True:
            socketio.run(app, host='0.0.0.0', port=80)

        #Only need for test in server
        elif test == False:
            #context = ('/etc/letsencrypt/live/affiuccio.duckdns.org/fullchain.pem', '/etc/letsencrypt/live/affiuccio.duckdns.org/privkey.pem')
            context = SSL.Context(SSL.TLSv1_2_METHOD)
            context.use_certificate_file('/etc/letsencrypt/live/affiuccio.duckdns.org/fullchain.pem')
            context.use_privatekey_file('/etc/letsencrypt/live/affiuccio.duckdns.org/privkey.pem')
            context.set_cipher_list('ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256')
                
            def handle_error(ssl, where, ret):
                if where & SSL.SSL_CB_EXIT and ret <= 0:
                    return 0  # Close the connection

            context.set_info_callback(handle_error)

            socketio.run(app, host='0.0.0.0', port=443, ssl_context=context)
            
except Exception as e:
    pass   

