from flask import Blueprint, render_template, request
from flask_socketio import emit
from global_vars import partyManager,socketio, test
from server.apps import SosOnline as sosOnline
from json import load


with open('server/static/SosOnline/SosOnlineLimits.json', 'r') as f:
    sosOnlineLimits = load(f)

sosonline = Blueprint('sosonline', __name__)

@socketio.on('sosonline-ask-start-game')
def sosonline_start_game(data):
    partyID = int(data['partyID'])
    sosOnline.start_game(partyID)

@socketio.on('sosonline-get-inGameCards')
def sosonline_inGameCards(data):
    partyID = int(data['partyID'])
    mtype = int(data['mtype'])
    playerID = int(data['playerID'])

    return sosOnline.get_inGameCards(partyID,mtype,playerID,playerID,1)

@socketio.on('sosonline-change-turn')
def sosonline_change_turn(data):
    return sosOnline.change_turn(int(data['partyID']),int(data['playerID']),int(data['mtype']),int(data['newTurn']))

@socketio.on('sosonline-noise')
def sosonline_noise(data):
    return sosOnline.noise(int(data['partyID']),int(data['playerID']),int(data['mtype']),int(data['targetPlayer']),int(data['noiseLevel']))

@socketio.on('sosonline-get-noise')
def sosonline_get_noise(data):
    return sosOnline.get_noise(int(data['partyID']),int(data['playerID']),int(data['mtype']))



#-------------------------------------------------------------------------------------------


@sosonline.route('/')
def sosonline_index():
    return render_template('SosOnline/index.html')

@sosonline.route('/host', methods=['POST'])
def sosonline_host():
    return sosOnline.host(test=test)
    

@sosonline.route('/join', methods=['GET'])
def sosonline_join():
    
    #with open('server/static/SosOnline/SosOnlineLimits.json', 'r') as f:
    #    sosOnlineLimits = json.load(f)
    
    partyID = int(request.args.get('partyID'))
    playername = request.args.get('player')
    
    return sosOnline.join(partyID,playername)

@sosonline.route('/game', methods=['GET'])
def sosonline_game():
    mtype = int(request.args.get('mtype'))
    partyID = int(request.args.get('partyID'))  # Converti partyID in un intero
    if partyManager.get_party(partyID) is None:
        return "sorry no party found"
    #sosOnline.run(partyID)
    return render_template('SosOnline/game.html')

@sosonline.route('/overlord', methods=['GET'])
def sosonline_overlord():
    mtype = int(request.args.get('mtype'))
    partyID = int(request.args.get('partyID'))  # Converti partyID in un intero
    if partyManager.get_party(partyID) is None:
        return "sorry no party found"
    #sosOnline.run(partyID)
    return render_template('SosOnline/overlord.html')

@sosonline.route('/lobby')
def sosonline_lobby():
    #partyID = request.args.get('partyID')
    partyID = int(request.args.get('partyID'))
    if partyManager.get_party(partyID) is None:
        return "sorry no party found"
    return render_template('SosOnline/lobby.html')

