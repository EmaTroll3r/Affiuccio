from json import load
from flask_socketio import emit
from flask import jsonify, request
from global_vars import partyManager
from server.classes import Deck, Party, Player


with open('server/static/TheMind/TheMindLimits.json', 'r') as f:
    limits = load(f)

def join(partyID,playername):
    
    if partyManager.get_party(partyID) is None:
        return "sorry no party found"
    
    if playername:

        player = Player(playername,partyManager.get_party(partyID),{'hand': limits['maxHand']})
        player.components['noisePoints'] = limits['noiseForClients']
        response = {
            'partyID': partyID,
            'mtype': partyManager.get_party(partyID).join(player),
            'playerID': player.id
        }
        
        return jsonify(response)
    else:
        return "no player name provided"
    


def host(test=False):

    partyID = Party.create_party('TheMind',test=test)
    partyManager.get_party(partyID).add_deck(Deck(limits['maxCards']),'deck')

    print("\n\n\nCreated Deck with "+str(limits['maxCards'])+ " cards\n" + str(partyManager.get_party(partyID).decks['deck'].cards)+ "\n\n\n")

    with open('server/static/server_stats.json', 'r') as f:
        data = load(f)
    partyManager.get_party(partyID).homeLink = data['domain'] + '/TheMind'
    
    player = Player(request.get_json().get('player'),partyManager.get_party(partyID),{'hand': limits['maxHand']})
    player.components['noisePoints'] = limits['noiseForHost']

    response = {
        'partyID': partyID,
        'mtype': partyManager.get_party(partyID).join(player),
        'playerID': player.id
    }

    return jsonify(response)



def start_game(partyID):
    maxPlayersMtype = 0
    real_mtype = 1

    #assegna in ordine gli mptype reali e crea i link della nuova pagina per ogni giocatore in base al suo mtype originale e al partyID
    for player in partyManager.get_party(partyID).players:
        if player.mtype > maxPlayersMtype:
            maxPlayersMtype = player.mtype

    links = [None] * (maxPlayersMtype + 1)
    
    for player in partyManager.get_party(partyID).players:

        links[player.mtype] = '/TheMind/game?partyID=' + str(partyID) + '&mtype=' + str(real_mtype) + '&playerID=' + str(player.id)
        player.mtype = real_mtype
        real_mtype += 1

        partyManager.get_party(partyID).raw_draw(player.mtype)
        # print("\n\n\n" + str(partyManager.get_party(partyID).players[player.mtype -1].hands['hand']) + "\n\n\n")


    partyManager.get_party(partyID).turn = -1
    partyManager.get_party(partyID).status = 'Game'
    emit('start-game',{'links': links}, room = partyID)


def play_card(card,options=None):
    response = {"status": -1,"message": ""}

    return jsonify(response)

def get_inGameCards(partyID,mtype,playerID,targetPlayer = None,n=1):

    cards = []
    cardsInHand = 0
    for card in partyManager.get_party(partyID).get_player(mtype).hands['hand'].cards:
        cards.append(card.card)
        cardsInHand += 1

    for player in partyManager.get_party(partyID).players:
        if player.mtype == mtype:
            continue
        for card in player.hands['hand'].cards:
            cards.append(card.card)

    # cards.extend(partyManager.get_party(partyID).decks['deck'].watchNextCards(n * limits['maxHand']))
    
    if(targetPlayer != None):
        emit('response-inGameCards', {'hand': cards, 'playerID':playerID, 'mtype': mtype,'targetPlayer':playerID, 'cardsInHand': cardsInHand}, room=partyID)
    else:
        emit('response-inGameCards', {'hand': cards, 'playerID':playerID, 'mtype': mtype, 'cardsInHand': cardsInHand}, room=partyID)



def get_noise(partyID,playerID,mtype):
    emit('response-noise', {'playerID':playerID, 'mtype': mtype, 'noisePoints': partyManager.get_party(partyID).get_player(mtype).components['noisePoints']}, room=partyID)
