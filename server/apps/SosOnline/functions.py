from json import load
from flask_socketio import emit
from flask import jsonify, request
from global_vars import partyManager
from server.classes import Deck, Party, Player


with open('server/static/SosOnline/SosOnlineLimits.json', 'r') as f:
    sosOnlineLimits = load(f)

def play_card(cards,handtypes,player,party,others=None,needToPlay=True):
    response = {"status": -1,"message": ""}
    newTurn = -1
    end_response = None
    if(handtypes[0] != "wl"):     #se non è una carta occhiataccia
        #with open('server/static/SosOnline/SosOnlineLimits.json', 'r') as f:
        #    sosOnlineLimits = load(f)
        for i in range(len(cards)):
            if cards[i] == 0:
                continue
            if(not player.can_play(cards[i],handtypes[i])):
                #print("cards",cards[i],"not in hand",handtypes[i])
                response.update({"status": 1, "message": "card "+cards[i]+" not in hand "+handtypes[i]})
                return response,end_response
        if(party.turn != player.mtype and cards[1] != 0 and cards[1] > sosOnlineLimits['maxBlockCards']):  #non è il tuo turno e hai giocato una carta scaricabarile
            #print("cards",cards[0]," non è il tuo turno e hai giocato una carta scaricabarile")
            response.update({"status": 2, "message": "Is not your turn and you played a blame action card"})
            return response,end_response
        if(party.turn != player.mtype and cards[1] == 0): #non è il tuo turno e hai giocato una carta semplicemente
            #print("cards",cards[0]," non è il tuo turno e hai giocato una carta semplicemente")
            response.update({"status": 3, "message": "Is not your turn and you played a card whitout a block action card"})
            return response,end_response
        if(party.turn == player.mtype and  cards[1] != 0 and cards[1] < sosOnlineLimits['maxBlockCards']): #è il tuo turno e hai giocato una carta blocca
            #print("cards",cards[0],"è il tuo turno ma hai giocato una carta blocca")
            response.update({"status": 4, "message": "Is your turn and you played a block action card"})
            return response,end_response
        
        if(cards[1] >= sosOnlineLimits['maxBlockCards']):       #se è uno scaricabarile vede se può cambiare il turno
            newTurn = party.changeTurn(others['newTurn'],forbittenPlayers = [1],needToPlay=False)   #vedw se può cambiare il turno ma non lo cambia effettivamente
            #print("newTurn",newTurn)
            if newTurn == -1:
                response.update({"status": 5, "message": "No player with that mtype"})
                return response,end_response
            elif newTurn == -2:
                response.update({"status": 6, "message": "newTurn is not a valid"})
                return response,end_response
            elif newTurn == -3:
                response.update({"status": 7, "message": "Can't pass turn to a forbitten player"})
                return response,end_response
            elif newTurn > 0:
                pass
            else:
                response.update({"status": 8, "message": "Generic error"})
                return response,end_response


        if(needToPlay == True):
            player.play(cards[0],handtypes[0])
            if(cards[1] != 0):
                player.play(cards[1],handtypes[1])
                if(cards[1] >= sosOnlineLimits['maxBlockCards']):      #se è uno scaricabarile
                    if newTurn > 0:
                        for i in range(sosOnlineLimits['maxHintHand'] - len(party.players[player.mtype-1].hands['hint'])):  #pesca hint card fino ad arrivare a maxHintHand
                            party.raw_draw(player.mtype,'hint','hint')
                        newTurn = party.changeTurn(others['newTurn'],[1],needToPlay=needToPlay)        #cambia effettivamente il turno
                        emit('response-turn', {'response': {"status": 0, "message": "Success"},'playerID':player.id,'turn': newTurn}, room=party.partyID)
                        get_inGameCards(party.partyID,player.mtype,player.id)
                if(cards[1] < sosOnlineLimits['maxBlockCards']):        #se è una carta blocco
                    party.raw_draw(player.mtype,'action','action')

                    
        response.update({"status": 0, "message": "Success"})
        #print("response",response)

        return response,end_response
    
    elif(handtypes[0] == "wl"):     #se è una carta occhiataccia
        victim = party.get_player(others['victim'])
        if(victim == None):
            response.update({"status": 5, "message": "No player with that mtype"})
            return response,end_response

        if(player.mtype != 1):
            response.update({"status": 9, "message": "You are not the overlord"})
            return response,end_response
        
        elif(victim.mtype == 1):
            response.update({"status": 10, "message": "You can't launch Withering Looks to yourself"})
            return response,end_response
        elif(victim.mtype == 0 or victim.mtype > len(party.players)):
            response.update({"status": 5, "message": "No player with that mtype"})
            return response,end_response
        elif(victim.points >= cards[0]):
            response.update({"status": 11, "message": "You can't launch Withering Looks to that player bacause he has more Withering Looks than the card"})
            return response,end_response
        elif(cards[0] < 1 or cards[0] > 3):
            response.update({"status": 12, "message": "The card is not valid"})
            return response,end_response


        victim.points = cards[0]

        for player in party.players:
            player.components['noisePoints'] += 1           #tutti i giocatori ottengono un punto rumore
            if(player.mtype == 1):
                player.components['noisePoints'] += 1       #l'overlord ottiene 1 punto rumore aggiuntivo
            if(player.mtype == victim.mtype):               
                player.components['noisePoints'] -= 1       #il giocatore bersaglio non ottiene punti rumore
            emit('response-noise', {'playerID':player.id, 'mtype': player.mtype, 'noisePoints': player.components['noisePoints']}, room=party.partyID)
        

        if(victim.points >= 3):
            end_response = end(player.mtype,party.partyID)

        response.update({"status": 0, "message": "Success"})
        return response,end_response


