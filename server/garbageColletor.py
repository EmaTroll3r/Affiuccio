from global_vars import partyManager
from threading import Timer
from global_vars import test

if test:
    partyRemoverTime = 5        #seconds
    playerRemoverTime = 10      #seconds
else:
    partyRemoverTime = 604800      #seconds
    playerRemoverTime = 86400     #seconds


def p(*args):
    print("\n\n\n",*args,"\n\n\n")

def garbageCollector():
    partyRemover()
    playerRemover()


def partyRemover():
    party_keys = list(partyManager.parties.keys())

    for party_key in party_keys:
        party = partyManager.parties[party_key]
        if test:
            if tryRemoveParty(party):
                print(f"Party {party.partyID} removed")
            else:
                print("Party",party.partyID,"not removed")
        else:
            tryRemoveParty(party)

    Timer(partyRemoverTime, partyRemover).start()


def tryRemoveParty(party):
    for player in party.players:
        if player.is_active():
            return False
    print("Deleting party ",party.partyID," succeeded")
    partyManager.remove_party(party.partyID)
    return True

def playerRemover():
    for party in partyManager.parties.values():
        for player in party.players:
            player.active_level -= 1
            if test:
                print("Player ",player.name,"  -->  ",player.active_level)

    Timer(playerRemoverTime, playerRemover).start()

