import logging
from flask import Flask, render_template, request

from .mainroutes import main
from .apps.SosOnline.routes import sosonline
from .apps.SyncWatch.routes import syncwatch
from .apps.DBChess.routes import dbchess


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
    app.register_blueprint(dbchess, url_prefix='/DBChess')
    app.register_blueprint(syncwatch, url_prefix='/SyncWatch')
    app.register_blueprint(sosonline, url_prefix='/SosOnline')
    #app.register_blueprint(sos_online, url_prefix='/SosOnline')
    
    # Error handler globale che determina il CSS in base al path
    @app.errorhandler(404)
    def handle_404_global(e):
        path = request.path
        print(f'404 error for path: {path}')
        
        if path.startswith('/SosOnline'):
            css_url = 'SosOnline/404.css'
            home_url = '/SosOnline'
            print('Loading SosOnline CSS for 404')
        elif path.startswith('/DBChess'):
            css_url = 'DBChess/404.css'
            home_url = '/DBChess'
            print('Loading DBChess CSS for 404')
        else:
            css_url = 'home/404.css'
            home_url = '/'
            print('Loading default CSS for 404')
        
        return render_template('home/404.html', css_url=css_url, home_url=home_url), 404
    
    @app.errorhandler(500)
    def handle_500_global(e):
        path = request.path
        print(f'500 error for path: {path}')
        
        if path.startswith('/SosOnline'):
            css_url = 'SosOnline/404.css'
            home_url = '/SosOnline'
        elif path.startswith('/DBChess'):
            css_url = 'DBChess/styles.css'
            home_url = '/DBChess'
        else:
            css_url = 'home/404.css'
            home_url = '/'
        
        return render_template('home/404.html', css_url=css_url, home_url=home_url), 500
    
    return app

