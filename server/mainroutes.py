from flask import jsonify, render_template, request,redirect, url_for, abort
from flask_socketio import join_room, leave_room,emit
from global_vars import main, partyManager,socketio, test
from .gamelist import game_list



def get_game(game_name):
    if game_name not in game_list:
        abort(404)
    game = game_list.get(game_name)

    if not game:
        abort(404)

    return game


def p(*args):
    print("\n\n\n",*args,"\n\n\n")


@socketio.on('ping')
def on_ping(data):
    partyID = int(data['partyID'])
    playerID = int(data['playerID'])
    
    if playerID in partyManager.players:
        #print("Ping from player",playerID)
        partyManager.get_player(playerID).active_level = 4

@socketio.on('join')
def on_join(data):
    partyID = int(data['partyID'])
    playerID = int(data['playerID'])
    mtype = int(data['mtype'])


    if partyManager.get_party(partyID) is None:
        #p("No party found")
        #join_room(partyID)
        #emit('error', {'playerID': playerID, 'partyID': partyID, 'message': "No party found", 'status': 1}, room=partyID)
        #leave_room(partyID)
        return "sorry no party found"


    #print("\n\n\nJoined\n\n\n\n")
    join_room(partyID)
    #partyManager.get_party(partyID).activePlayers.append(playerID)

    #emit('joined', room=partyID)
    #emit('player-joined', {'playerID': playerID, 'partyID': partyID, 'mtype': data['mtype'], 'playerName': partyManager.get_player(playerID).name}, room=partyID)
    # print('join', {'playerID': playerID, 'partyID': partyID, 'mtype': mtype, 'playerName': partyManager.get_player(playerID).name})
    emit('player-joined', {'playerID': playerID, 'partyID': partyID, 'mtype': partyManager.get_player(playerID).mtype, 'playerName': partyManager.get_player(playerID).name}, room=partyID)
    

@socketio.on('play-card')
def play_card_endpoint(data):
    partyID = int(data['partyID'])
    mtype = int(data['mtype'])
    cards = data['cards']
    handtypes = data['handtype']
    playerID = int(data['playerID'])
    options = data.get('options', None)
    askHand = data.get('askHand', 1)
    
    #response = play_card(cards,handtypes,partyManager.get_player(playerID),partyManager.get_party(partyID),options=options)
    game = get_game(partyManager.get_party(partyID).gameEndpoint)
    response,end_response = game.play_card(cards,handtypes,partyManager.get_player(playerID),partyManager.get_party(partyID),options=options)
    
    
    if (response['status'] == 0):
        if(askHand == 1):
            for handtype in handtypes:

                hand = partyManager.get_party(partyID).get_player(mtype).hands[handtype].to_dict()
                emit('response-hand', {'playerID': playerID,'handtype':handtype, 'hand': hand}, room=partyID)


                #emit('response-inGameCards', {'hand': [partyManager.get_party(partyID).decks[handtype].watchNextCards().card], 'playerID':playerID, 'mtype': mtype,'playerID':playerID}, room=partyID)
                #emit('response-hand', {'playerID': playerID,'handtype':handtype, 'hand': json.dumps(partyManager.get_party(partyID).players[mtype-1].hands[handtype].to_dict())}, room=partyID)
                #p('response-hand', {'playerID': playerID,'handtype':handtype, 'hand': json.dumps(partyManager.get_party(partyID).players[mtype-1].hands[handtype].to_dict())})

    
    emit('card-played', {'response': response, 'playerID': playerID, 'cards': cards, 'handtype': handtypes, 'partyID':partyID, 'mtype':mtype,'options':options }, room=partyID)

    if(end_response != None):
        emit('end-game', end_response, room=partyID)

@socketio.on('get-hand')
def ask_hand(data):
    partyID = int(data['partyID'])
    handtype = data['handtype']
    playerID = int(data['playerID'])
    mtype = int(data['mtype'])
    #print("\n\n\nRicevuto ask hand",json.dumps(partyManager.get_party(partyID).players[int(data['mtype'])-1].hands[data['hand']].to_dict()),"\n\n\n")
    #print("\n\n\nRicevuto ask hand\n\n\n")
    #emit('response-hand', {'playerID': int(data['playerID']),'handtype':data['handtype'], 'hand': json.dumps(partyManager.get_party(partyID).players[int(data['mtype'])-1].hands[data['handtype']].to_dict())}, room=partyID)
    hand = partyManager.get_party(partyID).get_player(mtype).hands[handtype].to_dict()
    emit('response-hand', {'playerID': playerID,'handtype':handtype, 'hand': hand}, room=partyID)
    #hand = partyManager.get_party(partyID).players[int(data['mtype'])-1].hands[data['handtype']].to_dict()
    #emit('response-hand', {'playerID': int(data['playerID']),'handtype':data['handtype'], 'hand': hand}, room=partyID)

