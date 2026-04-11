

def common_generate_game_links(party):
    maxPlayersMtype = 0
    real_mtype = 1

    # Assigns real mptypes in order and creates new page links for each player based on their original mtype and partyID
    for player in party.players:
        if player.mtype > maxPlayersMtype:
            maxPlayersMtype = player.mtype

    links = [None] * (maxPlayersMtype + 1)
    
    for player in party.players:

        links[player.mtype] = '/'+ party.gameEndpoint +'/game?partyID=' + str(party.id) + '&mtype=' + str(real_mtype) + '&playerID=' + str(player.id)
        player.mtype = real_mtype
        real_mtype += 1

    return links