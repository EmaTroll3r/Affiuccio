from flask import Flask, render_template, request
import json
from subprocess import run
from os import getcwd, chdir


def kill_process(process_name):
    # Ottieni i PID dei processi
    pids = run(['pgrep', '-f', process_name], capture_output=True, text=True).stdout.splitlines()
    
    # Prendi solo il primo PID
    if pids and pids[0]:
        run(['kill', pids[0]])


def run_shell_script(path, script):
    # Salva la cartella corrente
    current_dir = getcwd()

    # Cambia la cartella corrente
    chdir(path)

    # Esegui lo script
    run(['./' + script])

    # Ritorna alla cartella corrente
    chdir(current_dir)


app = Flask(__name__)
password = 'alfioo'

@app.route('/manager')
def home():
    return render_template('manager_home.html')


@app.route('/manager/password', methods=['POST'])
def restart():
    data = request.get_json()
    clientPassword = data.get('password')

    if clientPassword == password:
        response = {
            "message": "Password corretta",
            "status": "ok"
        }
        
    else:
        response = {
            "message": "Password errata",
            "status": "error"
        }
    return json.dumps(response), 200


@app.route('/manager/restart', methods=['POST'])
def restart():
    data = request.get_json()
    clientPassword = data.get('password')
    confirm = data.get('confirm')    
    
    if clientPassword == password:
        kill_process('run.py')
        run_shell_script('/home/ubuntu/', 'run.sh')
        response = {
            "message": "Server riavviato",
            "status": "ok"
        }
    else:
        response = {
            "message": "Password errata",
            "status": "error"
        }
    return json.dumps(response), 200

if __name__ == '__main__':
    app.run(port=5000)
