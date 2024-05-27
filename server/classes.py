class Card:
    def __init__(self, card):
        self.card = card
        self.playable = True

    def __str__(self):
        return str(self.card)
    
    def __repr__(self):
        return self.__str__()

        
    def play(self):
        if(self.playable):
            self.playable = False
            return True
        else:
            return False
        
class Deck:

    def __init__(self, maxCards, ishand=False):
        self.maxCards = maxCards
        if ishand:
            self.cards = []
        else:
            self.cards = [Card(i) for i in range(1, maxCards)]
        self.shuffle()

    def shuffle(self):
        import random
        random.shuffle(self.cards)

    def draw(self):
        if self.cards:
            return self.cards.pop()
        else:
            return None
        
    def watchNextCards(self,n= 1,mode = 'n'):
        if len(self.cards) >= n and n > 0:
            if(mode == 'n'):
                return [card.card for card in self.cards[-n:][::-1]]        #inverte l'ordine
            elif(mode == 'card'):
                return [card for card in self.cards[-n:][::-1]]             #inverte l'ordine
        return None
    

    def addCard(self, card):
        if len(self.cards) < self.maxCards:
            self.cards.append(card)
            return True
        return False

    def to_dict(self):
        #return {'cards': [card.card for card in self.cards]}
        return [card.card for card in self.cards]

    def __str__(self):
        return str([card.card for card in self.cards])  # Return a list of card numbers

    def __len__(self):
        return len(self.cards)

class Party:

    def __init__(self, partyID,decks,gameEndpoint):
        self.partyID = partyID
        self.decks = decks
        self.players = []
        self.gameEndpoint = gameEndpoint
        self.turn = -1
        self.last_mtype = 0
        self.homeLink = None
        """self.partynamespace = PartyNamespace('/'+str(partyID))
        from global_vars import socketio
        socketio.on_namespace(self.partynamespace)"""
    
    def __init__(self, partyID,gameEndpoint):
        self.partyID = partyID
        self.players = []
        self.decks = {}
        #self.hands = {key: Deck(value) for key, value in maxHandCardDict.items()}
        self.gameEndpoint = gameEndpoint
        self.turn = 0
        self.last_mtype = 0
        self.homeLink = None

    @staticmethod
    def create_party(gameEndpoint,test=False):
        from random import Random
        from global_vars import partyManager

        if(test):
            partyID = 1
            while partyManager.get_party(partyID) is not None:
                partyID += 1
        else:
            partyID = Random().randint(1000, 9999)
            while partyManager.get_party(partyID) is not None:
                partyID = Random().randint(1000, 9999)


        partyManager.add_party(partyID,gameEndpoint)
        return partyID

    def __str__(self):
        return str(self.partyID) + " " + str(self.players)
    
    def pickCard(self,deckNumber=0):
        return self.decks[deckNumber].draw()
    
    def raw_draw(self,mtype,handNumber=0,deckNumber=0):
        
        card = self.pickCard(deckNumber)
        if self.get_player(mtype).hands[handNumber].addCard(card) == True:
            return card
        return None

    def draw(self,mtype,handNumber=0,deckNumber=0):
        if mtype > len(self.players) or mtype <= 0:
            return -2
        if isinstance(handNumber, int):
            if handNumber >= len(self.get_player(mtype).hands) or handNumber < 0:
                return -3
        else:
            if handNumber not in self.get_player(mtype).hands:
                return -3
            
        if isinstance(deckNumber, int):
            if deckNumber >= len(self.decks) or deckNumber < 0:
                return -4
        else:
            if deckNumber not in self.decks:
                return -4

        card = self.raw_draw(mtype,handNumber,deckNumber)
        if card == None:
            return -1
        return card.card

    def to_dict(self):
        return {
            'partyID': self.partyID,
            'players': [str(player) for player in self.players],
            #'deck': str(self.deck)  # Converti l'oggetto Deck in una stringa
        }
    
    def add_deck(self,deck,name):
        self.decks[name] = deck

    def join(self, player):
        
        self.players.append(player)
        
        self.last_mtype += 1
        print("\n\n\n Last mtype",self.last_mtype,"\n\n\n")
        #print("\n\n\n\nJoined",self.last_mtype,"\n\n\n\n")
        #player.mtype = len(self.players)
        player.mtype = self.last_mtype


        """
        from flask_socketio import emit,join_room
        join_room(self.partyID)
        emit('player-joined', {'player': player}, room=str(self.partyID))
        """
        
        return player.mtype

    def get_player(self,mtype):
        try:
            return self.players[mtype-1]
        except:
            return None

    def remove_player(self,mtype):
        self.players.pop(mtype-1)
        if self.turn == mtype-1:
            self.changeTurn()
        return len(self.players)

    def changeTurn(self,newTurn=-1,forbittenPlayers=[],needToPlay=True):
        if newTurn == -1:
            tempTurn = (self.turn + 1) % len(self.players)
            if tempTurn in forbittenPlayers:
                return -3
            if needToPlay:
                self.turn = tempTurn
            return tempTurn
        else:
            if newTurn > len(self.players):
                return -1                       #No player with that mtype
            if newTurn <= 0:    
                return -2                       #newTurn is not a valid
            if newTurn in forbittenPlayers:
                return -3                       #Can't pass turn to a forbitten player
            
            if needToPlay:
                self.turn = newTurn
            return newTurn
    
    @staticmethod
    def verboseErrors(code_error,type):
        if type == 'turn':
            if code_error == -1:
                return {"status": 5, "message": "No player with that mtype"}
            elif code_error == -2:
                return {"status": 6, "message": "newTurn is not a valid"}
            elif code_error == -3:
                return {"status": 7, "message": "Can't pass turn to a forbitten player"}
            elif code_error > 0:
                return {"status": 0, "message": "Success"}
            else:
                return {"status": 8, "message": "Generic error"}
                