@socketio.on('get-turn')
def get_turn(data):
    partyID = int(data['partyID'])
    playerID = int(data['playerID'])
    #print("\n\n\nRicevuto ask hand",json.dumps(partyManager.get_party(partyID).players[int(data['mtype'])-1].hands[data['hand']].to_dict()),"\n\n\n")
    #print("\n\n\nRicevuto ask hand\n\n\n")
    emit('response-turn', {'response': {"status": 0, "message": "Success"},'playerID':playerID,'turn': partyManager.get_party(partyID).turn, 'requestType':'request'}, room=partyID)


@socketio.on('get-noise')
def get_noise(data):
    partyID = int(data['partyID'])
    playerID = int(data['playerID'])
    mtype = int(data['mtype'])
    emit('response-noise', {'playerID':playerID, 'mtype': mtype, 'noisePoints': partyManager.get_party(partyID).get_player(mtype).components['noisePoints']}, room=partyID)


@socketio.on('get-all-points')
def get_allPoints(data):
    partyID = int(data['partyID'])
    points = [None] * (len(partyManager.get_party(partyID).players) + 1)
    for player in partyManager.get_party(partyID).players:
        points[player.mtype] = player.points
    #p(points)
    emit('response-points', {'points': points}, room=partyID)

@socketio.on('leave')
def on_leave(data):
    partyID = data['partyID']
    playerID = data['playerID']
    leave_room(partyID)
    emit('player_left', {'playerID': playerID}, room=partyID)

#"""
@socketio.on('draw')
def draw(data):
    partyID = int(data['partyID'])
    playerID = int(data['playerID'])
    mtype = int(data['mtype'])
    handtype = data['handtype']
    targetPlayer = int(data['targetPlayer'])
    targetHand = data['targetHand']


    try:
        party = partyManager.get_party(partyID)
        if(party == None):
            response = {"status": 1, "message": "Party not found"}
        elif(party.get_player(targetPlayer) == None):
            response = {"status": 2, "message": "Player not found"}
        elif(not(targetHand in party.get_player(targetPlayer).hands)):
            response = {"status": 3, "message": "Hand not found"}
        elif(not(handtype in party.decks)):
            response = {"status": 4, "message": "Deck not found"}
        else:
            card = party.draw(targetPlayer,targetHand,handtype)
            if (card > 0):
                response = {"status": 0, "message": "Success"}
            elif(card == -1):
                response = {"status": 6, "message": "Maximum hand size reached"}
            elif(card == -2):
                response = {"status": 7, "message": "Player not found"}
            elif(card == -3):
                response = {"status": 8, "message": "Hand not found"}
            elif(card == -4):
                response = {"status": 9, "message": "Deck not found"}
            else:
                response = {"status": 5, "message": "Generic error"}
    except Exception as e:
        #p("Error in draw",e)
        response = {"status": 5, "message": "Generic error"}

    """
    if(targetPlayer != mtype):      #means that the player [mtype] is asking for another player (targetPlayer) draw
        emit('response-letDraw', {'response':response, 'playerID': playerID, 'targetPlayer':targetPlayer, 'targetHand':targetHand, 'handtype':handtype}, room=partyID)
        if(response['status'] == 0):
            emit('response-hand', {'response':response,'playerID': partyManager.get_party(partyID).get_player(targetPlayer).id,'handtype':targetHand, 'hand': json.dumps(partyManager.get_party(partyID).get_player(targetPlayer).hands[targetHand].to_dict())}, room=partyID)
    else:
        emit('response-hand', {'response':response,'playerID': partyManager.get_party(partyID).get_player(targetPlayer).id,'handtype':targetHand, 'hand': json.dumps(partyManager.get_party(partyID).get_player(targetPlayer).hands[targetHand].to_dict())}, room=partyID)
    #emit('response-hand', {'playerID': playerID,'handtype':handtype, 'hand': json.dumps(partyManager.get_party(partyID).players[mtype-1].hands[handtype].to_dict())}, room=partyID)
    """
    
    emit('response-letDraw', {'response':response, 'playerID': playerID, 'targetPlayer':targetPlayer, 'targetHand':targetHand, 'handtype':handtype}, room=partyID)
    if(response['status'] == 0):
        hand = partyManager.get_party(partyID).get_player(targetPlayer).hands[targetHand].to_dict()
        emit('response-hand', {'playerID': partyManager.get_party(partyID).get_player(targetPlayer).id,'handtype':targetHand, 'hand': hand}, room=partyID)


        
        game = get_game(partyManager.get_party(partyID).gameEndpoint)
        game.get_inGameCards(partyID,mtype,playerID,n=2)

