from json import load
from flask_socketio import emit
from flask import jsonify, request
from global_vars import partyManager
from server.classes import Deck, Party, Player
from random import randrange


with open('server/static/SosOnline/SosOnlineLimits.json', 'r') as f:
    limits = load(f)


# -------------------------------- Common functions --------------------------------
# This function are necessary, if not used can be empty, but they must be present in the code



def create_game(party):
    party.add_deck(Deck(limits['maxHintCards']),'hint')
    party.add_deck(Deck(limits['maxActionCards']),'action')


def create_masterPlayer(party, playername):
    player = Player(playername,party,{'hint': limits['maxHintHand'], 'action': limits['maxActionHand']})
    player.components['noisePoints'] = 10

    return player


def create_player(party, playername):
    player = Player(playername,party,{'hint': limits['maxHintHand'], 'action': limits['maxActionHand']})
    player.components['noisePoints'] = 5

    return player


def end(party, loser):
    
    # end() function is called when the game ends.
    # It calcs the outcome of the game (win or lose) and creates a message to be displayed to the users at the end of the game. 
    # Then it returns a response containing the outcome and the message, which will be sent to the clients to display the end game screen.
    # end() must also update the party status to 'End' and perform any necessary cleanup or finalization for the game.

    party.end()
    return {'loser': loser}


def generate_game_links(party):

    # generate_game_links() function is called at the start of the game
    # It generates the links for the game, not all players need to have the same page
    # If it happens you can simply call common_generate_game_links(party)

    maxPlayersMtype = 0
    real_mtype = 1

    for player in party.players:
        if player.mtype > maxPlayersMtype:
            maxPlayersMtype = player.mtype

    links = [None] * (maxPlayersMtype + 1)
    
    for player in party.players:

        if player.mtype == 1:
            links[player.mtype] = '/SosOnline/overlord?partyID='+str(party.id)+'&mtype='+str(real_mtype) + '&playerID=' + str(player.id)
            player.mtype = real_mtype
            real_mtype += 1
            #print(links[player.mtype])
            continue
        links[player.mtype] = '/SosOnline/game?partyID='+str(party.id)+'&mtype='+str(real_mtype) + '&playerID=' + str(player.id)
        player.mtype = real_mtype
        real_mtype += 1

    return links


def setup_game(party):

    # setup_game() function is called at the start of the game to initialize the game state. 
    # It can perform any necessary setup for the game, such as dealing initial cards to player

    for player in party.players:
        if player.mtype == 1:
            continue
        for i in range(limits['maxHintHand']):
            party.raw_draw(player.mtype,'hint','hint')
        
        check = False
        while not check:
            cardNumber = randrange(limits['maxBlockCards'] + 1, limits['maxActionCards'])
            card = party.decks['action'].removeCard(cardNumber)
            if card:
                party.players[player.mtype-1].hands['action'].addCard(card)
                check = True

        for i in range(limits['maxActionHand'] - 1):
            party.raw_draw(player.mtype,'action','action')

    party.turn = 2


