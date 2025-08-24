
from flask import render_template, request

def global_error_handler(e, error_code):
        path = request.path
        print(f'{error_code} error for path: {path}')
        
        if error_code == 404 or error_code == 500:
            if path.startswith('/SosOnline'):
                css_url = 'SosOnline/404.css'
                home_url = '/SosOnline'
                print('Loading SosOnline CSS for 404')
            elif path.startswith('/DBChess'):
                css_url = 'DBChess/404.css'
                home_url = '/DBChess'
                print('Loading DBChess CSS for 404')
            else:
                css_url = 'home/404.css'
                home_url = '/'
                print('Loading default CSS for 404')

        return render_template('home/404.html', css_url=css_url, home_url=home_url), error_code