class PartyManager:

    def __init__(self):
        self.parties = {}
        self.players = {}

    def add_party(self, partyID,gameEndpoint):
        self.parties[partyID] = Party(partyID,gameEndpoint)
        return self.parties[partyID]

    def get_party(self, partyID):
        try:
            return self.parties[partyID]
        except KeyError:
            return None

    def get_parties(self):
        return {partyID: party.to_dict() for partyID, party in self.parties.items()}
    
    def get_new_player_id(self):
        return len(self.players) + 1
    
    def add_player(self, player):
        self.players[player.get_id()] = player

    def get_player(self,playerID):
        return self.players[playerID]


class Player:
    def __init__(self, name, party, maxHandCardDict):
        from global_vars import partyManager
        self.id = partyManager.get_new_player_id()
        self.mtype = 0
        self.name = name
        self.hands = {key: Deck(value,True) for key, value in maxHandCardDict.items()}
        self.party = party
        self.points = 0
        partyManager.add_player(self)
        
    def get_id(self):
        return self.id

    def __str__(self):
        return self.name + " - " + str(self.hands)

    def to_dict(self):
        return {
            'playerID': self.id,
            'name': self.name,
            'mtype': self.mtype,
            'points': self.points,
            'hands': {key: str(deck) for key, deck in self.hands.items()},
            'party': self.party.to_dict() if self.party else None
        }

    def play(self, card_id, handNumber=0):
        for card in self.hands[handNumber].cards:
            if card.card == card_id:
                self.hands[handNumber].cards.remove(card)
                return True
        return False
    
    def can_play(self,card_id,handNumber=0):
        for card in self.hands[handNumber].cards:
            if card.card == card_id:
                return True
        return False

"""
from flask_socketio import Namespace, emit

class PartyNamespace(Namespace):
    def on_join(self, data):
        print("\n\n\nJoinedssssssssssss","\n\n\n\n")     
        partyID = data['partyID']
        playerID = data['playerID']   

        print("\n\n\nJoined",partyID,"\n\n\n\n")
        emit('player-joined', {'playerID': playerID, 'partyID': partyID, 'mtype': data['mtype']})

    def on_rejoin(self, data):
        emit('rejoined', {'partyID':data['partyID']})

    def on_message(self,message, data):
        emit(message, data, broadcast=True)
"""

    

    