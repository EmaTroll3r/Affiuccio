from json import load
from flask_socketio import emit
from flask import jsonify, request
from global_vars import partyManager
from server.classes import Deck, Party, Pile, Player
from server.common_functions import common_generate_game_links


with open('server/static/TheMind/TheMindLimits.json', 'r') as f:
    limits = load(f)


# -------------------------------- Common functions --------------------------------
# This function are necessary, if not used can be empty, but they must be present in the code


def create_game(party):
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
    return party


def create_masterPlayer(party, playername):
    player = Player(playername,party,{'hand': limits['maxHand']})
    player.components['noisePoints'] = limits['noiseForHost']

    return player


def create_player(party, playername):
    player = Player(playername,party,{'hand': limits['maxHand']})
    player.components['noisePoints'] = limits['noiseForClients']

    return player


def end(party, outcome):

    # end() function is called when the game ends.
    # It calcs the outcome of the game (win or lose) and creates a message to be displayed to the users at the end of the game. 
    # Then it returns a response containing the outcome and the message, which will be sent to the clients to display the end game screen.
    # end() must also update the party status to 'End' and perform any necessary cleanup or finalization for the game.

    if outcome == 0:
        message = "Game Over! The team lost all their lives. Better luck next time!"
    elif outcome == 1:
        message = "Congratulations! The team successfully completed all the levels and won the game!"
    
    data = {
        'outcome': outcome,
        'message': message
    }

    party.end()
    return data


def generate_game_links(party):

    # generate_game_links() function is called at the start of the game
    # It generates the links for the game, not all players need to have the same page
    # If it happens you can simply call common_generate_game_links(party)

    return common_generate_game_links(party)


def setup_game(party):

    # setup_game() function is called at the start of the game to initialize the game state. 
    # It can perform any necessary setup for the game, such as dealing initial cards to player

    for player in party.players:
        party.raw_draw(player.mtype)

    party.turn = -1


def play_card(party, cards, handtypes, player, options=None, needToPlay=True):

    # play_card must return a response with at least the "status" field, which will be used to determine if the action was successful or if an error occurred. The "message" field can be used to provide additional information about the result of the action, such as error details or success messages. This structure allows for consistent communication between the server and clients regarding the outcome of game actions.
    # play_card can also return end_response (maybe be None if the game hasn't ended), which will be sent to the clients if the game has ended as a result of the action performed in play_card. This end_response can contain information about the outcome of the game, such as whether the players won or lost, and any relevant messages or data to be displayed to the users at the end of the game.

    response = {"status": -1,"message": ""}
    end_response = None
    card = cards[0]
    handtype = handtypes[0]

    for i in range(len(cards)):                 # Checking if the player has cards in his hand
        if cards[i] == 0:                       # The case of multiple cards was used only to generalize, this game involves playing only one card at a time
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
            notifyLeftLives(party.id, left_lives, higher_cards, card)

        if party.getVariable('lives') <= 0:
            end_response = end(party, 0)
        elif cards_in_game == 0:
            next_level(party.id)

    response.update({"status": 0, "message": "Success"})
    
    return response, end_response


def preloadCardsN(party):
    # This function calcs the number of cards (not yet shown in game) that must be preoloaded from client
    return party.getVariable('level') + 1


def preloadCards(party, mtype, playerID, targetPlayer=None, n=1, ShuffleCopyDeck = False):

    # preloadCards used for preloading cards on the client side to reduce waiting times at the start of each level. 
    # It calculates cards that are already in game and the next cards to be drawn for each player and sends them to the clients. 

    cards = []
    cardsInHand = 0
    for card in party.get_player(mtype).hands['hand'].cards:
        cards.append(card.card)
        cardsInHand += 1

    for player in party.players:
        if player.mtype == mtype:
            continue
        for card in player.hands['hand'].cards:
            cards.append(card.card)


    # also add cards already played
    for card in party.decks['gamePile'].cards:
        cards.append(card)


    if ShuffleCopyDeck:
        party.decks['copyDeck'].shuffle()
    cards.extend(party.decks['copyDeck'].watchNextCards(n * len(party.players)))

    return cards, cardsInHand




