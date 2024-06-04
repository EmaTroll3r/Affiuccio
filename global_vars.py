from flask import Blueprint
from flask_socketio import SocketIO
from server.classes import PartyManager
from json import dump
#from socketio_instance import socketio

test = True
#"""
from os import getenv
env = getenv('AffiuccioTest')
if env == 'development':
    test = True
elif env == 'production':
    test = False
else:
    test = True
#"""

ip_address = "158.180.238.217"
domain = "https://affiuccio.duckdns.org:443"

data = {
    'ip': ip_address,
    'domain': domain
}

if test == True:
    data = {
        'ip': "localhost",
        'domain': "http://localhost"
        #'domain': "http://192.168.1.54"
    }

with open('server/static/server_stats.json', 'w') as f:
    dump(data, f)


socketio = SocketIO(cors_allowed_origins="*")
main = Blueprint('main', __name__, static_folder='static')

partyManager = PartyManager()

