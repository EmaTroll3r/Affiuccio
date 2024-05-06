from flask import Blueprint
from flask_socketio import SocketIO
from server.classes import PartyManager
from json import dump
#from socketio_instance import socketio

test = True
ip_address = "158.180.238.217"

data = {
    'ip': ip_address,
}

if test == True:
    data = {
        'ip': "localhost",
    }

with open('server/static/server_stats.json', 'w') as f:
    dump(data, f)


socketio = SocketIO(cors_allowed_origins="*")
main = Blueprint('main', __name__, static_folder='static')

partyManager = PartyManager()

