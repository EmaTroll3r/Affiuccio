from global_vars import partyManager
from .gamelist import game_list
from flask import jsonify, abort
from json import load
from flask_socketio import emit
from server.classes import Party


def get_game(game_name):
    if game_name not in game_list:
        abort(404)
    game = game_list.get(game_name)

    if not game:
        abort(404)

    return game


def get_game_endpoint(partyID):
    party = partyManager.get_party(partyID)
    if party is None:
        return None
    return party.gameEndpoint


def join_player(partyID, playername, game_name):
    party = partyManager.get_party(partyID)

    if party is None:
        response = {
            'status': 1,
            'verbouse_error': 'No party found'
        }
        
        return jsonify(response)

    if party.gameEndpoint != game_name:
        response = {
            'status': 5,
            'verbouse_error': 'Found a that partyID but for a different game. Game found: ' + party.gameEndpoint
        }        
        return jsonify(response)

    if playername:

        old_player = None
        for player in party.players:
            if player.name == playername:
                old_player = player
                break
        
        if old_player:
            mtype = old_player.mtype
            playerID = old_player.id
            page = 'game' if party.status == 'Game' else 'lobby'
        else:
            if party.status == 'Lobby':
                player = get_game(game_name).create_player(party, playername)

                mtype = party.join(player)
                playerID = player.id
                page = 'lobby'
            else:
                if party.status == 'Game':
                    status = 2
                    verbouse_error = "Game already started, you can'join"
                elif party.status == 'End':
                    status = 3
                    verbouse_error = "Game already ended, you can'join"

                response = {
                    'status': status,
                    'verbouse_error': verbouse_error
                }
                
                return jsonify(response)


        response = {
            'status': 0,
            'verbouse_error': 'no error',
            'partyID': party.id,
            'mtype': mtype,
            'playerID': playerID,
            'page': page
        }
        
        return jsonify(response)
    else:
        response = {
            'status': 4,
            'verbouse_error': 'No player name provided'
        }
        return jsonify(response)


def host(game_name, playername, test=False):

    partyID = Party.create_party(game_name,test=test)
    party = partyManager.get_party(partyID)
    game = get_game(game_name)
    game.create_game(party)

    with open('server/static/server_stats.json', 'r') as f:
        data = load(f)
    party.homeLink = data['domain'] + '/' + game_name
    
    player = game.create_masterPlayer(party, playername)

    response = {
        'partyID': partyID,
        'mtype': party.join(player),
        'playerID': player.id
    }

    return jsonify(response)


def start_game(partyID, game, settings=None):

    party = partyManager.get_party(partyID)
    links = game.generate_game_links(party)
    party.turn = 1

    game.setup_game(party)

    party.status = 'Game'
    emit('start-game',{'links': links}, room = party.id)


def get_noise(partyID,playerID,mtype):
    party = partyManager.get_party(partyID)
    emit('response-noise', {'playerID':playerID, 'mtype': mtype, 'noisePoints': party.get_player(mtype).components['noisePoints']}, room=party.id)


def noise(partyID,playerID,mtype,targetPlayer,noiseLevel):

    party = partyManager.get_party(partyID)
    player = party.get_player(mtype)
    if player.components['noisePoints'] < noiseLevel:
        response = {"status": 1, "message": "You don't have enough noisePoints"}
        emit('response-noise', {'response': response, 'playerID':playerID}, room=party.id)
        return
    if targetPlayer < 1 or targetPlayer > len(party.players):
        response = {"status": 2, "message": "Player not found"}
        emit('response-noise', {'response': response, 'playerID':playerID}, room=party.id)
        return
    if player.mtype == targetPlayer:    #non puoi fare rumore a te stesso
        response = {"status": 5, "message": "You can't make noise to yourself"}
        emit('response-noise', {'response': response, 'playerID':playerID}, room=party.id)
        return
    
    if player.components['noisePoints'] >= noiseLevel:
        player.components['noisePoints'] -= noiseLevel
        response = {"status": 0, "message": "Success"}
        emit('response-noise', {'playerID':playerID, 'mtype': mtype, 'noisePoints': player.components['noisePoints']}, room=party.id)
        emit('receive-noise', {'response': response, 'playerID':playerID, 'targetPlayer': targetPlayer, 'noiseLevel': noiseLevel}, room=party.id)


