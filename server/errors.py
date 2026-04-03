
from flask import render_template, request
from jinja2.exceptions import TemplateNotFound
from .mainroutes import game_list

def global_error_handler(e, error_code):
        path = request.path
        print(f'{error_code} error for path: {path}')
        
        if error_code == 404 or error_code == 500:

            game_path = path.strip('/').split('/')
            if game_path and game_path[0]:
                game_name = game_path[0]
                if game_name in game_list:
                    try:
                        return render_template(f'{game_name}/404.html'), error_code
                    except TemplateNotFound:
                        return render_template('home/404.html'), error_code

            elif path.startswith('/DBChess'):
                print('Loading DBChess CSS for 404')
                return render_template('DBChess/404.html'), error_code

            print('Loading default CSS for 404')
            return render_template('home/404.html'), error_code

        return render_template('home/404.html'), 500
