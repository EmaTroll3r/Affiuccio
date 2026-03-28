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

        old_player = None
        for player in partyManager.get_party(partyID).players:
            if player.name == playername:
                old_player = player
                break
        
        if old_player:
            mtype = old_player.mtype
            playerID = old_player.id
            page = 'game' if partyManager.get_party(partyID).status == 'Game' else 'lobby'
        else:
            player = Player(playername,partyManager.get_party(partyID),{'hand': limits['maxHand']})
            player.components['noisePoints'] = limits['noiseForClients']
            
            mtype = partyManager.get_party(partyID).join(player)
            playerID = player.id
            page = 'lobby'

        response = {
            'partyID': partyID,
            'mtype': mtype,
            'playerID': playerID,
            'page': page
        }
        
        return jsonify(response)
    else:
        return "no player name provided"
    


def host(test=False):

    partyID = Party.create_party('TheMind',test=test)
    party = partyManager.get_party(partyID)
    party.add_deck(Deck(limits['maxCards']),'deck')

    copyDeck = Deck(limits['maxCards'])
    copyDeck.copy_from(party.decks['deck'])
    copyDeck.shuffle()
    party.add_deck(copyDeck,'copyDeck')

    party.add_deck(Pile(),'gamePile')
    party.setVariable('lives', limits['starting_lives'])
    party.setVariable('shurikens', limits['starting_shurikens'])
    party.setVariable('level', 1)
    party.setVariable('shurikenVotes', {})

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


def start_game(partyID, settings=None):
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
            response.update({"status": 1, "message": "card " + str(cards[i]) + " not in hand " + str(handtypes[i])})
            return response,end_response
    
    if(needToPlay == True):
        player.play(card,handtype)
        party.decks['gamePile'].addCard(card)
        higher_cards = {}
        left_lives = 0
        cards_in_game = 0          
        print("\n\n\n")
        for p in party.players:
            higher_cards[p.name] = []
            for c in p.hands[handtype].cards[:]:
                cards_in_game += 1
                if card > c.card:
                    higher_cards[p.name].append(c)
                    p.hands[handtype].removeCard(c)
                    left_lives += 1   
            if len(higher_cards[p.name]) == 0:
                del higher_cards[p.name]    

        # print("\n\n\nPlayed card: " + str(card) + "\ncards_in_game: " + str(cards_in_game) + "\nLeft lives to lose: " + str(left_lives) + "\n\n\n")

        party.setVariable('lives', party.getVariable('lives') - left_lives)
        if left_lives > 0:
            if limits['difficulty'] == 'normal':
                left_lives = 1
            notifyLeftLives(party.partyID, left_lives, higher_cards, card)

        if party.getVariable('lives') <= 0:
            end_response = end(0, party.partyID)
        elif cards_in_game == 0:
            next_level(party.partyID)

    response.update({"status": 0, "message": "Success"})
    
    return response,end_response


def get_inGameCards(partyID,mtype,playerID,targetPlayer = None,n=1, ShuffleCopyDeck = False):

    
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


    # also add cards already played
    for card in partyManager.get_party(partyID).decks['gamePile'].cards:
        cards.append(card)


    if ShuffleCopyDeck:
        partyManager.get_party(partyID).decks['copyDeck'].shuffle()
    cards.extend(partyManager.get_party(partyID).decks['copyDeck'].watchNextCards(n * len(partyManager.get_party(partyID).players)))
    # print("\n\n\nplayers " + str(len(partyManager.get_party(partyID).players)) + "n" + str(n) + " loading..." + str(cards) + "\n\n\n")

    # print("\n\n\nCards in game: " + str(cards) + "\n\n\n")
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


def notifyLeftLives(partyID, left_lives, higher_cards, played_card):
    party = partyManager.get_party(partyID)
    lives = party.getVariable('lives')
    message = "The team lost " + str(left_lives) + " lives. Only " + str(lives) + " lives remain.<br><br>The higher cards were:<br>"
    for name, cards in higher_cards.items():
        message += "<br>Player " + str(name) + " has " + ", ".join(str(c.card) for c in cards) + " left in hand."

    handsTracker = calc_updated_hands_tracker(partyID)    

    emit('notify-left-lives', {'leftLives': left_lives, 'lives': lives, 'playedCard': played_card, 'handsTracker': handsTracker, 'message': message}, room=partyID)


def received_left_lives(partyID, playerID, mtype):
    party = partyManager.get_party(partyID)

    cards_in_hands = 0
    for player in party.players:
        cards_in_hands += len(player.hands['hand'])

    if cards_in_hands == 0:
        next_level(partyID)


def get_gamePile(partyID, playerID, mtype):
    pile_cards = []
    for card in partyManager.get_party(partyID).decks['gamePile'].cards:
        pile_cards.append(card)
    emit('response-gamePile', {'gamePile': pile_cards, 'targetPlayer': playerID}, room=partyID)


def get_otherInitialInformations(partyID, playerID, mtype):
    party = partyManager.get_party(partyID)
    handsTracker = calc_updated_hands_tracker(partyID)
    emit('response-otherInitialInformations', {'lives': party.getVariable('lives'), 'level': party.getVariable('level'), 'shurikens': party.getVariable('shurikens'), 'handsTracker': handsTracker, 'shurikensOptions': 1, 'targetPlayer': playerID}, room=partyID)


