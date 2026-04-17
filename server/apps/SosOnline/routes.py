# from flask import Blueprint
from flask import render_template, request
from global_vars import partyManager, main
from server.apps import SosOnline as sosOnline
from global_vars import socketio



# @socketio.on('sosonline-ask-start-game')
# def sosonline_start_game(data):
#     partyID = int(data['partyID'])
#     sosOnline.start_game(partyID)

# @socketio.on('sosonline-preloadCards')
# def sosonline_preloadCards(data):
#     partyID = int(data['partyID'])
#     mtype = int(data['mtype'])
#     playerID = int(data['playerID'])

#     return sosOnline.preloadCards(partyID,mtype,playerID,playerID,1)

# @socketio.on('sosonline-change-turn')
# def sosonline_change_turn(data):
#     return sosOnline.change_turn(int(data['partyID']),int(data['playerID']),int(data['mtype']),int(data['newTurn']))

# @socketio.on('sosonline-noise')
# def sosonline_noise(data):
#     return sosOnline.noise(int(data['partyID']),int(data['playerID']),int(data['mtype']),int(data['targetPlayer']),int(data['noiseLevel']))

# @socketio.on('sosonline-get-noise')
# def sosonline_get_noise(data):
#     return sosOnline.get_noise(int(data['partyID']),int(data['playerID']),int(data['mtype']))



#-------------------------------------------------------------------------------------------


@main.route('/SosOnline/overlord', methods=['GET'])
def sosonline_overlord():
    mtype = int(request.args.get('mtype'))
    partyID = int(request.args.get('partyID'))
    if partyManager.get_party(partyID) is None:
        return render_template('SosOnline/404.html', game_name='SosOnline')
    return render_template('SosOnline/overlord.html', game_name='SosOnline')