def end(loser,partyID):
    partyManager.get_party(partyID).status = 'End'
    return {'loser': loser}

def join(partyID,playername):
    #with open('server/static/SosOnline/SosOnlineLimits.json', 'r') as f:
    #    sosOnlineLimits = load(f)
    
    if partyManager.get_party(partyID) is None:
        return "sorry no party found"
    if playername:

        player = Player(playername,partyManager.get_party(partyID),{'hint': sosOnlineLimits['maxHintHand'], 'action': sosOnlineLimits['maxActionHand']})
        player.components['noisePoints'] = 5

        response = {
            'partyID': partyID,
            'mtype': partyManager.get_party(partyID).join(player),
            'playerID': player.id
        }
        
        #print("player",partyManager.get_party(partyID).get_player(response['mtype']).to_dict())
        return jsonify(response)
    else:
        return "no player name provided"
    


def host(test=False):
    #with open('server/static/SosOnline/SosOnlineLimits.json', 'r') as f:
    #    sosOnlineLimits = load(f)

    partyID = Party.create_party('SosOnline',test=test)
    partyManager.get_party(partyID).add_deck(Deck(sosOnlineLimits['maxHintCards']),'hint')
    partyManager.get_party(partyID).add_deck(Deck(sosOnlineLimits['maxActionCards']),'action')
    with open('server/static/server_stats.json', 'r') as f:
        data = load(f)
    partyManager.get_party(partyID).homeLink = data['domain'] + '/SosOnline'
    #partyManager.get_party(partyID).add_deck(Deck(3),'wl')
    
    player = Player(request.get_json().get('player'),partyManager.get_party(partyID),{'hint': sosOnlineLimits['maxHintHand'], 'action': sosOnlineLimits['maxActionHand']})
    player.components['noisePoints'] = 10

    response = {
        'partyID': partyID,
        'mtype': partyManager.get_party(partyID).join(player),
        'playerID': player.id
    }

    #print("player",partyManager.get_party(partyID).get_player(response['mtype']).to_dict())
    return jsonify(response)

def change_turn(partyID,playerID,mtype,turn):
    if mtype == 1:
        newTurn = partyManager.get_party(partyID).changeTurn(turn,forbittenPlayers = [1])
        response = Party.verboseErrors(newTurn,'turn')
        emit('response-turn', {'response': response, 'playerID':playerID, 'turn': newTurn, 'requestType' :'changeTurn'}, room=partyID)

