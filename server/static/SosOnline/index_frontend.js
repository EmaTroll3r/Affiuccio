
function shakeScreen(time){
    shakeableIndex.classList.add('shake');
    setTimeout(function() {
        shakeableIndex.classList.remove('shake');
    }, time);
}

setTimeout(function() {
    shakeScreen(100000);
}, 12000); // 12000 millisecondi equivalgono a 12 secondi

