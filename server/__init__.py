import logging
from flask import Flask

from .mainroutes import main
#from .apps.SosOnline.routes import sos_online

from global_vars import socketio

def create_app():
    app = Flask(__name__)
    app.logger.setLevel(logging.ERROR)
    app.config['DEBUG'] = True
    app.config['SECRET_KEY'] = 'secret'


    app.register_blueprint(main)
    #app.register_blueprint(sos_online, url_prefix='/SosOnline')
    
    return app

