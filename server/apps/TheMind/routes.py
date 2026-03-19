from flask import Blueprint, render_template, request
from global_vars import partyManager,socketio, test
from server.apps import TheMind as theMind
from json import load


with open('server/static/TheMind/TheMindLimits.json', 'r') as f:
    theMindLimits = load(f)

themind = Blueprint('themind', __name__)

@socketio.on('themind-ask-start-game')
def themind_start_game(data):
    partyID = int(data['partyID'])
    theMind.start_game(partyID)

@socketio.on('themind-get-inGameCards')
def themind_inGameCards(data):
    partyID = int(data['partyID'])
    mtype = int(data['mtype'])
    playerID = int(data['playerID'])

    return theMind.get_inGameCards(partyID,mtype,playerID,playerID,2)

@socketio.on('themind-change-turn')
def themind_change_turn(data):
    return theMind.change_turn(int(data['partyID']),int(data['playerID']),int(data['mtype']),int(data['newTurn']))

@socketio.on('themind-noise')
def themind_noise(data):
    return theMind.noise(int(data['partyID']),int(data['playerID']),int(data['mtype']),int(data['targetPlayer']),int(data['noiseLevel']))

@socketio.on('themind-get-noise')
def themind_get_noise(data):
    return theMind.get_noise(int(data['partyID']),int(data['playerID']),int(data['mtype']))



#-------------------------------------------------------------------------------------------



@themind.route('/', methods=['GET'])
def themind_home():
    return render_template('TheMind/index.html')


@themind.route('/host', methods=['POST'])
def themind_host():
    return theMind.host(test=test)
    

@themind.route('/join', methods=['GET'])
def themind_join():
    
    partyID = int(request.args.get('partyID'))
    playername = request.args.get('player')
    
    return theMind.join(partyID,playername)

@themind.route('/game', methods=['GET'])
def themind_game():
    mtype = int(request.args.get('mtype'))
    partyID = int(request.args.get('partyID'))  # Converti partyID in un intero
    if partyManager.get_party(partyID) is None:
        #return "sorry no party found"        
        return render_template('TheMind/404.html')
    
    return render_template('TheMind/game.html')

@themind.route('/lobby')
def themind_lobby():
    #partyID = request.args.get('partyID')
    partyID = int(request.args.get('partyID'))
    if partyManager.get_party(partyID) is None:
        #return "sorry no party found"
        return render_template('TheMind/404.html')
    return render_template('TheMind/lobby.html')

