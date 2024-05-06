#from flask_socketio import SocketIO
from server import create_app
#from socketio_instance import socketio
from global_vars import socketio


app = create_app()

#socketio = SocketIO(app, cors_allowed_origins="*")
socketio.init_app(app)
socketio.run(app, host='0.0.0.0', port=80)