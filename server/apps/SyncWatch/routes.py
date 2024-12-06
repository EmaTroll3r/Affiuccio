from flask import Blueprint, request
from server.apps import SyncWatch as syncWatch
from flask import jsonify

#from global_vars import partyManager,socketio, test
#from server.classes import Party
#from json import load

syncwatch = Blueprint('syncwatch', __name__)


@syncwatch.route('/create-party', methods=['GET'])
def syncwatch_create_party():
    partyID = syncWatch.syncwatch_create_party()
    return jsonify({"response": partyID,"state":0, "error": "no error"})

@syncwatch.route('/create-party-url', methods=['POST'])
def syncwatch_create_party_with_url():
    data = request.get_json()
    try:
        url = data.get('url', 'default_value')
    except:
        return jsonify({"response": 0,"state":1,"error": "Invalid url"})
    partyID = syncWatch.syncwatch_create_party(url=url)
    return jsonify({"response": partyID,"state":0, "error": "no error"})


@syncwatch.route('/play-pause', methods=['POST'])
def syncwatch_play_pause_endpoint():
    data = request.get_json()
    try:
        partyID = int(data.get('partyID', 'default_value'))
    except:
        return jsonify({"response": 0,"state":1,"error": "Invalid partyID"})
    play_pause = syncWatch.syncwatch_play_pause(partyID)
    return jsonify({"response": play_pause,"state":0,"error": "no error"})

"""
@syncwatch.route('/next', methods=['POST'])
def syncwatch_next_endpoint():
    data = request.get_json()
    try:
        partyID = int(data.get('partyID', 'default_value'))
    except:
        return jsonify({"response": 0,"state":1,"error": "Invalid partyID"})
    next = syncWatch.syncwatch_next(partyID)
    return jsonify({"response": next,"state":0,"error": "no error"})

@syncwatch.route('/previous', methods=['POST'])
def syncwatch_previous_endpoint():
    data = request.get_json()
    try:
        partyID = int(data.get('partyID', 'default_value'))
    except:
        return jsonify({"response": 0,"state":1,"error": "Invalid partyID"})
    previous = syncWatch.syncwatch_previous(partyID)
    return jsonify({"response": previous,"state":0,"error": "no error"})
"""
    

@syncwatch.route('/get-current-values', methods=['POST'])
def syncwatch_get_current_values_endpoint():
    try:
        partyID = int(request.get_json().get('partyID', 'default_value'))
    except:
        return jsonify({"response": 0,"state":1,"error": "Invalid partyID"})
    return jsonify(syncWatch.syncwatch_get_current_values(partyID))

@syncwatch.route('/set-time', methods=['POST'])
def syncwatch_set_time_endpoint():
    data = request.get_json()
    try:
        partyID = int(data.get('partyID', 'default_value'))
        time = int(data.get('time', 'default_value'))
    except:
        return jsonify({"response": 0,"state":1,"error": "Invalid partyID"})
    time = syncWatch.syncwatch_set_time(partyID,time)
    return jsonify({"response": time,"state":0,"error": "no error"})

@syncwatch.route('/add-url', methods=['POST'])
def syncwatch_add_url_endpoint():
    data = request.get_json()
    try:
        partyID = int(data.get('partyID', 'default_value'))
        url = int(data.get('url', 'default_value'))
    except:
        return jsonify({"response": 0,"state":1,"error": "Invalid partyID"})
    url = syncWatch.syncwatch_add_url(partyID,url)
    return jsonify({"response": url,"state":0,"error": "no error"})