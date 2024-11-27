from flask import Blueprint, render_template, request
from global_vars import partyManager,socketio, test
#from server.apps import SosOnline as sosOnline
#from json import load

syncwatch = Blueprint('syncwatch', __name__)


@syncwatch.route('/create-party', methods=['GET'])
def syncwatch_create_party():
    partyID = partyManager.create_party()
    return partyID