def calc_updated_hands_tracker(partyID):
    party = partyManager.get_party(partyID)
    handsTracker = []
    for player in party.players:
        handsTracker.append({'mtype': player.mtype, 'name': player.name, 'numberOfCardsInHand': len(player.hands['hand'])})
    return handsTracker


def use_shuriken(partyID, playerID, mtype):
    party = partyManager.get_party(partyID)
    if party.getVariable('shurikens') > 0:
        party.setVariable('shurikens', party.getVariable('shurikens') - 1)
        removed_cards = []
        for player in party.players:
            card = player.hands['hand'].getLowestCard()
            if card is not None:
                player.hands['hand'].removeCard(card)
                removed_cards.append(card.card)

        handsTracker = calc_updated_hands_tracker(partyID)

        emit('used-shuriken', {'mtype': mtype, 'playerID': playerID, 'handsTracker': handsTracker, 'shurikens': party.getVariable('shurikens'), 'removedCards': removed_cards}, room=partyID)

        cards_in_game = 0
        for player in party.players:
            cards_in_game += len(player.hands['hand'])
        if cards_in_game == 0:
            next_level(partyID)

    else:
        emit('error', {'mtype': mtype, 'playerID': playerID, 'handsTracker': None, 'shurikens': 0}, room=partyID)


def propose_votation_for_shuriken(partyID, playerID, mtype):
    party = partyManager.get_party(partyID)
    shuriken_votes = {}
    for player in party.players:
        shuriken_votes[player.mtype] = None
    
    shuriken_votes[mtype] = 1
    party.setVariable('shurikenVotes', shuriken_votes)
    emit('vote-for-shuriken', {'mtype': mtype, 'playerID': playerID}, room=partyID)


def shuriken_vote(partyID, playerID, mtype, vote):
    party = partyManager.get_party(partyID)
    shuriken_votes = party.getVariable('shurikenVotes')
    shuriken_votes[mtype] = vote
    party.setVariable('shurikenVotes', shuriken_votes)

    disagree_votes = []
    for current_player_mtype, v in shuriken_votes.items():
        if v is None:
            return
        elif v == 0:
            disagree_votes.append(current_player_mtype)


    if len(disagree_votes) == 0:
        emit('shuriken-votation-result', {'result': 1}, room=partyID)
        use_shuriken(partyID, playerID, mtype)
    else:
        emit('shuriken-votation-result', {'result': 0, 'disagreeVotes': disagree_votes}, room=partyID)      
        

def next_level(partyID):
    party = partyManager.get_party(partyID)

    try:
        maxLevel = limits['maxLevel'+str(len(party.players))+'players'] 
    except KeyError:
        maxLevel = limits['maxLevel4players']

    if party.getVariable('level') >= maxLevel:
        emit('end-game', end(1, party.partyID), room=partyID)
        return
                
    party.setVariable('level', party.getVariable('level') + 1)
    current_level = party.getVariable('level')
    livesOptions = None
    shurikenOptions = None

    if current_level == 2:
        party.setVariable('shurikens', party.getVariable('shurikens') + 1)
        livesOptions = 1
    elif current_level == 3:
        party.setVariable('lives', party.getVariable('lives') + 1)
    elif current_level == 4:
        shurikenOptions = 1
    elif current_level == 5:
        party.setVariable('shurikens', party.getVariable('shurikens') + 1)
        livesOptions = 1
    elif current_level == 6:
        party.setVariable('lives', party.getVariable('lives') + 1)
    elif current_level == 7:
        shurikenOptions = 1
    elif current_level == 8:
        party.setVariable('shurikens', party.getVariable('shurikens') + 1)
        livesOptions = 1
    elif current_level == 9:
        party.setVariable('lives', party.getVariable('lives') + 1)

    if party.getVariable('lives') > limits['maxLives']:
        party.setVariable('lives', limits['maxLives'])
    if party.getVariable('shurikens') > limits['maxShurikens']:
        party.setVariable('shurikens', limits['maxShurikens'])
    



    # party.decks['gamePile'].shuffle_into_deck(party.decks['deck'], shuffle=True)
    # Instead of shuffling the game pile back into the deck, get_inGameCards already function shuffled a copy of the original deck with all cards 
    # In this way we can predict the next cards to be drawn and preload them on the client side to reduce waiting times and improve user experience
    # So we just need to copy the shuffled copyDeck into the game deck and clear the game pile
    party.decks['gamePile'].clear()
    party.decks['deck'].copy_from(party.decks['copyDeck'])

    for p in party.players:
        for i in range(current_level):
            party.raw_draw(p.mtype, handName='hand', deckName='deck')

    # calculate the next cards to be drawn (on next level) for each player and send them to the clients to preload them and reduce waiting times at the start of the next level
    get_inGameCards(partyID, party.players[0].mtype, party.players[0].id, None, n = (current_level + 1), ShuffleCopyDeck = True)

    
    handsTracker = calc_updated_hands_tracker(partyID)

    emit('next-level', {'level': current_level, 'handsTracker': handsTracker, 'livesOptions': livesOptions, 'shurikensOptions': shurikenOptions}, room=partyID)

    return

