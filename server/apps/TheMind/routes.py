# from flask import Blueprint, redirect, render_template, request
# from global_vars import partyManager, test, main
from global_vars import socketio
from server.apps import TheMind as theMind


@socketio.on('themind-received-left-lives')
def themind_received_left_lives(data):
    return theMind.received_left_lives(int(data['partyID']),int(data['playerID']),int(data['mtype']))


@socketio.on('themind-get-gamePile')
def themind_get_gamePile(data):
    return theMind.get_gamePile(int(data['partyID']),int(data['playerID']),int(data['mtype']))


@socketio.on('themind-get-otherInitialInformations')
def themind_get_otherInitialInformations(data):
    return theMind.get_otherInitialInformations(int(data['partyID']),int(data['playerID']),int(data['mtype']))
    
@socketio.on('themind-use-shuriken')
def themind_use_shuriken(data):
    return theMind.use_shuriken(int(data['partyID']),int(data['playerID']),int(data['mtype']))

@socketio.on('themind-propose-votation-for-shuriken')
def themind_propose_votation_for_shuriken(data):
    return theMind.propose_votation_for_shuriken(int(data['partyID']),int(data['playerID']),int(data['mtype']))

@socketio.on('themind-shuriken-vote')
def themind_shuriken_vote(data):
    return theMind.shuriken_vote(int(data['partyID']),int(data['playerID']),int(data['mtype']),int(data['vote']))

#-------------------------------------------------------------------------------------------




