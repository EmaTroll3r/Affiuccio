
let timer;
let shackeTimer;

function shakeScreen(time){
    shakeableIndex.classList.add('shake');
    shackeTimer = setTimeout(function() {
        shakeableIndex.classList.remove('shake');
    }, time);
}
function startTimer(){
    clearTimeout(timer);
    shakeableIndex.classList.remove('shake');
    timer = setTimeout(function() {
        shakeScreen(100000);
    }, 12000); // 12000 millisecondi equivalgono a 12 secondi
}

startTimer();

document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        startTimer();
        //console.log("timer resetted")
    }
});