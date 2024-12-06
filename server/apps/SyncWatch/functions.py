
import random

parties = {}

def syncwatch_create_party(url=""):
    while True:
        party_id = random.randint(1000, 9999)
        #party_id = 2
        if party_id not in parties:
            syncwatch_add_party(party_id,url)
        return party_id

def syncwatch_add_party(partyID,url=""):
    #global parties
    parties[partyID] = {"play_pause": 0,"curr_time":0, "play_pause_state": "pause","url": url}
    print("\n\n party added:", partyID,"\n\n")
    return partyID

def syncwatch_add_url(partyID, url):
    parties[partyID]["url"] = url
    return url

def syncwatch_get_current_values(partyID):
    #global pause, next, previous, play
    print(parties[partyID])
    return parties[partyID]

"""
def syncwatch_next(partyID):
    #global parties
    parties[partyID]["next"] += 1
    return parties[partyID]["next"]

def syncwatch_previous(partyID):
    #global previous
    #previous += 1
    parties[partyID]["previous"] += 1
    return parties[partyID]["previous"]
"""

def syncwatch_play_pause(partyID):
    parties[partyID]["play_pause"] += 1
    syncwatch_play_pause_state(partyID)
    return parties[partyID]["play_pause"]

def syncwatch_play_pause_state(partyID):
    if parties[partyID]["play_pause_state"] == "play":
        parties[partyID]["play_pause_state"] = "pause"
    else:
        parties[partyID]["play_pause_state"] = "play"
    return parties[partyID]["play_pause_state"]

def syncwatch_set_time(partyID, time):
    parties[partyID]["curr_time"] = time
    return time