# ------------------------------- Custom functions --------------------------------
# Custom functions specific for each game



def notifyLeftLives(partyID, left_lives, higher_cards, played_card):
    party = partyManager.get_party(partyID)
    lives = party.getVariable('lives')
    message = "The team lost " + str(left_lives) + " lives. Only " + str(lives) + " lives remain.<br><br>The higher cards were:<br>"
    for name, cards in higher_cards.items():
        message += "<br>Player " + str(name) + " has " + ", ".join(str(c.card) for c in cards) + " left in hand."

    handsTracker = calc_updated_hands_tracker(party)    

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
    handsTracker = calc_updated_hands_tracker(party)
    emit('response-otherInitialInformations', {'lives': party.getVariable('lives'), 'level': party.getVariable('level'), 'shurikens': party.getVariable('shurikens'), 'handsTracker': handsTracker, 'shurikensOptions': 1, 'targetPlayer': playerID}, room=partyID)


def calc_updated_hands_tracker(party):
    handsTracker = []
    for player in party.players:
        handsTracker.append({'mtype': player.mtype, 'name': player.name, 'numberOfCardsInHand': len(player.hands['hand'])})
    return handsTracker


def use_shuriken(partyID, playerID, mtype):
    party = partyManager.get_party(partyID)
    if party.getVariable('shurikens') > 0:
        party.setVariable('shurikens', party.getVariable('shurikens') - 1)
        removed_cards = []
        message = "All players agreed to use a shuriken.<br>Using shuriken...<br><br>"
        for player in party.players:
            card = player.hands['hand'].getLowestCard()
            if card is not None:
                player.hands['hand'].removeCard(card)
                removed_cards.append(card.card)
                message += "Player " + str(player.name) + " removed " + str(card.card) + " from their hand.<br>"

        handsTracker = calc_updated_hands_tracker(party)

        emit('used-shuriken', {'mtype': mtype, 'playerID': playerID, 'handsTracker': handsTracker, 'shurikens': party.getVariable('shurikens'), 'removedCards': removed_cards, 'message': message}, room=partyID)

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
        # emit('shuriken-votation-failed', {'result': 1}, room=partyID)
        use_shuriken(partyID, playerID, mtype)
    else:
        emit('shuriken-votation-failed', {'result': 0, 'disagreeVotes': disagree_votes}, room=partyID)      
        

def next_level(partyID):
    party = partyManager.get_party(partyID)

    try:
        maxLevel = limits['maxLevel'+str(len(party.players))+'players'] 
    except KeyError:
        maxLevel = limits['maxLevel4players']

    if party.getVariable('level') >= maxLevel:
        emit('end-game', end(party, 1), room=partyID)
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
    # Instead of shuffling the game pile back into the deck, preloadCards already function shuffled a copy of the original deck with all cards 
    # In this way we can predict the next cards to be drawn and preload them on the client side to reduce waiting times and improve user experience
    # So we just need to copy the shuffled copyDeck into the game deck and clear the game pile
    party.decks['gamePile'].clear()
    party.decks['deck'].copy_from(party.decks['copyDeck'])

    for p in party.players:
        for i in range(current_level):
            party.raw_draw(p.mtype, handName='hand', deckName='deck')

    # calculate the next cards to be drawn (on next level) for each player and send them to the clients to preload them and reduce waiting times at the start of the next level
    preloadCards(party, party.players[0].mtype, party.players[0].id, None, n = (current_level + 1), ShuffleCopyDeck = True)

    
    handsTracker = calc_updated_hands_tracker(party)

    emit('next-level', {'level': current_level, 'handsTracker': handsTracker, 'livesOptions': livesOptions, 'shurikensOptions': shurikenOptions, 'shuriken': party.getVariable('shurikens'), 'lives': party.getVariable('lives')}, room=partyID)

    return

