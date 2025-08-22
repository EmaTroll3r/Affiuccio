from flask import Blueprint, request, render_template, jsonify
import os
import json

#from global_vars import partyManager,socketio, test
#from server.classes import Party
#from json import load

dbchess = Blueprint('dbchess', __name__)


@dbchess.route('/', methods=['GET'])
def dbchess_home():
    return render_template('DBChess/index.html')

@dbchess.route('/folders', methods=['GET'])
def dbchess_folders():
    return render_template('DBChess/folders.html')


# Salva il filesystem in un file locale
@dbchess.route('/save_filesystem', methods=['POST'])
def save_filesystem():
    data = request.get_data(as_text=True)
    if not data:
        return jsonify({'status': 'error', 'message': 'No data received'}), 400
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        save_path = os.path.join(base_dir, '../../static/DBChess/filesystem.txt')
        with open(save_path, 'w', encoding='utf-8') as f:
            f.write(data)
        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@dbchess.route('/get_filesystem', methods=['GET'])
def get_filesystem():
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(base_dir, '../../static/DBChess/filesystem.txt')
        with open(file_path, 'r', encoding='utf-8') as f:
            data = f.read()
        return data, 200, {'Content-Type': 'text/plain; charset=utf-8'}
    except Exception as e:
        return str(e), 500

