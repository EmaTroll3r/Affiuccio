from flask import Blueprint, render_template, request
from global_vars import partyManager,socketio, test
from flask import jsonify
from server.classes import Party
from server.apps import SyncWatch as syncWatch
#from json import load

syncwatch = Blueprint('syncwatch', __name__)


@syncwatch.route('/create-party', methods=['GET'])
def syncwatch_create_party():
    #partyID = Party.create_party('SyncWatch',test=test)
    partyID = syncWatch.syncwatch_create_party()
    return jsonify({"result": partyID,"state":0,"error": "no error"})


@syncwatch.route('/play-pause', methods=['POST'])
def syncwatch_play_pause_endpoint():
    data = request.get_json()
    try:
        partyID = int(data.get('partyID', 'default_value'))
    except:
        return jsonify({"result": 0,"state":1,"error": "Invalid partyID"})
    play_pause = syncWatch.syncwatch_play_pause(partyID)
    return jsonify({"result": play_pause,"state":0,"error": "no error"})

@syncwatch.route('/next', methods=['POST'])
def syncwatch_next_endpoint():
    data = request.get_json()
    try:
        partyID = int(data.get('partyID', 'default_value'))
    except:
        return jsonify({"result": 0,"state":1,"error": "Invalid partyID"})
    next = syncWatch.syncwatch_next(partyID)
    return jsonify({"result": next,"state":0,"error": "no error"})

@syncwatch.route('/previous', methods=['POST'])
def syncwatch_previous_endpoint():
    data = request.get_json()
    try:
        partyID = int(data.get('partyID', 'default_value'))
    except:
        return jsonify({"result": 0,"state":1,"error": "Invalid partyID"})
    previous = syncWatch.syncwatch_previous(partyID)
    return jsonify({"result": previous,"state":0,"error": "no error"})

@syncwatch.route('/get-current-values', methods=['POST'])
def syncwatch_get_current_values_endpoint():
    try:
        partyID = int(request.get_json().get('partyID', 'default_value'))
    except:
        return jsonify({"result": 0,"state":1,"error": "Invalid partyID"})
    return jsonify(syncWatch.syncwatch_get_current_values(partyID))