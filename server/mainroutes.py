from flask import jsonify, render_template, request
from flask_socketio import join_room, leave_room,emit
import server.apps.SosOnline as sosOnline
from global_vars import main, partyManager,socketio, test
#from .classes import Deck, Party, Player

#    -----------------------------------------------------------------------------
#   |                                                                             |
#   |   Quando si creano nuovi giochi aggiungere un if in play_card_endpoint()    |
#   |           e in draw() con lo specifico endpoint del gioco                   |
#   |                                                                             |
#    -----------------------------------------------------------------------------


def p(*args):
    print("\n\n\n",*args,"\n\n\n")

"""
def play_card(cards,handtypes,player,party,others=None,needToPlay=True):
    response = {"status": -1,"message": ""}
    newTurn = -1
    if(party.gameEndpoint == 'SosOnline'):
        if(handtypes[0] != "wl"):     #se non è una carta occhiataccia
            with open('server/static/SosOnline/SosOnlineLimits.json', 'r') as f:
                sosOnlineLimits = json.load(f)
            for i in range(len(cards)):
                if cards[i] == 0:
                    continue
                if(not player.can_play(cards[i],handtypes[i])):
                    #print("cards",cards[i],"not in hand",handtypes[i])
                    response.update({"status": 1, "message": "card "+cards[i]+" not in hand "+handtypes[i]})
                    return response
            if(party.turn != player.mtype and cards[1] != 0 and cards[1] > sosOnlineLimits['maxBlockCards']):  #non è il tuo turno e hai giocato una carta scaricabarile
                #print("cards",cards[0]," non è il tuo turno e hai giocato una carta scaricabarile")
                response.update({"status": 2, "message": "Is not your turn and you played a blame action card"})
                return response
            if(party.turn != player.mtype and cards[1] == 0): #non è il tuo turno e hai giocato una carta semplicemente
                #print("cards",cards[0]," non è il tuo turno e hai giocato una carta semplicemente")
                response.update({"status": 3, "message": "Is not your turn and you played a card whitout a block action card"})
                return response
            if(party.turn == player.mtype and  cards[1] != 0 and cards[1] < sosOnlineLimits['maxBlockCards']): #è il tuo turno e hai giocato una carta blocca
                #print("cards",cards[0],"è il tuo turno ma hai giocato una carta blocca")
                response.update({"status": 4, "message": "Is your turn and you played a block action card"})
                return response
            
            if(cards[1] >= sosOnlineLimits['maxBlockCards']):       #se è uno scaricabarile vede se può cambiare il turno
                newTurn = party.changeTurn(others['newTurn'],[1],needToPlay=False)   #vedw se può cambiare il turno ma non lo cambia effettivamente
                #print("newTurn",newTurn)
                if newTurn == -1:
                    response.update({"status": 5, "message": "No player with that mtype"})
                    return response
                elif newTurn == -2:
                    response.update({"status": 6, "message": "newTurn is not a valid"})
                    return response
                elif newTurn == -3:
                    response.update({"status": 6, "message": "Can't pass turn to a forbitten player"})
                    return response
                elif newTurn > 0:
                    pass
                else:
                    response.update({"status": 7, "message": "Generic error"})
                    return response


            if(needToPlay == True):
                player.play(cards[0],handtypes[0])
                if(cards[1] != 0):
                    player.play(cards[1],handtypes[1])
                    if(cards[1] >= sosOnlineLimits['maxBlockCards']):      #se è uno scaricabarile
                        if newTurn > 0:
                            for i in range(sosOnlineLimits['maxHintHand'] - len(party.players[player.mtype-1].hands['hint'])):  #pesca hint card fino ad arrivare a maxHintHand
                                party.raw_draw(player.mtype,'hint','hint')
                            newTurn = party.changeTurn(others['newTurn'],[1],needToPlay=True)        #cambia effettivamente il turno
                            emit('response-turn', {'turn': newTurn}, room=party.partyID)
                    if(cards[1] < sosOnlineLimits['maxBlockCards']):        #se è una carta blocco
                        party.raw_draw(player.mtype,'action','action')

                        
            response.update({"status": 0, "message": "Success"})
            return response
        
        elif(handtypes[0] == "wl"):     #se è una carta occhiataccia
            victim = party.players[others['victim']]
            if(player.mtype != 1):
                response.update({"status": 8, "message": "You are not the overlord"})
                return response
            
            elif(victim.mtype == 1):
                response.update({"status": 9, "message": "You can't launch Withering Looks to yourself"})
                return response
            elif(victim.mtype == 0 or victim.mtype > len(party.players)):
                response.update({"status": 5, "message": "No player with that mtype"})
                return response
            elif(victim.points >= cards[0]):
                response.update({"status": 10, "message": "You can't launch Withering Looks to that player bacause he has more Withering Looks than the card"})
                return response
            elif(cards[0] < 1 or cards[0] > 3):
                response.update({"status": 11, "message": "The card is not valid"})
                return response

            victim.points = cards[0]

            response.update({"status": 0, "message": "Success"})
            return response
"""


