#from flask_socketio import SocketIO
from server import create_app
#from socketio_instance import socketio
from global_vars import socketio
from flask_cors import CORS


app = create_app()
CORS(app)

#socketio = SocketIO(app, cors_allowed_origins="*")
socketio.init_app(app)
socketio.run(app, host='0.0.0.0', port=80)