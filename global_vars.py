from flask import Blueprint
from flask_socketio import SocketIO
from server.classes import PartyManager

#from socketio_instance import socketio

socketio = SocketIO(cors_allowed_origins="*")
main = Blueprint('main', __name__, static_folder='static')

partyManager = PartyManager()

