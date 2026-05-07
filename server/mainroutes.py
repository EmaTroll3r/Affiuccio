from flask import jsonify, render_template, request,redirect, url_for, abort
from flask_socketio import join_room, leave_room, emit
from global_vars import main, partyManager,socketio, test
from .gamelist import game_list
from .mainfunctions import get_game
from . import mainfunctions
from . import lobbyfunctions


def p(*args):
    print("\n\n\n",*args,"\n\n\n")


@socketio.on('ping')
def on_ping(data):
    partyID = int(data['partyID'])
    playerID = int(data['playerID'])
    
    lobbyfunctions.on_ping(playerID)


@socketio.on('join')
def on_join(data):
    partyID = int(data['partyID'])
    playerID = int(data['playerID'])
    mtype = int(data['mtype'])

    lobbyfunctions.join_to_room(partyID,playerID,mtype)
    

@socketio.on('play-card')
def play_card(data):
    partyID = int(data['partyID'])
    mtype = int(data['mtype'])
    cards = data['cards']
    handtypes = data['handtype']
    playerID = int(data['playerID'])
    options = data.get('options', None)
    askHand = data.get('askHand', 1)
    
    mainfunctions.play_card(partyID, playerID, mtype, cards, handtypes, options=options, askHand=askHand)
    


@socketio.on('get-hand')
def ask_hand(data):
    partyID = int(data['partyID'])
    handtype = data['handtype']
    playerID = int(data['playerID'])
    mtype = int(data['mtype'])


    mainfunctions.get_hand(partyID, playerID, mtype, handtype)
    

@socketio.on('get-turn')
def get_turn(data):
    partyID = int(data['partyID'])
    playerID = int(data['playerID'])

    mainfunctions.get_turn(partyID, playerID)


@socketio.on('get-noise')
def get_noise(data):
    partyID = int(data['partyID'])
    playerID = int(data['playerID'])
    mtype = int(data['mtype'])

    mainfunctions.get_noise(partyID,playerID,mtype)


@socketio.on('get-all-points')
def get_allPoints(data):
    partyID = int(data['partyID'])
    lobbyfunctions.get_allPoints(partyID)


@socketio.on('leave')
def on_leave(data):
    partyID = int(data['partyID'])
    playerID = int(data['playerID'])

    lobbyfunctions.leave_party(partyID, playerID)


@socketio.on('draw')
def draw(data):
    partyID = int(data['partyID'])
    playerID = int(data['playerID'])
    mtype = int(data['mtype'])
    handtype = data['handtype']
    targetPlayer = int(data['targetPlayer'])
    targetHand = data['targetHand']

    mainfunctions.draw(partyID, playerID, mtype, handtype, targetPlayer, targetHand)

@socketio.on('get-playerList')
def get_playerList(data):
    partyID = int(data['partyID'])
    playerID = int(data['playerID'])
    mtype = int(data['mtype'])

    lobbyfunctions.get_playerList(partyID, playerID, mtype)


@socketio.on('remove-player')
def remove_player_from_lobby(data):
    partyID = int(data['partyID'])
    playerID = int(data['playerID'])
    targetMtype = int(data['targetMtype'])
    homeLink = data['homeLink']

    lobbyfunctions.remove_player_from_lobby(partyID, targetMtype, homeLink)



@socketio.on('ask-start-game')
def start_game(data):
    game = get_game(data.get('gameName'))
    partyID = int(data['partyID'])
    
    try:
        settings = data['settings']
    except KeyError:
        settings = None

    mainfunctions.start_game(partyID, game, settings)

@socketio.on('preloadCards')
def preloadCards(data):
    game_name = data.get('gameName')
    partyID = int(data['partyID'])
    mtype = int(data['mtype'])
    playerID = int(data['playerID'])
    n = mainfunctions.preloadCardsN(partyID, game_name)

    return mainfunctions.preloadCards(partyID, game_name, mtype, playerID, playerID, n)

@socketio.on('change-turn')
def change_turn(data):
    partyID = int(data['partyID'])
    playerID = int(data['playerID'])
    mtype = int(data['mtype'])

    try:
        newTurn = int(data['newTurn'])  
    except KeyError:
        newTurn = None

    mainfunctions.change_turn(partyID,playerID,mtype,newTurn)

@socketio.on('noise')
def noise(data):
    partyID = int(data['partyID'])
    playerID = int(data['playerID'])
    mtype = int(data['mtype'])
    targetPlayer = int(data['targetPlayer'])
    noiseLevel = int(data['noiseLevel'])

    mainfunctions.noise(partyID, playerID, mtype, targetPlayer, noiseLevel)

@socketio.on('get-noise')
def get_noise(data):
    partyID = int(data['partyID'])
    playerID = int(data['playerID'])
    mtype = int(data['mtype'])

    mainfunctions.get_noise(partyID, playerID, mtype)




@main.route('/')
def home_index():
    return render_template('home/index.html')
    #return main.send_static_file('index.html')

@main.route('/home/playerList', methods=['GET'])
def get_player_list():
    partyID = int(request.args.get('partyID'))
    party = partyManager.get_party(partyID)
    if party is None:
        return {'message':"sorry no party found", 'status': 1}
    players = party.players
    return jsonify([player.to_dict() for player in players])

@main.route('/home/parties')
def get_parties():
    return jsonify(partyManager.get_parties())






@main.route('/<game_name>/', methods=['GET'])
def home(game_name):
    if game_name not in game_list:
        abort(404)
        
    return render_template(f'{game_name}/index.html', game_name=game_name)


@main.route('/<game_name>/host', methods=['POST'])
def host(game_name):
    if game_name not in game_list:
        abort(404)
        
    playername = request.get_json().get('player')
    return mainfunctions.host(game_name, playername, test=test)


@main.route('/<game_name>/join', methods=['GET'])
def join(game_name):
    if game_name not in game_list:
        abort(404)
        
    partyID = int(request.args.get('partyID'))
    playername = request.args.get('player')

    return mainfunctions.join_player(partyID, playername, game_name)


@main.route('/<game_name>/game', methods=['GET'])
def game(game_name):
    if game_name not in game_list:
        abort(404)
        
    partyID = int(request.args.get('partyID'))
    if partyManager.get_party(partyID) is None:
        return render_template(f'{game_name}/404.html', game_name=game_name)
    
    return render_template(f'{game_name}/game.html', game_name=game_name)


@main.route('/<game_name>/end', methods=['GET'])
def end(game_name):
    return redirect(url_for('.home', game_name=game_name))


@main.route('/<game_name>/lobby')
def lobby(game_name):
    partyID = int(request.args.get('partyID'))
    if partyManager.get_party(partyID) is None:
        return render_template(f'{game_name}/404.html', game_name=game_name)
    return render_template(f'{game_name}/lobby.html', game_name=game_name)


@main.route('/<game_name>/invite')
def invite(game_name):
    partyID = int(request.args.get('partyID'))
    senderID = int(request.args.get('playerID'))
    sender = partyManager.get_player(senderID).name if senderID is not None else "Unknown"
    if partyManager.get_party(partyID) is None:
        return render_template(f'{game_name}/404.html', game_name=game_name)
    return render_template(f'{game_name}/invite.html', game_name=game_name, sender=sender)