def get_turn(partyID, playerID):
    party = partyManager.get_party(partyID)
    emit('response-turn', {'response': {"status": 0, "message": "Success"},'playerID':playerID,'turn': party.turn, 'requestType':'request'}, room=party.id)


def get_hand(partyID, playerID, mtype, handtype):
    party = partyManager.get_party(partyID)
    hand = party.get_player(mtype).hands[handtype].to_dict()
    emit('response-hand', {'playerID': playerID,'handtype':handtype, 'hand': hand}, room=party.id)


def play_card(partyID, playerID, mtype, cards, handtypes, options=None, askHand=1):
    party = partyManager.get_party(partyID)
    game = get_game(party.gameEndpoint)
    response,end_response = game.play_card(party,cards,handtypes,party.get_player(mtype),options=options)
    
    
    if (response['status'] == 0):
        if(askHand == 1):
            for handtype in handtypes:

                hand = party.get_player(mtype).hands[handtype].to_dict()
                emit('response-hand', {'playerID': playerID,'handtype':handtype, 'hand': hand}, room=party.id)
    
    emit('card-played', {'response': response, 'playerID': playerID, 'cards': cards, 'handtype': handtypes, 'partyID':party.id, 'mtype':mtype,'options':options }, room=party.id)

    if(end_response != None):
        emit('end-game', end_response, room=party.id)


def draw(partyID, playerID, mtype, handtype, targetPlayer, targetHand):
    party = partyManager.get_party(partyID)
    try:
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
        response = {"status": 5, "message": "Generic error"}

    """
    if(targetPlayer != mtype):      #means that the player [mtype] is asking for another player (targetPlayer) draw
        emit('response-letDraw', {'response':response, 'playerID': playerID, 'targetPlayer':targetPlayer, 'targetHand':targetHand, 'handtype':handtype}, room=party.id)
        if(response['status'] == 0):
            emit('response-hand', {'response':response,'playerID': party.get_player(targetPlayer).id,'handtype':targetHand, 'hand': json.dumps(party.get_player(targetPlayer).hands[targetHand].to_dict())}, room=party.id)
    else:
        emit('response-hand', {'response':response,'playerID': party.get_player(targetPlayer).id,'handtype':targetHand, 'hand': json.dumps(party.get_player(targetPlayer).hands[targetHand].to_dict())}, room=party.id)
    #emit('response-hand', {'playerID': playerID,'handtype':handtype, 'hand': json.dumps(partyManager.get_party(partyID).players[mtype-1].hands[handtype].to_dict())}, room=partyID)
    """
    
    emit('response-letDraw', {'response':response, 'playerID': playerID, 'targetPlayer':targetPlayer, 'targetHand':targetHand, 'handtype':handtype}, room=party.id)
    if(response['status'] == 0):
        hand = party.get_player(targetPlayer).hands[targetHand].to_dict()
        emit('response-hand', {'playerID': party.get_player(targetPlayer).id,'handtype':targetHand, 'hand': hand}, room=party.id)
        
        game = get_game(party.gameEndpoint)
        game.preloadCards(party.id,mtype,playerID,n=2)


def change_turn(partyID,playerID,mtype,turn=None):
    party = partyManager.get_party(partyID)
    get_game(party.gameEndpoint).change_turn(party,playerID,mtype,turn)


def preloadCards(partyID, game_name, mtype, playerID, targetPlayer, n):
    party = partyManager.get_party(partyID)
    game = get_game(game_name)

    cards, cardsInHand = game.preloadCards(party, mtype, playerID, targetPlayer, n)

    if(targetPlayer != None):
        emit('responsepreloadCards', {'hand': cards, 'playerID':playerID, 'mtype': mtype,'targetPlayer':playerID, 'cardsInHand': cardsInHand}, room=partyID)
    else:
        emit('responsepreloadCards', {'hand': cards, 'playerID':playerID, 'mtype': mtype, 'cardsInHand': cardsInHand}, room=partyID)


def preloadCardsN(partyID, game_name):
    party = partyManager.get_party(partyID)
    game = get_game(game_name)

    return game.preloadCardsN(party)
