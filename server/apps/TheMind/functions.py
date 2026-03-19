from json import load
from flask_socketio import emit
from flask import jsonify, request
from global_vars import partyManager
from server.classes import Deck, Party, Pile, Player
from time import sleep


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
    party = partyManager.get_party(partyID)
    party.add_deck(Deck(limits['maxCards']),'deck')
    party.add_deck(Pile(),'gamePile')
    party.setVariable('lives', limits['lives'])
    party.setVariable('shurikens', limits['shurikens'])
    party.setVariable('level', 1)

    print("\n\n\nCreated Deck with "+str(limits['maxCards'])+ " cards\n" + str(party.decks['deck'].cards)+ "\n\n\n")

    with open('server/static/server_stats.json', 'r') as f:
        data = load(f)
    party.homeLink = data['domain'] + '/TheMind'
    
    player = Player(request.get_json().get('player'),party,{'hand': limits['maxHand']})
    player.components['noisePoints'] = limits['noiseForHost']

    response = {
        'partyID': partyID,
        'mtype': party.join(player),
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


def play_card(cards,handtypes,player,party,options=None,needToPlay=True):
    response = {"status": -1,"message": ""}
    end_response = None
    card = cards[0]
    handtype = handtypes[0]

    for i in range(len(cards)):                 #viene controllato se il giocatore abbia le carte in mano
        if cards[i] == 0:                       #è stato usato il caso di più carte solo per generalizzare, questo gioco prevede di giocare una sola carta per volta
            continue
        if(not player.can_play(cards[i],handtypes[i])):
            response.update({"status": 1, "message": "card " + cards[i] + " not in hand " + handtypes[i]})
            return response,end_response
    
    if(needToPlay == True):
        player.play(card,handtype)
        party.decks['gamePile'].addCard(card)
        higher_cards = {}
        left_lives = 0
        cards_in_game = 0
        for p in party.players:
            higher_cards[p.name] = []              
            for c in p.hands[handtype].cards:
                cards_in_game += 1
                if card > c.card:
                    higher_cards[p.name].append(c)
                    left_lives += 1        

        print("\n\n\nPlayed card: " + str(card) + "\ncards_in_game: " + str(cards_in_game) + "\nLeft lives to lose: " + str(left_lives) + "\n\n\n")

        party.setVariable('lives', party.getVariable('lives') - left_lives)
        if left_lives > 0:
            if limits['difficulty'] == 'normal':
                left_lives = 1
            notifyLeftLives(party.partyID, left_lives, higher_cards)

        if party.getVariable('lives') <= 0:
            end_response = end(0, party.partyID)
        elif cards_in_game == 0:
            if party.getVariable('level') >= limits['maxLevel']:
                end_response = end(1, party.partyID)
            else:
                next_level(party.partyID)

    response.update({"status": 0, "message": "Success"})
    
    return response,end_response

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

    # cards.extend(partyManager.get_party(partyID).decks['deck'].watchNextCards(n * len(partyManager.get_party(partyID).players)))
    # print("\n\n\nplayers " + str(len(partyManager.get_party(partyID).players)) + "n" + str(n) + " loading..." + str(cards) + "\n\n\n")


    if(targetPlayer != None):
        emit('response-inGameCards', {'hand': cards, 'playerID':playerID, 'mtype': mtype,'targetPlayer':playerID, 'cardsInHand': cardsInHand}, room=partyID)
    else:
        emit('response-inGameCards', {'hand': cards, 'playerID':playerID, 'mtype': mtype, 'cardsInHand': cardsInHand}, room=partyID)



def get_noise(partyID,playerID,mtype):
    emit('response-noise', {'playerID':playerID, 'mtype': mtype, 'noisePoints': partyManager.get_party(partyID).get_player(mtype).components['noisePoints']}, room=partyID)


def end(outcome, partyID):
    if outcome == 0:
        message = "Game Over! The team lost all their lives. Better luck next time!"
    elif outcome == 1:
        message = "Congratulations! The team successfully completed all the levels and won the game!"
    
    data = {
        'outcome': outcome,
        'message': message
    }

    partyManager.get_party(partyID).end()
    return data


def notifyLeftLives(partyID, left_lives, higher_cards):
    lives = partyManager.get_party(partyID).getVariable('lives')
    message = "The team lost " + str(left_lives) + " lives. Only " + str(lives) + " lives remain.<br>The higher cards were:"
    for name, cards in higher_cards.items():
        message += "<br>Player " + str(name) + " has " + ", ".join(str(c.card) for c in cards) + " left in hand."
    emit('notify-left-lives', {'leftLives': left_lives, 'lives': lives, 'message': message}, room=partyID)


def next_level(partyID):
    party = partyManager.get_party(partyID)
    party.setVariable('level', party.getVariable('level') + 1)
    current_level = party.getVariable('level')

    party.decks['gamePile'].shuffle_into_deck(party.decks['deck'], shuffle=True)

    for p in party.players:
        for i in range(current_level):
            party.raw_draw(p.mtype, handName='hand', deckName='deck')

    if current_level != limits['maxLevel']:
        get_inGameCards(party.partyID,1,1,n=current_level + 1)

    print("\n\n\nStarting level " + str(current_level) + "\n\n\n")
    emit('next-level', {'level': current_level}, room=partyID)