@socketio.on('get-playerList')
def get_playerList(data):
    partyID = int(data['partyID'])
    playerID = int(data['playerID'])
    mtype = int(data['mtype'])

    playerList = []
    for player in partyManager.get_party(partyID).players:
        playerList.append({"name": player.name, "mtype": player.mtype, "playerID": player.id, 'points': player.points},)

    emit('response-playerList', {'mtype':mtype, 'partyID':partyID, 'playerID':playerID, 'playerList': playerList}, room=partyID)


@socketio.on('remove-player')
def remove_player_from_lobby(data):
    partyID = int(data['partyID'])
    playerID = int(data['playerID'])
    targetMtype = int(data['targetMtype'])
    homeLink = data['homeLink']

    if(targetMtype != 1):
        partyManager.get_party(partyID).remove_player(targetMtype)
        response = {"status": 0, "message": "Success"}
    else:
        response = {"status": 1, "message": "Can't remove the host"}
    
    players = partyManager.get_party(partyID).players
    playerList = [player.to_dict() for player in players]


    emit('kicked-player', {'kickedPlayer':targetMtype,'homeLink':homeLink}, room=partyID)
    emit('playerList', {'playerList': playerList, 'response':response}, room=partyID)



@socketio.on('ask-start-game')
def start_game(data):
    game = get_game(data.get('gameName'))
    partyID = int(data['partyID'])
    try:
        settings = data['settings']
    except KeyError:
        settings = None

    game.start_game(partyID, settings)

@socketio.on('get-inGameCards')
def inGameCards(data):
    game = get_game(data.get('gameName'))
    partyID = int(data['partyID'])
    mtype = int(data['mtype'])
    playerID = int(data['playerID'])
    n = game.get_inGameCardsN(partyID)

    return game.get_inGameCards(partyID,mtype,playerID, playerID, n)

@socketio.on('change-turn')
def change_turn(data):
    
    game = get_game(data.get('gameName'))
    return game.change_turn(int(data['partyID']),int(data['playerID']),int(data['mtype']),int(data['newTurn']))

@socketio.on('noise')
def noise(data):
    game = get_game(data.get('gameName'))
    return game.noise(int(data['partyID']),int(data['playerID']),int(data['mtype']),int(data['targetPlayer']),int(data['noiseLevel']))

@socketio.on('get-noise')
def get_noise(data):
    game = get_game(data.get('gameName'))
    return game.get_noise(int(data['partyID']),int(data['playerID']),int(data['mtype']))



@main.route('/')
def home_index():
    return render_template('home/index.html')
    #return main.send_static_file('index.html')

@main.route('/home/playerList', methods=['GET'])
def get_player_list():
    partyID = int(request.args.get('partyID'))
    if partyManager.get_party(partyID) is None:
        return {'message':"sorry no party found", 'status': 1}
    players = partyManager.get_party(partyID).players
    return jsonify([player.to_dict() for player in players])

@main.route('/home/parties')
def get_parties():
    return jsonify(partyManager.get_parties())






@main.route('/<game_name>/', methods=['GET'])
def home(game_name):
    if game_name not in game_list:
        abort(404)
        
    return render_template(f'{game_name}/index.html')


@main.route('/<game_name>/host', methods=['POST'])
def host(game_name):
    if game_name not in game_list:
        abort(404)
        
    manager = game_list[game_name]
    return manager.host(game_name, test=test)


@main.route('/<game_name>/join', methods=['GET'])
def join(game_name):
    if game_name not in game_list:
        abort(404)
        
    partyID = int(request.args.get('partyID'))
    playername = request.args.get('player')
    
    manager = game_list[game_name]
    return manager.join(partyID, playername, game_name)


@main.route('/<game_name>/game', methods=['GET'])
def game(game_name):
    if game_name not in game_list:
        abort(404)
        
    partyID = int(request.args.get('partyID'))
    if partyManager.get_party(partyID) is None:
        return render_template(f'{game_name}/404.html')
    
    return render_template(f'{game_name}/game.html')


@main.route('/<game_name>/end', methods=['GET'])
def end(game_name):
    return redirect(url_for('.home', game_name=game_name))


@main.route('/<game_name>/lobby')
def lobby(game_name):
    partyID = int(request.args.get('partyID'))
    if partyManager.get_party(partyID) is None:
        return render_template(f'{game_name}/404.html')
    return render_template(f'{game_name}/lobby.html')