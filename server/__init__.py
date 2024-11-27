import logging
from flask import Flask

from .mainroutes import main
from .apps.SosOnline.routes import sosonline
from .apps.SyncWatch.routes import syncwatch


#from global_vars import socketio

def create_app():
    app = Flask(__name__)
    app.logger.setLevel(logging.ERROR)
    #logging.basicConfig(filename='app.log', level=logging.INFO)
    #logging.info('This message will be logged to the file app.log')
    
    #log = logging.getLogger('werkzeug')
    #log.disabled = True
    #log.setLevel(logging.ERROR)
    app.config['DEBUG'] = True
    app.config['SECRET_KEY'] = 'secret'


    app.register_blueprint(main)
    app.register_blueprint(sosonline, url_prefix='/SosOnline')
    app.register_blueprint(syncwatch, url_prefix='/SyncWatch')
    #app.register_blueprint(sos_online, url_prefix='/SosOnline')
    
    return app