def noise(partyID,playerID,mtype,targetPlayer,noiseLevel):
    party = partyManager.get_party(partyID)
    player = party.get_player(mtype)
    if player.components['noisePoints'] < noiseLevel:
        response = {"status": 1, "message": "You don't have enough noisePoints"}
        emit('response-noise', {'response': response, 'playerID':playerID}, room=partyID)
        return
    if targetPlayer < 1 or targetPlayer > len(party.players):
        response = {"status": 2, "message": "Player not found"}
        emit('response-noise', {'response': response, 'playerID':playerID}, room=partyID)
        return
    if player.mtype == targetPlayer:    #non puoi fare rumore a te stesso
        response = {"status": 5, "message": "You can't make noise to yourself"}
        emit('response-noise', {'response': response, 'playerID':playerID}, room=partyID)
        return
    
    if player.components['noisePoints'] >= noiseLevel:
        player.components['noisePoints'] -= noiseLevel
        response = {"status": 0, "message": "Success"}
        emit('response-noise', {'playerID':playerID, 'mtype': mtype, 'noisePoints': player.components['noisePoints']}, room=partyID)
        emit('receive-noise', {'response': response, 'playerID':playerID, 'targetPlayer': targetPlayer, 'noiseLevel': noiseLevel}, room=partyID)

def get_noise(partyID,playerID,mtype):
    #print("get_noise")
    #print("player",partyManager.get_party(partyID).get_player(mtype).to_dict())
    emit('response-noise', {'playerID':playerID, 'mtype': mtype, 'noisePoints': partyManager.get_party(partyID).get_player(mtype).components['noisePoints']}, room=partyID)


def start_game(partyID):
    maxPlayersMtype = 0
    real_mtype = 1

    for player in partyManager.get_party(partyID).players:
        if player.mtype > maxPlayersMtype:
            maxPlayersMtype = player.mtype

    links = [None] * (maxPlayersMtype + 1)
    
    for player in partyManager.get_party(partyID).players:

        if player.mtype == 1:
            links[player.mtype] = '/SosOnline/overlord?partyID='+str(partyID)+'&mtype='+str(real_mtype) + '&playerID=' + str(player.id)
            player.mtype = real_mtype
            real_mtype += 1
            #print(links[player.mtype])
            continue
        links[player.mtype] = '/SosOnline/game?partyID='+str(partyID)+'&mtype='+str(real_mtype) + '&playerID=' + str(player.id)
        player.mtype = real_mtype
        real_mtype += 1
        for i in range(sosOnlineLimits['maxHintHand']):
            partyManager.get_party(partyID).raw_draw(player.mtype,'hint','hint')
        for i in range(sosOnlineLimits['maxActionHand']):
            partyManager.get_party(partyID).raw_draw(player.mtype,'action','action')


    partyManager.get_party(partyID).turn = 2
    partyManager.get_party(partyID).status = 'Game'
    emit('start-game',{'links': links}, room = partyID)


def get_inGameCards(partyID,mtype,playerID,targetPlayer = None,n=1):
    cards = []
    for card in partyManager.get_party(partyID).get_player(mtype).hands['hint'].cards:
        cards.append(card.card)

    for player in partyManager.get_party(partyID).players:
        if player.mtype == mtype:
            continue
        for card in player.hands['hint'].cards:
            cards.append(card.card)

    #cards.extend([card.card for card in partyManager.get_party(partyID).decks['hint'].watchNextCards(3,'card')])
    cards.extend(partyManager.get_party(partyID).decks['hint'].watchNextCards(n * sosOnlineLimits['maxHintHand']))
    #p(cards)
    if(targetPlayer != None):
        emit('response-inGameCards', {'hand': cards, 'playerID':playerID, 'mtype': mtype,'targetPlayer':playerID}, room=partyID)
    else:
        emit('response-inGameCards', {'hand': cards, 'playerID':playerID, 'mtype': mtype}, room=partyID)