def play_card(party, cards, handtypes, player, options=None, needToPlay=True):

    # play_card must return a response with at least the "status" field, which will be used to determine if the action was successful or if an error occurred. The "message" field can be used to provide additional information about the result of the action, such as error details or success messages. This structure allows for consistent communication between the server and clients regarding the outcome of game actions.
    # play_card can also return end_response (maybe be None if the game hasn't ended), which will be sent to the clients if the game has ended as a result of the action performed in play_card. This end_response can contain information about the outcome of the game, such as whether the players won or lost, and any relevant messages or data to be displayed to the users at the end of the game.

    response = {"status": -1,"message": ""}
    newTurn = -1
    end_response = None
    if(handtypes[0] != "wl"):     #if is not a withering looks card
        for i in range(len(cards)):
            if cards[i] == 0:
                continue
            if(not player.can_play(cards[i],handtypes[i])):
                response.update({"status": 1, "message": "card "+cards[i]+" not in hand "+handtypes[i]})
                return response,end_response
        if(party.turn != player.mtype and cards[1] != 0 and cards[1] > limits['maxBlockCards']):  #not your turn and you played a blame action card
            response.update({"status": 2, "message": "Is not your turn and you played a blame action card"})
            return response,end_response
        if(party.turn != player.mtype and cards[1] == 0): #not your turn and you played a card without a block action card
            response.update({"status": 3, "message": "Is not your turn and you played a card without a block action card"})
            return response,end_response
        if(party.turn == player.mtype and  cards[1] != 0 and cards[1] < limits['maxBlockCards']): #is your turn and you played a block action card
            response.update({"status": 4, "message": "Is your turn and you played a block action card"})
            return response,end_response
        
        if(cards[1] >= limits['maxBlockCards']):       #if you played a blame action card you can choose to change the turn
            newTurn = party.changeTurn(options['newTurn'],forbittenPlayers = [1],needToPlay=False)   #check if the new turn is valid, but don't change it yet
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
                if(cards[1] >= limits['maxBlockCards']):      #if you played a blame action card
                    if newTurn > 0:
                        for i in range(limits['maxHintHand'] - len(party.players[player.mtype-1].hands['hint'])):  #draw hint cards until you have max hint hand cards
                            party.raw_draw(player.mtype,'hint','hint')
                        for i in range(limits['maxActionHand'] - len(party.players[player.mtype-1].hands['action'])):  #draw action cards until you have max hint hand cards
                            party.raw_draw(player.mtype,'action','action')
                        newTurn = party.changeTurn(options['newTurn'],[1],needToPlay=needToPlay)        #cambia effettivamente il turno
                        emit('response-turn', {'response': {"status": 0, "message": "Success"},'playerID':player.id,'turn': newTurn}, room=party.id)
                        preloadCards(party,player.mtype,player.id)
                if(cards[1] < limits['maxBlockCards']):        #if it's a block card
                    party.raw_draw(player.mtype,'action','action')

                    
        response.update({"status": 0, "message": "Success"})

        return response,end_response
    
    elif(handtypes[0] == "wl"):     #if it's a withering looks card
        victim = party.get_player(options['victim'])
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
            response.update({"status": 11, "message": "You can't launch Withering Looks to that player because he has more Withering Looks than the card"})
            return response,end_response
        elif(cards[0] < 1 or cards[0] > 3):
            response.update({"status": 12, "message": "The card is not valid"})
            return response,end_response


        victim.points = cards[0]

        for player in party.players:
            player.components['noisePoints'] += 1           #all players get a noise point
            if(player.mtype == 1):
                player.components['noisePoints'] += 1       #the overlord gets an additional noise point
            if(player.mtype == victim.mtype):               
                player.components['noisePoints'] -= 1       #the target player doesn't get noise points
            emit('response-noise', {'playerID':player.id, 'mtype': player.mtype, 'noisePoints': player.components['noisePoints']}, room=party.id)
        

        if(victim.points >= 3):
            end_response = end(victim.mtype,party.id)

        response.update({"status": 0, "message": "Success"})
        return response, end_response


def preloadCardsN(party):
    # This function calcs the number of cards (not yet shown in game) that must be preoloaded from client
    return 3


def preloadCards(party, mtype, playerID, targetPlayer=None, n=1, ShuffleCopyDeck = False):

    # preloadCards used for preloading cards on the client side to reduce waiting times at the start of each level. 
    # It calculates cards that are already in game and the next cards to be drawn for each player and sends them to the clients. 

    cards = []
    cardsInHand = 0         #not used in this game, but it can be useful in other games to decide how many cards to show to the user in the preloaded cards
    for card in party.get_player(mtype).hands['hint'].cards:
        cards.append(card.card)
        cardsInHand += 1

    for player in party.players:
        if player.mtype == mtype:
            continue
        for card in player.hands['hint'].cards:
            cards.append(card.card)

    cards.extend(party.decks['hint'].watchNextCards(n * limits['maxHintHand']))
    return cards, cardsInHand



