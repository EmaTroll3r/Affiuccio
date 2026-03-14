import redis
import json
from time import sleep

r = redis.Redis(host='localhost', port=6379, db=0)

def save_info(info_name, info_data):
    r.set(info_name, json.dumps(info_data))

def get_info(info_name):
    data = r.get(info_name)
    if data:
        return json.loads(data)
    return None

def delete_info(info_name):
    r.delete(info_name)

def set_info_if_not_exists(info_name, info_data):
    """
    Save info_data only if info_name does not already exist.
    Returns True if the key was created, False otherwise.
    """
    return r.setnx(info_name, json.dumps(info_data))

def load_or_create_info(info_name, info_data):
    """
    Load info_data if it exists, otherwise create it.
    Returns the loaded or created data.
    """
    info = get_info(info_name)
    if info is None:
        # try:
        #     info = exec(info_data)
        # except Exception as e:
        #     raise ValueError(f"Error executing info_data: {e}")
        info = info_data
        created = set_info_if_not_exists(info_name, info)
        if created:
            info = get_info(info_name)
            return info
        else:
            # Se un altro worker l'ha creata, aspetta e poi leggi
            for _ in range(10):
                sleep(0.1)
                info = get_info(info_name)
                if info is not None:
                    return info
    else:
        return info
    return None
    
    

# def save_lobby(partyID, lobby_data):
#     # r.set(f"lobby:{partyID}", json.dumps(lobby_data))
#     save_info(f"lobby:{partyID}", json.dumps(lobby_data))

# def get_lobby(partyID):
#     get_info(f"lobby:{partyID}")
#     # data = r.get(f"lobby:{partyID}")
#     # if data:
#     #     return json.loads(data)
#     # return None

# def delete_lobby(partyID):
#     delete_info(f"lobby:{partyID}")
#     # r.delete(f"lobby:{partyID}")