
from flask import render_template, request

def global_error_handler(e, error_code):
        path = request.path
        print(f'{error_code} error for path: {path}')
        
        if error_code == 404 or error_code == 500:
            if path.startswith('/SosOnline'):
                print('Loading SosOnline CSS for 404')
                return render_template('SosOnline/404.html'), error_code
            elif path.startswith('/DBChess'):
                print('Loading DBChess CSS for 404')
                return render_template('DBChess/404.html'), error_code
            else:
                print('Loading default CSS for 404')
                return render_template('home/404.html'), error_code
