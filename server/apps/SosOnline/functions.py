from json import load
from flask_socketio import emit
from flask import jsonify, request
from global_vars import partyManager
from server.classes import Deck, Party, Player

def hello():
    print("\n\n\n\nHello, World!\n\n\n")
    return "Hello, World!"

def play_card(cards,handtypes,player,party,others=None,needToPlay=True):
    response = {"status": -1,"message": ""}
    newTurn = -1
    end_response = None
    if(handtypes[0] != "wl"):     #se non è una carta occhiataccia
        with open('server/static/SosOnline/SosOnlineLimits.json', 'r') as f:
            sosOnlineLimits = load(f)
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
        
        if(victim.points >= 3):
            end_response = end(player.mtype,party.partyID)

        response.update({"status": 0, "message": "Success"})
        return response,end_response


def end(loser,partyID):
    return {'loser': loser}


def host(test=False):
    with open('server/static/SosOnline/SosOnlineLimits.json', 'r') as f:
        sosOnlineLimits = load(f)

    partyID = Party.create_party('SosOnline',test=test)
    partyManager.get_party(partyID).add_deck(Deck(sosOnlineLimits['maxHintCards']),'hint')
    partyManager.get_party(partyID).add_deck(Deck(sosOnlineLimits['maxActionCards']),'action')
    #partyManager.get_party(partyID).add_deck(Deck(3),'wl')
    
    player = Player(request.get_json().get('player'),partyManager.get_party(partyID),{'hint': sosOnlineLimits['maxHintHand'], 'action': sosOnlineLimits['maxActionHand']})
    
    response = {
        'partyID': partyID,
        'mtype': partyManager.get_party(partyID).join(player),
        'playerID': player.id
    }

    return jsonify(response)