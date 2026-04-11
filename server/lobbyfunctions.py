
from flask_socketio import emit, join_room, leave_room
from global_vars import partyManager

def remove_player_from_lobby(partyID, targetMtype, homeLink):
    party = partyManager.get_party(partyID)
    if(targetMtype != 1):
        party.remove_player(targetMtype)
        response = {"status": 0, "message": "Success"}
    else:
        response = {"status": 1, "message": "Can't remove the host"}
    
    players = party.players
    playerList = [player.to_dict() for player in players]


    emit('kicked-player', {'kickedPlayer':targetMtype,'homeLink':homeLink}, room=party.id)
    emit('playerList', {'playerList': playerList, 'response':response}, room=party.id)


def get_playerList(partyID, playerID, mtype):
    party = partyManager.get_party(partyID)
    playerList = []
    for player in party.players:
        playerList.append({"name": player.name, "mtype": player.mtype, "playerID": player.id, 'points': player.points},)

    emit('response-playerList', {'mtype':mtype, 'partyID':party.id, 'playerID':playerID, 'playerList': playerList}, room=party.id)

def leave_party(partyID, playerID):
    party = partyManager.get_party(partyID)
    if party is None:
        return "sorry no party found"
    
    leave_room(party.id)
    emit('player_left', {'playerID': playerID}, room=party.id)

def get_allPoints(partyID):
    party = partyManager.get_party(partyID)
    points = [None] * (len(party.players) + 1)
    for player in party.players:
        points[player.mtype] = player.points
    emit('response-points', {'points': points}, room=party.id)


def join_to_room(partyID ,playerID, mtype):
    party = partyManager.get_party(partyID)
    if party is None:
        return "sorry no party found"

    join_room(party.id)
    emit('player-joined', {'playerID': playerID, 'partyID': party.id, 'mtype': partyManager.get_player(playerID).mtype, 'playerName': partyManager.get_player(playerID).name}, room=party.id)


def on_ping(playerID):
    if playerID in partyManager.players:
        partyManager.get_player(playerID).active_level = 4



