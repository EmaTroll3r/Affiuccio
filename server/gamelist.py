import server.apps.TheMind as theMind
import server.apps.SosOnline as sosOnline
from .apps.TheMind import routes as themind_routes
from .apps.SosOnline import routes as sosonline_routes


game_list = {
    'TheMind': theMind,
    'SosOnline': sosOnline
}