@socketio.on('ping')
def on_join(data):
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
    emit('player-joined', {'playerID': playerID, 'partyID': partyID, 'mtype': partyManager.get_player(playerID).mtype, 'playerName': partyManager.get_player(playerID).name}, room=partyID)
    




@socketio.on('play-card')
def play_card_endpoint(data):
    partyID = int(data['partyID'])
    mtype = int(data['mtype'])
    cards = data['cards']
    handtypes = data['handtype']
    playerID = int(data['playerID'])
    others = data.get('others', None)
    askHand = data.get('askHand', 1)
    
    #response = play_card(cards,handtypes,partyManager.get_player(playerID),partyManager.get_party(partyID),others=others)
    if(partyManager.get_party(partyID).gameEndpoint == 'SosOnline'):
        response,end_response = sosOnline.play_card(cards,handtypes,partyManager.get_player(playerID),partyManager.get_party(partyID),others=others)
    
    
    if (response['status'] == 0):
        if(askHand == 1):
            for handtype in handtypes:                
                
                hand = partyManager.get_party(partyID).get_player(mtype).hands[handtype].to_dict()
                emit('response-hand', {'playerID': playerID,'handtype':handtype, 'hand': hand}, room=partyID)
                #emit('response-inGameCards', {'hand': [partyManager.get_party(partyID).decks[handtype].watchNextCards().card], 'playerID':playerID, 'mtype': mtype,'playerID':playerID}, room=partyID)
                #emit('response-hand', {'playerID': playerID,'handtype':handtype, 'hand': json.dumps(partyManager.get_party(partyID).players[mtype-1].hands[handtype].to_dict())}, room=partyID)
                #p('response-hand', {'playerID': playerID,'handtype':handtype, 'hand': json.dumps(partyManager.get_party(partyID).players[mtype-1].hands[handtype].to_dict())})

    
    emit('card-played', {'response': response, 'playerID': playerID, 'cards': cards, 'handtype': handtypes, 'partyID':partyID, 'mtype':mtype,'others':others }, room=partyID)

    if(end_response != None):
        emit('game-end', end_response, room=partyID)

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


        if(partyManager.get_party(partyID).gameEndpoint == 'SosOnline'):
            sosOnline.get_inGameCards(partyID,mtype,playerID,n=2)        
        #emit('response-inGameCards', {'hand': partyManager.get_party(partyID).decks[handtype].watchNextCards(2*sosOnlineLimits['watchCards']), 'playerID':playerID, 'mtype': mtype}, room=partyID)

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




@main.route('/')
def home_index():
    return render_template('home/index.html')
    #return main.send_static_file('index.html')

@main.route('/home/playerList', methods=['GET'])
def get_player_list():
    partyID = int(request.args.get('partyID'))
    #print("\n\n\n",partyID,"\n\n\n")
    if partyManager.get_party(partyID) is None:
        return {'message':"sorry no party found", 'status': 1}
    players = partyManager.get_party(partyID).players
    return jsonify([player.to_dict() for player in players])

@main.route('/home/parties')
def get_parties():
    return jsonify(partyManager.get_parties())