# ------------------------------- Custom functions --------------------------------
# Custom functions specific for each game

def change_turn(party,playerID,mtype,newTurn):
    if mtype == 1:
        newTurn = party.changeTurn(newTurn,forbittenPlayers = [1])
        response = Party.verboseErrors(newTurn,'turn')
        emit('response-turn', {'response': response, 'playerID':playerID, 'turn': newTurn, 'requestType' :'changeTurn'}, room=party.id)



# def host(game_name, test=False):

#     partyID = Party.create_party(game_name,test=test)
    
#     with open('server/static/server_stats.json', 'r') as f:
#         data = load(f)
#     partyManager.get_party(partyID).homeLink = data['domain'] + '/' + game_name
#     #partyManager.get_party(partyID).add_deck(Deck(3),'wl')
    
#     player = Player(request.get_json().get('player'),partyManager.get_party(partyID),{'hint': limits['maxHintHand'], 'action': limits['maxActionHand']})
#     player.components['noisePoints'] = 10

#     response = {
#         'partyID': partyID,
#         'mtype': partyManager.get_party(partyID).join(player),
#         'playerID': player.id
#     }

#     #print("player",partyManager.get_party(partyID).get_player(response['mtype']).to_dict())
#     return jsonify(response)


# def start_game(partyID, settings):
#     maxPlayersMtype = 0
#     real_mtype = 1

#     for player in partyManager.get_party(partyID).players:
#         if player.mtype > maxPlayersMtype:
#             maxPlayersMtype = player.mtype

#     links = [None] * (maxPlayersMtype + 1)
    
#     for player in partyManager.get_party(partyID).players:

#         if player.mtype == 1:
#             links[player.mtype] = '/SosOnline/overlord?partyID='+str(partyID)+'&mtype='+str(real_mtype) + '&playerID=' + str(player.id)
#             player.mtype = real_mtype
#             real_mtype += 1
#             #print(links[player.mtype])
#             continue
#         links[player.mtype] = '/SosOnline/game?partyID='+str(partyID)+'&mtype='+str(real_mtype) + '&playerID=' + str(player.id)
#         player.mtype = real_mtype
#         real_mtype += 1
#         for i in range(limits['maxHintHand']):
#             partyManager.get_party(partyID).raw_draw(player.mtype,'hint','hint')
        
#         # check = False
#         # while check == False:
#         #     card = partyManager.get_party(partyID).raw_draw(player.mtype,'action','action')
#         #     print("\n\ncard\n\n",card)
#         #     if card.card > limits['maxBlockCards'] and card.card <= limits['maxActionCards']:
#         #         check = True
#         #     else:
#         #         if partyManager.get_party(partyID).players[player.mtype-1].hands['action'].removeCard(card):
#         #             partyManager.get_party(partyID).players[player.mtype-1].hands['action'].addCard(card)
        
#         check = False
#         while not check:
#             cardNumber = randrange(limits['maxBlockCards'] + 1, limits['maxActionCards'])
#             card = partyManager.get_party(partyID).decks['action'].removeCard(cardNumber)
#             if card:
#                 partyManager.get_party(partyID).players[player.mtype-1].hands['action'].addCard(card)
#                 check = True

#         for i in range(limits['maxActionHand'] - 1):
#             partyManager.get_party(partyID).raw_draw(player.mtype,'action','action')


#     partyManager.get_party(partyID).turn = 2
#     partyManager.get_party(partyID).status = 'Game'
#     emit('start-game',{'links': links}, room = partyID)


# def check_atleastone_card_in_hands(cards,hand):
#     for c in hand.cards:
#         if c.card in cards:
#             return True
#     return False
    

