class Obj {
    constructor(name, type, preview,content,path,move,other) {
        this.id = Date.now();
        this.name = name;
        this.type = type;
        this.preview = preview || '';
        //this.parent = parent;
        //this.content = content || '<ul type="disc">';
        this.content = content || '';
        //this.contentfolder = [];
        this.path = path;
        this.move = move || '';
        this.other = other || '';
        }
}

class Piece{
    constructor(name, color, position){
        this.id = pieces_id++;
        this.name = name;
        this.color = color;
        this.position = position;
        this.inGame = true;
    }
}

        //  -------- Customizable Settings  -------- //

var defaultFileSystem = [{"id":1706134704175,"name":"White","type":"folder","content":"","path":["root"]},{"id":1706134709399,"name":"Black","type":"folder","content":"","path":["root"]}];
//const dbStructure = `[{"id":1706134704175,"name":"White","type":"folder","content":"","path":["root"]},{"id":1706134709399,"name":"Black","type":"folder","content":"","path":["root"]},{"id":1706277221391,"name":"1.d4","type":"folder","preview":"","content":"","path":["root","Black"]},{"id":1706277237919,"name":"Gambetto Englund","type":"file","preview":"e5","content":"<ul type=\"disc\">e5<br/><ul type=\"disc\"><li>2. dxe5 &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp; Qe7 &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp; //accetta il gambetto -- minacciando Qxe5 e in b4+<br/>3. Nf3  &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp; Nc6 &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp; //difendendo e5 -- attaccando e5<br/>4. Bf4  &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp; Qb4+ &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp; //difendendo e5 --<br/><ul type=\"disc\"><li>5. c3   &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp; Qxb2</li><li>5. Qd2  &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp; Qxb2</li><li>5. Bd2  &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp; Qxb2<br/></li></ul>6. Bc3  &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp; Bb4 &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp; //per mangiare la regina -- inchioda l'alfiere<br/>7. Qd2  &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp; Bxc3 &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp; //difendendo l'alfiere<br/><ul type=\"disc\"><li>8. Nxc3 &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp; Qxa1+<br/><ul type=\"disc\"><li>9. Nb1  &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp; Qxb1+ &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp; //difendendo il re</li><li>9. Qd1  &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp; Qxc3+ &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp; //difendendo il re<br/></li></ul></li><li>8. Qxc3 &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp; Qc1#<br/></ul>","path":["root","Black","1.d4"]}]`;
var backFolderBool = false;
var enableWritingInPathDisplay = true;
const writingBackgroundColor = '#D3D3D3';
const defaultBackgroundColor = '#FFFFFF';
var firstfolderhtmlpage = "/DBChess/";
const dictionaryDigitToChessPiece = {'N':'knight','K':'king','Q':'queen','R':'rook','B':'bishop'}
//const currPage = "file:///C:/Cartella/roba%20di%20ema/scuola/programmazione/Linguaggi/HTML/DBChess/WebSite%20Files/folders";
const currPage = "folders"
var useLocalStorage = false;
var Black = "Black";
var White = "White";
var gistId = '';
var gistToken = '';
var gistFilename = 'dbchess.txt';

        //  -------------------------------------- //



var textarea = null;
var writingActive = false;
var inFile = false;
var pathNameStack = ['root'];
var oppositePathNameStack = pathNameStack;
var selectedObj = null;
var fileSystem = [];
let params = new URLSearchParams(window.location.search);
//let color = params.get('color');
let inputPath = params.get('path');
var oppositeColor;
//var startingInWarning = [];
//var chessBoard = document.getElementById('chessBoard');
var pieces_id = 1;
var chessboardHistory = [];
var incellsOn = [];
var selectedPieceId = null;
var rec = false;
var recMoves = [];
//var rechargedPage = true;

var chessPieces = [
    new Piece('R', 0, 'a1'), new Piece('N', 0, 'b1'), new Piece('B', 0, 'c1'), new Piece('Q', 0, 'd1'), new Piece('K', 0, 'e1'), new Piece('B', 0, 'f1'), new Piece('N', 0, 'g1'), new Piece('R', 0, 'h1'), 
    new Piece('R', 1, 'a8'), new Piece('N', 1, 'b8'), new Piece('B', 1, 'c8'), new Piece('Q', 1, 'd8'), new Piece('K', 1, 'e8'), new Piece('B', 1, 'f8'), new Piece('N', 1, 'g8'), new Piece('R', 1, 'h8'), 
    new Piece('P', 0 ,'a2'), new Piece('P', 0 ,'b2'), new Piece('P', 0 ,'c2'), new Piece('P', 0 ,'d2'), new Piece('P', 0 ,'e2'), new Piece('P', 0 ,'f2'), new Piece('P', 0 ,'g2'), new Piece('P', 0 ,'h2'), 
    new Piece('P', 1 ,'a7'), new Piece('P', 1 ,'b7'), new Piece('P', 1 ,'c7'), new Piece('P', 1 ,'d7'), new Piece('P', 1 ,'e7'), new Piece('P', 1 ,'f7'), new Piece('P', 1 ,'g7'), new Piece('P', 1 ,'h7')
];

//var chessPieces = [new Piece('R', 'w', 'a1'), new Piece('N', 'w', 'b1'), new Piece('B', 'w', 'c1'), new Piece('Q', 'w', 'd1'), new Piece('K', 'w', 'e1'), new Piece('B', 'w', 'f1'), new Piece('N', 'w', 'g1'), new Piece('R', 'w', 'h1'), new Piece('P', 'w', 'a2'), new Piece('P', 'w', 'b2'), new Piece('P', 'w', 'c2'), new Piece('P', 'w', 'd2'), new Piece('P', 'w', 'e2'), new Piece('P', 'w', 'f2'), new Piece('P', 'w', 'g2'), new Piece('P', 'w', 'h2'), new Piece('R', 'b', 'a8'), new Piece('N', 'b', 'b8'), new Piece('B', 'b', 'c8'), new Piece('Q', 'b', 'd8'), new Piece('K', 'b', 'e8'), new Piece('B', 'b', 'f8'), new Piece('N', 'b', 'g8'), new Piece('R', 'b', 'h8'), new Piece('P', 'b', 'a7'), new Piece('P', 'b', 'b7'), new Piece('P', 'b', 'c7'), new Piece('P', 'b', 'd7'), new Piece('P', 'b', 'e7'), new Piece('P', 'b', 'f7'), new Piece('P', 'b', 'g7'), new Piece('P', 'b', 'h7')];


//var endOfLoadFileSystemFunction = loadFileSystemFromServer();

if(inputPath){
    // Dividi il path in base al separatore di directory
    let directories = inputPath.split('-');

    // Naviga attraverso le directory
    directories.forEach(directory => {
        // Aggiungi il nome della directory a pathNameStack
        directory = directory.replace(/O_O_O/g, "O-O-O").replace(/O_O/g, "O-O").replace(/\(.*?\)/g, '');
        pathNameStack.push(directory.trim());
    });

    if(pathNameStack[1] == Black)
        oppositeColor = White;
    else if (pathNameStack[1] == White)
        oppositeColor = Black;

}

if (!inputPath)
    window.location.href = firstfolderhtmlpage;
    
//showChessboard(pathNameStack[1]);

var elements = document.querySelectorAll('.folder-icon, .file-icon');



/*
document.body.addEventListener('dblclick', function(e) {
    var element = e.target;
    if (element.classList.contains('folder-icon') || element.classList.contains('file-icon')) {
        e.preventDefault();
    }
});
//*/

//var n = 0;




//document.getElementById('new-file-context').addEventListener('click', createFile);
document.getElementById('import-file-context').addEventListener('click', importFileContent);
//document.getElementById('get-info').addEventListener('click', getinfo);
document.getElementById('new-suggestion-context').addEventListener('click', function() {
    importSuggestion();
});
document.getElementById('rec').addEventListener('click', registerMoves);
document.getElementById('stop-rec').addEventListener('click', stopRegisterMoves);
/*
document.getElementById('new-suggestion-context').addEventListener('click', function() {
    createFolder(1);
});
*/
document.getElementById('new-link-context').addEventListener('click', function() {
    createFolder(4,prompt("Inserisci il link:"));
});

/*
function getinfo(){
    console.log(fileSystem.find(obj => obj.name === pathNameStack[pathNameStack.length-1] && JSON.stringify(obj.path) === JSON.stringify(pathNameStack.slice(0,pathNameStack.length-1))));

}
*/
function defaultPieces(){
    
}

function registerMoves(){
    document.getElementById('rec').style.display = 'none';
    document.getElementById('stop-rec').style.display = 'block';
    rec = pathNameStack.slice();
    recMoves = [];
}

function stopRegisterMoves(){
    document.getElementById('rec').style.display = 'block';
    document.getElementById('stop-rec').style.display = 'none';
    console.log(recMoves.join('-'));
    if(confirm('Do you want to create ' + recMoves.join('-') + ' ?')){
        importSuggestion(recMoves.join('-'),rec.slice());
    }
    rec = false;
    recMoves = [];
}

function importFileContent() {
    var oldContent = selectedObj.content;
    var newContent = prompt("Incolla qui il contenuto da importare:");
    if(newContent == null || newContent == ""){
        return;
    }
    var confirmSaveOld = confirm("Vuoi salvare il vecchio contenuto negli appunti?");
    if (confirmSaveOld) {
        // Salva il vecchio filesystem negli appunti
        navigator.clipboard.writeText(oldContent).then(function() {
            console.log('Il vecchio contenuto è stato copiato negli appunti');
            showToast('Il vecchio contenuto è stato copiato negli appunti');
        }).catch(function(err) {
            console.error('Errore durante la copia negli appunti: ', err);
        });
    }
    selectedObj.content = newContent;
    saveFileSystemToServer();
    displayFileContent(selectedObj);
}

document.addEventListener('click', hideContextMenu);

document.addEventListener('mousedown', function() {
    incellsOn.forEach(function(pallino) {
        pallino.style.visibility = 'hidden';
    });
});

function hideContextMenu() {
    var contextMenus = document.getElementsByClassName('context-menu');
    for (var i = 0; i < contextMenus.length; i++) {
        contextMenus[i].classList.remove('show');
    };
}


function createFile() {
    const fileName = prompt("Inserisci il nome del file:");
    if(fileName == null || fileName == ""){
        return;
    }
    const previewName = prompt("Inserisci la preview del file:");
    if(previewName == null || previewName == ""){
        return;
    }
    var file = new Obj(fileName, 'file', previewName,'',pathNameStack.slice());
    fileSystem.push(file);
    saveFileSystemToServer();
    displayFileSystem();
}

function createFolder(type = 0,name = null, preview = null, path = pathNameStack.slice(),needToSave = true) {
    if(type === 0){     //normal folder
        if(name === null || name === ""){
            name = prompt("Inserisci il nome della cartella:");
            if(name == null || name == ""){    
                return;
            }
        }
        if(preview === null || preview === "")
            preview = prompt("Inserisci la preview del file:");
        
        content = '';
    }
    
    else if(type === 1){       //suggestion folder
        if(name === null || name === ""){
            name = prompt("Inserisci la mossa suggerita:");
            if(name == null || name == ""){    
                return;
            }
        }
        if(preview === null || preview === "")
            preview = prompt("Inserisci la preview del file:");

        content = 'suggestion';
    }

    if(type === 2){     //normal folder created by importSuggestion
        if(name === null || name === ""){
            throw new Error("createFolder: name is null or empty");
        }        
        content = '';
    }

    else if(type === 3){       //suggestion folder created by importSuggestion
        if(name === null || name === ""){
            throw new Error("createFolder: name is null or empty");
        }
        content = 'suggestion';
    }

    else if(type === 4){       //link folder
        
        console.log("create link");
        if(name === null || name === ""){
            throw new Error("createFolder: name is null or empty");
        }
        content = 'link: ' + convertMoves(name);
        console.log("content",content);
    }



    for (let i = 0; i < fileSystem.length; i++) {
            if (fileSystem[i].name === name && JSON.stringify(fileSystem[i].path) === JSON.stringify(path)) {
            showToast('Un oggetto con lo stesso nome e percorso esiste già.');
            return;
        }
    }
    var folder = new Obj(name, 'folder' ,preview, content ,path);

    fileSystem.push(folder);
    if(needToSave){
        saveFileSystemToServer();
        displayFileSystem();
    }
}

function convertMoves(moves) {
    // Dividi la stringa in pezzi
    let pieces = moves.split(' ');

    // Rimuovi i numeri di mossa
    pieces = pieces.filter(piece => !piece.includes('.'));

    // Unisci i pezzi rimanenti con "-"
    let result = pieces.join('-');

    return result;
}

let moves = "1. e4 e5 2. Nf3";
console.log(convertMoves(moves));  // Stampa: "e4-e5-Nf3"

function addBackButtonIfNecessary() {
    if (!backFolderBool) {
        var backButton = document.createElement('div');
        backButton.id = 'back-button';
        backButton.onclick = goBack;
        backButton.innerHTML = '</br></br>';

        var folderView = document.getElementById('folder-view');
        document.body.insertBefore(backButton, folderView);
        var folderView = document.getElementById('folder-view');
        folderView.style.marginTop = '40px';
        folderView.style.marginLeft = '30px';
        
    }
}

document.getElementById('delete-context').addEventListener('click', deleteObj)
document.getElementById('submenu-export-pgn').addEventListener('click', exportPGN);
document.getElementById('file-export-pgn').addEventListener('click', exportPGN);
//document.getElementById('import-suggestion').addEventListener('click', importSuggestion);
document.getElementById('file-delete-context').addEventListener('click', deleteObj);
document.getElementById('file-rename-context').addEventListener('click', renameObj);
document.getElementById('rename-context').addEventListener('click', renameObj);
document.getElementById('submenu-import-pgn').addEventListener('click', importPGN);


async function getLichessPGN(gameId) {
    const url = `https://lichess.org/game/export/${gameId}?tags=false&clocks=false&evals=false`;
    try {
        const response = await fetch(url);
        var pgn = await response.text();
        pgn = pgn.toString();
        return pgn;
    } catch (error) {
        console.error(error);
    }
}

function importPGN() {
    pgn = prompt("Incolla qui la serie di mosse suggerite:");
    if(pgn == null || pgn == ""){
        return;
    }
    const isAlphanumeric = /^[0-9a-zA-Z]+$/.test(pgn);
    const containsChessMove = /\d+\.\s?[a-h][1-8]/.test(pgn);

    if(pgn.startsWith('https://lichess.org/')){
        getLichessPGN(pgn.split('/')[3]).then(pgn => {
            processPGN(pgn);
        });
    }else if (isAlphanumeric && !containsChessMove) {
        getLichessPGN(pgn).then(pgn => {
            processPGN(pgn);
        });
    } else if (containsChessMove) {
        processPGN(pgn);
    }
}

function processPGN(pgn) {
    pgn = pgn.replace(/ 0-1$/, '').replace(/ 1-0$/, '');
    pgn = pgn.replace(/O-O-O/g, 'O_O_O').replace(/O-O/g, 'O_O');
    pgn = pgn.replace(/\d+\./g, '');
    let pgnArray = pgn.split(' ');
    pgnArray = pgnArray.filter(mossa => mossa !== "");
    pgnArray.unshift("root", pathNameStack[1]);
    //console.log("pathName",pathNameStack);
    //console.log("pgnArray",pgnArray);
    var n=0;
    pgnArray.forEach((obj, index) => {
        //console.log("obj",obj);
        //console.log("pgn[index]",pgnArray.slice(0, index));
        if(fileSystem.find(element => element.name == obj && JSON.stringify(element.path) === JSON.stringify(pgnArray.slice(0, index)))){
            n = index;
        }
    });
    //console.log("n",n);
    //console.log("pgnArray",pgnArray.slice(0, n+1));
    //console.log("pgn",pgn.split(' ')[n+2]);
    showToast("Added from " + pgnArray.slice(2, n+1).join('-') + " <br> First new folder " + pgn.split(' ')[n+2].toString() + " to the database");
    importSuggestion(pgnArray.slice(n+1).join('-'),pgnArray.slice(0, n+1));
    
    //var url = currPage + "?path=" + encodeURIComponent(pgnArray.slice(1,n+1).join('/').replace(/O-O-O/g, "O_O_O").replace(/O-O/g, "O_O").replace(/\//g, '-'));
    //console.log("url",url)

    /*  //non funziona

    console.log("pathNameStack",defaultPieces);
    chessPieces = defaultPieces.slice();
    console.log("pathNameStack",chessPieces);
    showChessboard(pathNameStack[1]);
    prompt("Incolla qui la serie di mosse suggerite:", pgnArray.slice(n+1).join('-'));
    var pathNameStackC = pgnArray.slice(0, n+1);
    console.log("pathNameStack",pathNameStackC);
    if(pathNameStackC.length > 2){
        color = 0;
        pathNameStackC.slice(2).forEach(move => {
            movePiece(convertNotation(move,(color++) % 2),false);
        });
    }
    pathNameStack = pathNameStackC.slice();
    showChessboard(pathNameStack[1]);
    displayFileSystem();
    */
}




function exportPGN() {
    var pgn = '';
    var control = false
    if(selectedObj){
        pathNameStack.push(selectedObj.name);
        control = true;
    }
    pathNameStack.slice(2).forEach((element, index) => {
        //console.log("element",element,index);
        if(index % 2 === 0)
            pgn += (index/2 + 1).toString() + '. ' + element + ' ';
        else
            pgn += element + ' ';
    });
    if(control)
        pathNameStack.pop();
    pgn = pgn.trim();

    navigator.clipboard.writeText(pgn).then(function() {
        console.log('PGN è stato copiato negli appunti');
        showToast('PGN copiato negli appunti');
    }).catch(function(err) {
        console.error('Errore durante la copia negli appunti: ', err);
    });
    //console.log("pgn",pgn);
    return pgn;
}

function importSuggestion(content = null, path = null) {
    //var n=1;
    var preview = null;
    var match = null;
    if (path == null){
        var path = pathNameStack.slice();
    }

    if(path[1] === White){
        var n=path.length+1;
    }else{
        var n=path.length;
    }

    if(content == null){
        console.log("inc")
        content = prompt("Incolla qui la serie di mosse suggerite:");
    }
    if(content == null || content == ""){
        return;
    }
    var contentArray = content.split('-');
    //console.log("contentArray", contentArray);
    contentArray.forEach(obj => {
        try{
            preview = null;
            if(obj.includes('(') && obj.includes(')')){
                match = obj.match(/\(([^)]+)\)/);
                preview = match ? match[1] : '';
                preview = preview.trim();
                obj = obj.replace(/\s*\([^)]*\)\s*/g, '').trim();
            }
            obj = obj.replace(/O_O_O/g, "O-O").replace(/O_O/g, "O-O");
            //console.log("obj", n%2,obj,preview,path);
            createFolder((n%2)+2,obj,preview,path.slice(),false);
            path.push(obj);
            n++;
        }catch(e){
            showToast(e);
        }
    });
    saveFileSystemToServer();
    displayFileSystem();
}

function renameObj() {
    const newName = prompt("Inserisci il nuovo nome:", selectedObj.name);
    if(newName == null || newName == ""){    
        return;
    }
    const oldName = selectedObj.name;
    const oldPath = selectedObj.path.concat(oldName);
    selectedObj.name = newName;
    updatePaths(oldPath, selectedObj.path.concat(newName));
    saveFileSystemToServer();
    displayFileSystem();
}

function updatePaths(oldPath, newPath) {
    fileSystem.forEach(obj => {
        if (isSubPath(oldPath, obj.path)) {
            obj.path = newPath.concat(obj.path.slice(oldPath.length));
        }
    });
}

function deleteObj() {
    if (selectedObj.type === "folder") {
        var folderPath = selectedObj.path.concat(selectedObj.name);
        fileSystem = fileSystem.filter(obj => {
            // Controlla se l'oggetto è la cartella stessa o se è contenuto nella cartella
            return obj !== selectedObj && !isSubPath(folderPath, obj.path);
        });
    } else {
        fileSystem = fileSystem.filter(obj => obj !== selectedObj);
    }
    saveFileSystemToServer();
    displayFileSystem();
}

function isSubPath(parentPath, childPath) {
    if (childPath.length < parentPath.length) {
        return false;
    }
    for (var i = 0; i < parentPath.length; i++) {
        if (parentPath[i] !== childPath[i]) {
            return false;
        }
    }
    return true;
}

function convertTextareaContentToHtml(content) {
    var newContent = '<ul type="disc">';
    stars = 0;
    maxstars = stars;
    try{
        for(let i = 0; i < content.length; i++) {
            if(content[i] === '*'){
                if(content[i+1] === '\n'){
                    newContent += '</li></ul>';
                    i++;
                    if(content[i+1] === '\n'){
                        newContent += '</li><li>';
                        i++;
                    }
                }
                else
                    newContent += '<ul type="disc"><li>';
            }
            else if(content[i] === '\n')
                if(content[i+1] === '\n'){
                    newContent += '</li><li>';
                    i++;
                }
                else
                    newContent += '<br/>';
            else if(content[i] === '@' && content[i+1] === '\n') {
                newContent += '<br>';
                i++;
                if(content[i+1] === '\n'){
                    newContent += '</li><li>';
                    i++;
                }
            }
            else if(content[i] === '\\' && content[i+1] === 't') {
                //newContent += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
                newContent += '&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;';
                i++;
            }
            else
                newContent += content[i];
        }
    }catch(e){
    }
    newContent += '</ul>';
    return newContent;
}

function convertHtmlToTextarea(htmlContent) {
    var textContent = '';
    textContent = htmlContent.replace(/<ul type="disc"><li>/g, '*');
    
    textContent = textContent.replace(/<\/li><\/ul><\/li><li>/g, '*\n\n');

    textContent = textContent.replace(/<br><\/li><li>/g, '@\n\n');
    
    textContent = textContent.replace(/<ul type="disc">/g, '');
    textContent = textContent.replace(/<\/li><li>/g, '\n\n');
    textContent = textContent.replace(/<\/li><\/ul>/g, '*\n');
    textContent = textContent.replace(/<\/ul>/g, '');
    textContent = textContent.replace(/<br\/>/g, '\n');
    textContent = textContent.replace(/<br>/g, '@\n');
    textContent = textContent.replace(/(&ensp;){8}/g, '\\t');
    return textContent;
}

//var a = 'linea0\nlinea0\n*linea1\nlinea1\n*linea2\nlinea2\n*\nlinea1\n*\nlinea0\nlinea0\n*linea1\n\nlinea1\n*\nlinea0\n';
//console.log(convertTextareaContentToHtml(a));

function showFolderContextMenu(x, y) {
    var contextMenu = document.getElementById('file-context-menu');
    //var contextMenu = document.getElementById('folder-context-menu');
    contextMenu.style.top = y + 'px';
    contextMenu.style.left = x + 'px';
    contextMenu.classList.add('show');
}

function showFileContextMenu(x, y) {
    var contextMenu = document.getElementById('file-context-menu');
    contextMenu.style.top = y + 'px';
    contextMenu.style.left = x + 'px';
    contextMenu.classList.add('show');
}

/*
try {
    var advancedContext = document.getElementById('advanced-context');
    var submenu = document.getElementById('advanced-submenu');
    var timeoutId;

    advancedContext.addEventListener('mouseenter', function() {
        clearTimeout(timeoutId); // Annulla qualsiasi timeout esistente
        submenu.style.display = 'block';
        submenu.style.top = advancedContext.offsetTop + 'px'; // Posiziona il sottomenu in corrispondenza della riga "Advanced"
        submenu.style.left = advancedContext.offsetLeft + advancedContext.offsetWidth + 'px'; // Posiziona il sottomenu a destra dell'elemento "Advanced"
    });


    submenu.addEventListener('mouseleave', function() {
        // Inizia un timeout per nascondere il sottomenu
        timeoutId = setTimeout(function() {
            submenu.style.display = 'none';
        }, 100); // Ritardo di 500 millisecondi
    });

    submenu.addEventListener('mouseenter', function() {
        clearTimeout(timeoutId); // Annulla il timeout se il mouse ritorna sul sottomenu
    });

    var submenuItems = submenu.getElementsByTagName('div');

    for (var i = 0; i < submenuItems.length; i++) {
        submenuItems[i].addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f0f0f0'; // Cambia il colore di sfondo quando il mouse entra
        });

        submenuItems[i].addEventListener('mouseleave', function() {
            this.style.backgroundColor = ''; // Rimuove il colore di sfondo quando il mouse esce
        });

        submenuItems[i].addEventListener('click', function() {
            console.log('Hai cliccato su ' + this.textContent); // Stampa il testo dell'elemento cliccato
        });
    }

} catch (error) {
    console.error("Si è verificato un errore: ", error);
}
*/

var advancedContext = document.getElementById('advanced-context');
var submenu = document.getElementById('advanced-submenu');
var parent = advancedContext.offsetParent;
var padding = 10;
var timeoutId;

advancedContext.addEventListener('mouseenter', function() {
    clearTimeout(timeoutId); // Annulla il timeout se esiste
    var position = advancedContext.getBoundingClientRect();
    submenu.style.display = 'block';
    submenu.style.top = (position.top) + 'px';
    submenu.style.left = (position.left + advancedContext.offsetWidth + padding) + 'px';
});

advancedContext.addEventListener('mouseleave', function(e) {
    if (!submenu.contains(e.relatedTarget)) {
        timeoutId = setTimeout(function() {
            submenu.style.display = 'none';
        }, 100); // Imposta un timeout di 100 ms
    }
    document.addEventListener('click', function() {
        submenu.style.display = 'none';
    });
});

submenu.addEventListener('mouseleave', function() {
    timeoutId = setTimeout(function() {
        submenu.style.display = 'none';
    }, 100); // Imposta un timeout di 100 ms
    document.addEventListener('click', function() {
        submenu.style.display = 'none';
    });
});


submenu.addEventListener('mouseenter', function() {
    clearTimeout(timeoutId); // Annulla il timeout se esiste
    submenu.style.display = 'block';
    selectedPieceId = null;

});


document.getElementById('export-structure').addEventListener('click', function() {
    exportStructure();
});

document.getElementById('import-structure').addEventListener('click', function() {
    importStructure();
});

/*
document.getElementById('db-import-structure').addEventListener('click', function() {
    importStructure(dbStructure.slice());
});
*/

function importStructure(structure = null) {
    var oldFileSystemString = JSON.stringify(fileSystem);
    try{
        if (structure)
            var fileSystemString = structure;
        else
            var fileSystemString = prompt("Incolla qui il FileSystemString:");
        if(fileSystemString == null || fileSystemString == ""){
            throw new Error("empty filesystemString");
        }
        var confirmImport = confirm("Sei sicuro di voler sovrascrivere il filesystem corrente?");
        if (confirmImport) {
            var confirmSaveOld = confirm("Vuoi salvare il vecchio filesystem negli appunti?");
            if (confirmSaveOld) {
                // Salva il vecchio filesystem negli appunti
                navigator.clipboard.writeText(oldFileSystemString).then(function() {
                    console.log('Il vecchio FileSystemString è stato copiato negli appunti');
                    showToast('Il vecchio FileSystemString è stato copiato negli appunti');
                }).catch(function(err) {
                    console.error('Errore durante la copia negli appunti: ', err);
                });
            }


            // Sovrascrive il filesystem
            fileSystem = JSON.parse(fileSystemString);
            if(fileSystem.length === 0){
                fileSystem = defaultFileSystem;
            }
            saveFileSystemToServer();
            displayFileSystem();
        }
    }catch(e){
        console.error(e);
        showToast("Errore durante l'importazione");
        fileSystem = JSON.parse(oldFileSystemString);
        showToast("Old filesystem ripristinated");
    }
}

function exportStructure() {
    var fileSystemString = JSON.stringify(fileSystem);

    navigator.clipboard.writeText(fileSystemString).then(function() {
        console.log('FileSystemString è stato copiato negli appunti');
        showToast('FileSystemString è stato copiato negli appunti');
    }).catch(function(err) {
        console.error('Errore durante la copia negli appunti: ', err);
    });
}

function showToast(message) {
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(function() {
        toast.classList.add('visible');
    }, 100);

    setTimeout(function() {
        toast.classList.remove('visible');
        setTimeout(function() {
            document.body.removeChild(toast);
        }, 500);
    }, 3000);
}

function showWritingContextMenu(x, y) {
    var contextMenu = document.getElementById('writing-context-menu');
    contextMenu.style.top = y + 'px';
    contextMenu.style.left = x + 'px';
    contextMenu.classList.add('show');
}


function showInFileContextMenu(x, y) {
    var contextMenu = document.getElementById('in-file-context-menu');
    contextMenu.style.top = y + 'px';
    contextMenu.style.left = x + 'px';
    contextMenu.classList.add('show');
}

function showEmptySpaceContextMenu(x, y) {
    var contextMenu = document.getElementById('empty-space-context-menu');
    contextMenu.style.top = y + 'px';
    contextMenu.style.left = x + 'px';
    contextMenu.classList.add('show');
}


document.getElementById('new-folder-context').addEventListener('click', function() {
    createFolder();
});



document.getElementById('re-preview-context').addEventListener('click', function() {
    changePreview();
});


function changePreview() {
    const newPreview = prompt("Inserisci la nuova preview:", selectedObj.preview);
    if((newPreview == null || newPreview == "") && selectedObj.type === 'file'){    
        return;
    }
    selectedObj.preview = newPreview;
    
    saveFileSystemToServer();
    displayFileSystem();
}


document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    const target = e.target.closest('.file-icon, .folder-icon, .folder-icon-white, .folder-icon-black');    
    hideContextMenu();
    if(pathNameStack.length > 1){
        if (target) {
            //targetName = target.textContent;
            //targetName = target.firstChild.textContent;
            //targetName = target.getElementsByClassName('file-name')[0].textContent;
            var fileNameElement = target.getElementsByClassName('name')[0];
            var targetName;
            if (fileNameElement) {
                targetName = fileNameElement.textContent;
            } else {
                targetName = target.textContent;
            }
            
            if(!isNaN(targetName[0]) && targetName[1] === '.')
                targetName = targetName.slice(3)
            else if(!isNaN(targetName[0]) && !isNaN(targetName[1]) && targetName[2] === '.')
                targetName = targetName.slice(4)
            


            targetPath = JSON.stringify(pathNameStack.slice());

            //console.log("target name", targetName);
            //console.log("target path", targetPath);

            selectedObj = fileSystem.find(obj => obj.name == targetName && JSON.stringify(obj.path) === targetPath);
            
            if (selectedObj) {
                console.log('Object found:', selectedObj);
            } else {
                console.log('Object not found');
                return;
            }
            // Se l'elemento è una cartella o un file, mostra il menu contestuale della cartella
            
            if (selectedObj.type === 'folder') {
                showFolderContextMenu(e.clientX, e.clientY);
            }else if (selectedObj.type === 'file') {
                showFileContextMenu(e.clientX, e.clientY);
            }
            /*
            var contextMenu = document.getElementById('empty-space-context-menu');
            contextMenu.classList.remove('show');

            var folderContextMenu = document.getElementById('in-file-context-menu');
            folderContextMenu.classList.remove('show');
            */
        } else {
            hideContextMenu();
            if (!inFile) {
                // Altrimenti, mostra il menu contestuale per creare nuovi file o cartelle
                showEmptySpaceContextMenu(e.clientX, e.clientY);
                //var folderContextMenu = document.getElementById('in-file-context-menu');
                //folderContextMenu.classList.remove('show');
            }else{
                
                if (writingActive) {
                    showWritingContextMenu(e.clientX, e.clientY);
                }
                else{
                    showInFileContextMenu(e.clientX, e.clientY);
                }
                //var folderContextMenu = document.getElementById('empty-space-context-menu');
                //folderContextMenu.classList.remove('show');
            }

            //var folderContextMenu = document.getElementById('folder-context-menu');
            //folderContextMenu.classList.remove('show');
            
            
            
        }
    }
});





function displayFileSystem() {
    var shownObjs = [];
    history.pushState(null, null, currPage + "?path=" + encodeURIComponent(pathNameStack.slice(1).join('/').replace(/O-O-O/g, "O_O_O").replace(/O-O/g, "O_O").replace(/\//g, '-')));
    displayPath();
    const fileSystemDiv = document.getElementById('folder-view');
    let fragment = document.createDocumentFragment();
    fileSystemDiv.innerHTML = '';
    if(backFolderBool){
        // Se non siamo nella root, aggiungiamo la "backfolder"
        if (pathNameStack.length > 2) {
            const backFolderDiv = document.createElement('div');
            //if ((pathNameStack.length + n) % 2 === 0) {
            if (pathNameStack.length % 2 === 0) {
                backFolderDiv.className = 'back-folder-icon-white';
            }else {
                backFolderDiv.className = 'back-folder-icon-black';
            }

            backFolderDiv.addEventListener('click', () => {
                goBack();
                /*
                pathNameStack.pop();
                displayFileSystem();
                */
            });

            fragment.appendChild(backFolderDiv);
        }
    }else{
            var backButton = document.getElementById('back-button');
            if (pathNameStack.length > 1) {
                backButton.style.display = 'block';
            }else{
                backButton.style.display = 'none';
            }
    }
    calcOppositePathNameStack();
    //console.log("oppositePathNameStack", oppositePathNameStack);
    //console.log("pathNameStack", JSON.stringify(pathNameStack));
    fileSystem.forEach(obj => {
        if (JSON.stringify(obj.path) === JSON.stringify(pathNameStack)) {
            const objDiv = document.createElement('div');
            const nameDiv = document.createElement('div');
            const previewDiv = document.createElement('div');
            previewDiv.textContent = obj.preview || '';

            if(pathNameStack.length % 2 === 0)
                nameDiv.textContent = (pathNameStack.length/2).toString() + '. ' + obj.name;
            else
                nameDiv.textContent = obj.name

            if (obj.type === 'file') {
                objDiv.className = 'file-icon';
                nameDiv.className = 'name file-name';
                
                //const previewDiv = document.createElement('div');
                previewDiv.className = 'file-preview';

                /*
                previewDiv.addEventListener('contextmenu', function(e) {
                    e.stopPropagation();
                });
                */
                //objDiv.appendChild(previewDiv);
                
                objDiv.addEventListener('click', function() {
                    //console.log("is file");
                    inFile = true;
                    selectedObj = obj;
                    pathNameStack.push(obj.name);
                    displayFileContent(obj);
                });

            } else if (obj.type === 'folder') {

                if (obj.content.startsWith('link:')) {
                    let path = obj.content.slice(5).split('-').map(item => item.trim());
                    path.unshift(pathNameStack[1]);
                    path.unshift('root');
                    let namee = path.pop();

                    console.log("path", path);
                    console.log("namee", namee);
                    obj = fileSystem.find(obj => obj.name == namee && JSON.stringify(obj.path) == JSON.stringify(path));
                    //console.log("obj", objj);
                }

                //console.log("pathNameStack.length", pathNameStack.length);


                //if (pathNameStack.length === 1 && (obj.name === 'Bianchi' || obj.name === 'White')) {
                if (pathNameStack.length === 1 && obj.name === White) {
                    //objDiv.className = 'folder-icon-white';
                    objDiv.className = 'folder-special-white';
                    //objDiv.className = 'folder-icon-special-white';
                }
                //else if (pathNameStack.length === 1 && (obj.name === 'Neri' || obj.name === 'Black')) {
                else if (pathNameStack.length === 1 && obj.name === Black) {
                    //objDiv.className = 'folder-icon-black';
                    objDiv.className = 'folder-special-black';
                    //objDiv.className = 'folder-icon-special-black';
                }else{
                    /*
                    //if ((pathNameStack.length + n) % 2 === 0) {
                    if (pathNameStack.length % 2 === 0) {
                        if (obj.content === 'suggestion')
                            objDiv.className = 'folder-icon-white suggestion-icon-white';
                        else
                            objDiv.className = 'folder-icon-white';
                    }else {
                        if (obj.content === 'suggestion')
                            objDiv.className += 'folder-icon-black suggestion-icon-black';
                        else
                            objDiv.className = 'folder-icon-black';
                    }
                    */

                    var objclass = 'folder-icon';
                    if(pathNameStack.length % 2 === 0){
                        objclass += '-white';
                    }else{
                        objclass += '-black';
                    }
                    if (obj.content === 'suggestion'){
                        objclass += ' suggestion-icon-';

                        var firstchar = obj.name[0];
                        if(!isNaN(firstchar)){
                            var indice = obj.name.indexOf(" ");
                            if (indice !== -1) {
                                firstchar = obj.name[indice + 1];
                            } else {
                                indice = obj.name.indexOf(".");
                                if (indice !== -1)
                                    firstchar = obj.name[indice + 1];
                                else
                                    firstchar = obj.name[0];
                            }
                        }
                        
                        //console.log("firstchar",firstchar)
                        //console.log("obj.name[0]", obj.name[0])
                        //console.log("dictionaryDigitToChessPiece[obj.name[0]]-", dictionaryDigitToChessPiece[obj.name[0]])

                        if(dictionaryDigitToChessPiece[firstchar] !== undefined)
                            objclass += dictionaryDigitToChessPiece[firstchar];
                        else
                            objclass += "pawn";

                        if(obj.name.includes("#"))
                            objclass += "-mate";

                        if(pathNameStack.length % 2 === 0){
                            objclass += '-white';
                        }else{
                            objclass += '-black';
                        }
                    }
                    
                    
                    //console.log("objclass", objclass)
                    objDiv.className = objclass;

                    nameDiv.className = 'name folder-name';
                    previewDiv.className = 'folder-preview';

                    if (obj.content === 'suggestion'){
                        nameDiv.className = 'name suggestion-name';
                        previewDiv.className = 'suggestion-preview';
                    }

                    //console.log("nameDiv.className", nameDiv.className)
                }
               
                 /*
                if (obj.content === 'suggestion') {
                    objDiv.className = 'suggestion-icon-white';
                    nameDiv.className = 'suggestion-name';
                    console.log("suggestion", obj.name);  
                }
                    */

                objDiv.addEventListener('click', () => {
                    movePiece(convertNotation(obj.name,(pathNameStack.length) % 2),true,true);
                    pathNameStack.push(obj.name);
                    displayFileSystem();

                    /*
                    if(!obj.name.includes("#")){
                        movePiece(convertNotation(obj.name,(pathNameStack.length) % 2),true);
                        chessboardHistory.push(JSON.stringify(chessPieces));
                        pathNameStack.push(obj.name);
                        displayFileSystem();
                    }
                    */

                    /*
                    if (pathNameStack.length === 2 && (obj.name === 'Bianchi' || obj.name === 'White')) {
                        n = 0;
                    } else if (pathNameStack.length === 2 && (obj.name === 'Neri' || obj.name === 'Black')) {
                        n = 0;
                    }
                    */
                });
            }

            objDiv.appendChild(previewDiv);
            objDiv.appendChild(nameDiv);
            /*
            if(obj.type === 'file')
                objDiv.appendChild(previewDiv);
            */
            fragment.appendChild(objDiv);
            shownObjs.push(obj.name);
        }
    });
    fileSystem.forEach(obj => {
        if (JSON.stringify(obj.path) === JSON.stringify(oppositePathNameStack)){
            //needToShowWarning(obj.path)
            //if(obj.type === "folder" && (obj.content === "suggestion" || isSubset(startingInWarning,pathNameStack))){
            //if(obj.type === "folder" && (obj.content === "suggestion" || suggestionInYourPath(obj.path))){
            if(obj.type === "folder" && !shownObjs.includes(obj.name)){
                const objDiv = document.createElement('div');
                const nameDiv = document.createElement('div');
                const previewDiv = document.createElement('div');
                previewDiv.textContent = obj.preview || '';

                if(pathNameStack.length % 2 === 0)
                    nameDiv.textContent = (pathNameStack.length/2).toString() + '. ' + obj.name;
                else
                    nameDiv.textContent = obj.name

                if(pathNameStack[1] === White){
                    objDiv.className = 'folder-icon-white warning-icon-white';
                }else if (pathNameStack[1] === Black) {
                    objDiv.className = 'folder-icon-black warning-icon-black';
                }

                //nameDiv.className = 'name folder-name';
                nameDiv.className = 'name suggestion-name';
                //previewDiv.className = 'folder-preview';
                previewDiv.className = 'suggestion-preview';
                /*
                if (obj.content === 'suggestion'){
                    nameDiv.className = 'name suggestion-name';
                    previewDiv.className = 'suggestion-preview';
                }
                */
                objDiv.addEventListener('click', () => {
                    /*
                    if(startingInWarning.length === 0){
                        startingInWarning = pathNameStack.slice();
                    }
                    */
                    movePiece(convertNotation(obj.name,(pathNameStack.length) % 2),true,true);
                    pathNameStack.push(obj.name);
                    displayFileSystem();
                    /*
                    if(startingInWarning.length === 0){
                        startingInWarning = pathNameStack.slice();
                    }
                    if(!obj.name.includes("#")){
                        pathNameStack.push(obj.name);
                        displayFileSystem();
                    }
                    */
                });

                objDiv.appendChild(previewDiv);
                objDiv.appendChild(nameDiv);
                fragment.appendChild(objDiv);
            }

        }

    });
    fileSystemDiv.appendChild(fragment);
    //console.log("fileSystem", JSON.stringify(fileSystem));
}

function suggestionInYourPath(path){
    //console.error("needToShowWarning",path)
    for(var i=0;i<path.length;i++){
        try{
            //console.log("coooo",fileSystem.find(obj => obj.name == path[i] && JSON.stringify(obj.path) === JSON.stringify(path.slice(0,i))))
            //console.log("== sugg",fileSystem.find(obj => obj.name == path[i] && JSON.stringify(obj.path) === JSON.stringify(path.slice(0,i))).content === "suggestion")
            if (fileSystem.find(obj => obj.name == path[i] && JSON.stringify(obj.path) === JSON.stringify(path.slice(0,i))).content === "suggestion"){
                return true;
            }
        }catch(e){
        }
    }
    return false;
}

function calcOppositePathNameStack(){
    oppositePathNameStack = pathNameStack.slice();
    oppositePathNameStack[1] = oppositeColor;
}

/*function isSubset(array1, array2) {
    if (array1.length === 0) {
        return false;
    }
    if (array1.length > array2.length) {
        return false;
    }
    return array1.every(val => array2.includes(val));
}
*/

function removeFileContent() {
    let contentDivs = document.querySelectorAll('.file-content');
    contentDivs.forEach(function(contentDiv) {
        contentDiv.parentNode.removeChild(contentDiv);
    });
}


function displayFileContent(obj) {
    if(obj.type === 'file'){
        
        displayPath();
        
        removeFileContent();

        var backButton = document.getElementById('back-button');
        backButton.style.display = 'block';
        // Rimuove tutti i nodi figli dal body
        let folderViewDiv = document.getElementById('folder-view');
        while(folderViewDiv.firstChild){
            folderViewDiv.removeChild(folderViewDiv.firstChild);
        }

        // Crea e aggiunge il contentDiv
        let contentDiv = document.createElement('div');
        contentDiv.innerHTML = obj.content; // Usa innerHTML invece di textContent
        contentDiv.classList.add('file-content'); // Aggiungi la classe "file-content"
        contentDiv.style.marginTop = '40px';
        contentDiv.style.marginLeft = '30px';
        document.body.appendChild(contentDiv);
    }
}

// Aggiungi questa funzione per gestire il click sul pulsante "Indietro"
function goBack() {
    document.body.style.backgroundColor = defaultBackgroundColor;
    if(inFile){
        removeFileContent();
        inFile = false;
    }
    if(writingActive){
        document.body.removeChild(textarea);
        writingActive = false;
    }
    if(pathNameStack.length === 2){
        console.log("return to first folder html page");
        pathNameStack.pop();
        window.location.href = firstfolderhtmlpage;       
    }

    if(chessboardHistory.length > 0){
        var lastMove = chessboardHistory[chessboardHistory.length - 1].split('-');
        chessboardHistory.pop();
        var arg = [chessPieces.find(piece => piece.position === lastMove[1] && piece.inGame === true),lastMove[1] + '-' + lastMove[0] + '-false'];
        //console.log("arg",arg)
        //console.log("lastMove",lastMove);
        movePiece(arg,true,false);
        if(lastMove[2] != "0"){       //se un pezzo è stato mangiato lo "resuscitiamo"
            targetPiece = chessPieces.find(piece => piece.id == lastMove[2] && piece.inGame === false);
            targetPiece.inGame = true;

            div = document.createElement('div');
            className = 'chess-piece ';
            switch(targetPiece.name){
                case "R": className += 'rook'; break;
                case "N": className += 'knight'; break;
                case "B": className += 'bishop'; break;
                case "Q": className += 'queen'; break;
                case "K": className += 'king'; break;
                case "P": className += 'pawn'; break;
                }
                className += '-' + (targetPiece.color === 0 ? 'white' : 'black');
                div.className = className;
                document.getElementById(lastMove[1]).appendChild(div);

        }
    }

    if (pathNameStack.length > 1) {
        pathNameStack.pop();
        /*
        if(JSON.stringify(pathNameStack) === JSON.stringify(startingInWarning)){
            startingInWarning = [];
        }
        */
        
        displayFileSystem();
        displayPath(); // Aggiorna il percorso visualizzato
    }
}

function saveFileSystemToGit() {
    if (useLocalStorage){
        localStorage.setItem('fileSystem', JSON.stringify(fileSystem));
    }else{
        updateGist(gistId, gistToken, gistFilename, JSON.stringify(fileSystem))
            .then(response => {
                console.log('L\'operazione è andata a buon fine:', response);
                showToast('Data succesfully updated');
            })
            .catch(error => {
                console.error('Si è verificato un errore:', error);
                showToast('Error during data update');
            });
    }
    //set(fileSystemRef, JSON.stringify(fileSystem));
    //console.log(JSON.stringify(fileSystem));
}

function saveFileSystemToServer() {
    fetch('/DBChess/save_filesystem', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(fileSystem)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showToast('File system saved!');
        } else {
            showToast('Error saving file system: ' + data.message);
        }
    })
    .catch(error => {
        showToast('Errore di rete: ' + error);
    });
}

/*
function displayPath() {
    var pathDisplay = document.getElementById('path-display');

    if(inFile && selectedObj){
        var pathContent = pathNameStack.slice(1, -1).join(' / ');
        pathContent += ' / ' + selectedObj.preview + ' -- ' + selectedObj.name;
    }else{
        var pathContent = pathNameStack.slice(1).join(' / ');
    }
    // Unisci solo gli elementi di pathNameStack a partire dal secondo elemento
    if(writingActive && enableWritingInPathDisplay){
        pathContent = pathContent + '    --->  Writing...';
    }
    pathDisplay.textContent = pathContent;

}
*/


function displayPath() {
    var pathDisplay = document.getElementById('path-display');
    var pathContent = '<a class="displayPathFolder" href="' + currPage + "?path=" + pathNameStack[1] + '">' + pathNameStack[1] + '</a>';
    //var pathContent = pathNameStack[1];
    var moveNumber;

    for (var i = 2; i < pathNameStack.length; i++) {

        selObj = fileSystem.find(obj => obj.name === pathNameStack[i] && JSON.stringify(obj.path) === JSON.stringify(pathNameStack.slice(0,i)));
        if(!selObj){
            calcOppositePathNameStack();
            selObj = fileSystem.find(obj => obj.name === oppositePathNameStack[i] && JSON.stringify(obj.path) === JSON.stringify(oppositePathNameStack.slice(0,i)));
        }
        //console.error("displaypath, path",JSON.stringify(pathNameStack));
        //console.error("displaypath, name",pathNameStack[i]);
        if (selObj) {
            if(i % 2 === 0)
                moveNumber = (i/2).toString() + '. ';
            else
                moveNumber = ''; 
            pathContent += ' / <a class="displayPathFolder" href="' + currPage + "?path=" + encodeURIComponent(pathNameStack.slice(1,i+1).join('/').replace(/O-O-O/g, "O_O_O").replace(/O-O/g, "O_O").replace(/\//g, '-')) + '">';
            //console.error('displayPath found:', selObj);
            if (selObj.preview !== '') {
                if (selObj.type === 'file') {
                    pathContent += moveNumber + selObj.preview + '  (' + selObj.name + ') ';
                    continue; // Interrompe il ciclo
                }else if (selObj.type === 'folder') {
                    pathContent += moveNumber + selObj.name  + ' (' + selObj.preview + ') ';
                    //pathContent += ' / <a href="' + currPage + "?path=" + pathNameStack.slice(1).join('/') + '">' + selObj.name  + ' (' + selObj.preview + ')</a>';
                    continue; // Interrompe il ciclo                   
                }
            }
            
        }else{
            if(i % 2 === 0)
                moveNumber = (i/2).toString() + '. ';
            else
                moveNumber = ''; 
            pathContent += ' / <a class="displayPathFolder" href="' + currPage + "?path=" + encodeURIComponent(pathNameStack.slice(1,i+1).join('/').replace(/O-O-O/g, "O_O_O").replace(/O-O/g, "O_O").replace(/\//g, '-')) + '">';
        }

        
        pathContent += moveNumber + pathNameStack[i];
        pathContent += '</a>';
    }
    
    //if (inFile && selectedObj)
    //    pathContent += ' / ' + selectedObj.preview + ' -- ' + selectedObj.name;
    
    if(writingActive && enableWritingInPathDisplay) {
        pathContent += '    --->  Writing...';
    }

    //pathDisplay.textContent = pathContent;
    pathDisplay.innerHTML = pathContent;
}




function goIntoFolder(folderName) {
    pathNameStack.push(folderName);
    displayFileSystem();
    displayPath(); // Aggiorna il percorso visualizzato
}


async function loadFileSystemFromGit() {
    if(useLocalStorage){
        const savedFileSystem = localStorage.getItem('fileSystem');
        if (savedFileSystem) {
            fileSystem = JSON.parse(savedFileSystem);
        }
    }else{
        const githubData = await getGistContent(gistId,gistFilename);
        
        //console.log("githubData", githubData);
        fileSystem = JSON.parse(githubData);
        console.log(fileSystem);
        //console.log("fileSystem", fileSystem);
        return "endOfLoadFileSystemFunction";
    }
}

async function loadFileSystemFromServer() {
    if(useLocalStorage){
        const savedFileSystem = localStorage.getItem('fileSystem');
        if (savedFileSystem) {
            fileSystem = JSON.parse(savedFileSystem);
        }
    }else{
        const response = await fetch('/DBChess/get_filesystem');
        if (!response.ok) throw new Error('Errore nel caricamento del file system');
        const text = await response.text();
        fileSystem = JSON.parse(text);
        return "endOfLoadFileSystemFunction";
    }
}

/*
document.getElementById('append-context').addEventListener('click', function() {
    appendContent();
});
*/

function appendContent() {
    var newContent = prompt("Inserisci il contenuto da aggiungere:");
    selectedObj.content += newContent;
    saveFileSystemToServer();
    displayFileContent(selectedObj);
}



function deleteall(){
    fileSystem = defaultFileSystem;
    localStorage.clear();
    console.log('Tutti i dati sono stati eliminati dal Local Storage.');
    saveFileSystemToServer();
    displayFileSystem();
}

async function startingFunction(){

    document.body.style.backgroundColor = defaultBackgroundColor;
    
    await loadFileSystemFromServer();/*
    endOfLoadFileSystemFunction.then((risultato) => {
        console.log(risultato); // Stampa: "Risultato"
    });
    //*/

    if(fileSystem.length === 0){
        fileSystem = defaultFileSystem;
    }
    addBackButtonIfNecessary();
    var file = fileSystem.find(file => file.name === pathNameStack[pathNameStack.length - 1])
    if(file)
        displayFileContent(file);


    if(pathNameStack.length > 2){
        color = 0;
        pathNameStack.slice(2).forEach(move => {
            movePiece(convertNotation(move,(color++) % 2),false);
        });
    }
    showChessboard(pathNameStack[1]);

    var pieces = document.querySelectorAll('.chess-piece');
    pieces.forEach(function(piece) {
        piece.setAttribute('draggable', 'true');
    });

    // Gestisci l'evento dragstart
    pieces.forEach(function(piece) {
        piece.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', e.target.id);
        });

        piece.addEventListener('click', function() {
            const pezzo = chessPieces.find(p => p.id == piece.id && p.inGame === true);
            //console.log("pezzo", pezzo);
            var incell;
            if (pezzo && pezzo.color == pathNameStack.length % 2) {
                //console.log("in");
                selectedPieceId = piece.id;
                legalMoves = pieceMoves(pezzo);
                console.log("legalMoves", legalMoves);
                // Per ogni mossa valida, mostra il pallino nella casella corrispondente
                legalMoves.forEach(function(toCellId) {
                    let casella = document.getElementById(toCellId);
                    if(chessPieces.find(p => p.position == toCellId && p.inGame === true && p.color != pezzo.color))
                        incell = casella.querySelector('.corners');
                    else
                        incell = casella.querySelector('.ball');
                        incell.style.visibility = 'visible';
                    incellsOn.push(incell);
                });
            }else {
                // Considera il pezzo come una casella su cui il pezzo selezionato può muoversi
                // Aggiungi qui il codice per muovere il pezzo selezionato sulla casella del pezzo cliccato
                const pezzoSelezionato = chessPieces.find(p => p.id == selectedPieceId);
                if (pezzoSelezionato) {
                    const mosseValide = pieceMoves(pezzoSelezionato);
                    if (mosseValide.includes(piece.position)) {
                        // Muovi il pezzo selezionato sulla casella del pezzo cliccato
                        pezzoSelezionato.position = piece.position;
                        // Rimuovi il pezzo nemico dal gioco
                        piece.inGame = false;
                    }
                }
            }
        });
    });

    var squares = document.querySelectorAll('#chessBoard td');
    squares.forEach(function(square) {
        // Permette il drop sull'elemento quando si trascina sopra
        square.addEventListener('dragover', function(e) {
            e.preventDefault();
        });
      
        // Quando si rilascia l'elemento, ottiene l'ID del pezzo trascinato e lo appende alla cella
        square.addEventListener('drop', function(e) {
            e.preventDefault();
            var pieceId = e.dataTransfer.getData('text/plain');
            var eat;
            var toCellId = e.currentTarget.id;
            var piece = chessPieces.find(piece => piece.id == pieceId && piece.inGame === true)

            var eattenPieces = chessPieces.filter(currentPiece => currentPiece.position == toCellId && currentPiece.inGame === true && currentPiece.color != piece.color)
            if (eattenPieces.length > 0){
                eat = 'true';
            }else{
                eat = 'false';
            }
            //if(canMove && piece.color === pathNameStack.length % 2 && !chessPieces.find(currentPiece => currentPiece.position == toCellId && currentPiece.inGame === true && currentPiece.color == piece.color)){
            if (canPieceReach(piece, toCellId) && piece.color === pathNameStack.length % 2){
                //console.log("move",reverseConvertNotation(piece,toCellId,eat === 'true'));
                var reverse_move = reverseConvertNotation(piece,toCellId,eat === 'true');
                movePiece([piece, piece.position + '-' + toCellId.toString() + '-' + eat],true,true)
                var jsonPathNameStack = JSON.stringify(pathNameStack);
                try{
                    goIntoFolder(fileSystem.find(obj => obj.name.includes(reverse_move) && JSON.stringify(obj.path) === jsonPathNameStack).name);
                }catch(e){
                    //goIntoFolder(reverseConvertNotation(piece,toCellId,eat === 'true'));
                    goIntoFolder(reverse_move);
                }
            }
        });

        square.addEventListener('click', function(e) {
            if(selectedPieceId){
                var eat;
                var toCellId = e.currentTarget.id;
                var piece = chessPieces.find(piece => piece.id == selectedPieceId && piece.inGame === true)
    
                var eattenPieces = chessPieces.filter(currentPiece => currentPiece.position == toCellId && currentPiece.inGame === true && currentPiece.color != piece.color)
                if (eattenPieces.length > 0){
                    eat = 'true';
                }else{
                    eat = 'false';
                }
                //if(canMove && piece.color === pathNameStack.length % 2 && !chessPieces.find(currentPiece => currentPiece.position == toCellId && currentPiece.inGame === true && currentPiece.color == piece.color)){
                if (canPieceReach(piece, toCellId) && piece.color === pathNameStack.length % 2){
                    //console.log("move",reverseConvertNotation(piece,toCellId,eat === 'true'));
                    var reverse_move = reverseConvertNotation(piece,toCellId,eat === 'true');
                    movePiece([piece, piece.position + '-' + toCellId.toString() + '-' + eat],true,true)
                    var jsonPathNameStack = JSON.stringify(pathNameStack);
                    try{
                        goIntoFolder(fileSystem.find(obj => obj.name.includes(reverse_move) && JSON.stringify(obj.path) === jsonPathNameStack).name);
                    }catch(e){
                        //goIntoFolder(reverseConvertNotation(piece,toCellId,eat === 'true'));
                        goIntoFolder(reverse_move);
                    }
                }
            }
        });
    });

    

    displayFileSystem();
}

/*
// Funzione scrivi
function write() {
    const content = prompt("Inserisci il contenuto del file:");
    console.log(content);
    selectedObj.content = content;
    saveFileSystemToServer();
    displayFileContent(selectedObj);
}
*/


function write() {

    removeFileContent();
    writingActive = true;
    displayPath();
    // Crea un elemento textarea
    document.body.style.backgroundColor = writingBackgroundColor;
    textarea = document.createElement('textarea');
    textarea.style.backgroundColor = writingBackgroundColor;
    textarea.value = convertHtmlToTextarea(selectedObj.content);
    textarea.style.cursor = 'text';
    textarea.style.marginTop = '38px';
    textarea.style.marginLeft = '28px';
    textarea.style.width = '90%'; // Imposta la larghezza al 100%
    textarea.style.height = '80vh';
    textarea.style.border = 'none'; // Rimuove i bordi
    textarea.style.outline = 'none'; // Rimuove l'outline
    textarea.style.boxShadow = 'none';
    textarea.style.resize = 'none';
    textarea.style.fontFamily = window.getComputedStyle(document.body).fontFamily;
    textarea.style.fontSize = window.getComputedStyle(document.body).fontSize;

    // Aggiungi il textarea al documento
    document.body.appendChild(textarea);


    
    
    /*
    // Aggiungi un listener per l'evento 'blur' al textarea
    textarea.addEventListener('blur', function() {
        // Quando l'utente finisce di modificare il textarea, salva il contenuto
        selectedObj.content = textarea.value.replace(/\n/g, '<br>');
        saveFileSystemToServer();
        displayFileContent(selectedObj);

        // Rimuovi il textarea dal documento
        document.body.removeChild(textarea);
        writingActive = false;
    });
    */

    document.getElementById('save-context').addEventListener('click', function() {
        exitWriting(true);
    });

    document.getElementById('no-save-context').addEventListener('click', function() {
        exitWriting(false);
    });

    // Imposta il focus sul textarea
    textarea.focus();
}

function exitWriting(save){
    writingActive = false;
    document.body.style.backgroundColor = defaultBackgroundColor;
    if (save) {
        //selectedObj.content = textarea.value.replace(/\n/g, '<br>');
        selectedObj.content = convertTextareaContentToHtml(textarea.value);
        saveFileSystemToServer();
    }
    displayFileContent(selectedObj);

        // Rimuovi il textarea dal documento
    if(document.body.contains(textarea))
        document.body.removeChild(textarea);
    
}



// Aggiungi listener per l'evento 'input' all'elemento di input
document.getElementById('write-context').addEventListener('click', function() {
    write();
});

function reverseConvertNotation(chessPiece, toCellId, eat) {
    // Estrai fromCellId e toCellId da move
    //const [fromCellId, toCellId] = move.split('-');
    //console.log("chessPiece", chessPiece);
    // Inizializza la notazione della mossa con il nome del pezzo, se non è un pedone
    let moveNotation = chessPiece.name !== 'P' ? chessPiece.name : '';

    // Se il pezzo mangia un altro pezzo, aggiungi 'x' alla notazione
    if (eat) {
        if (chessPiece.name == 'P'){
            moveNotation += chessPiece.position[0];
        }
        moveNotation += 'x';
    }

    // Aggiungi la cella di destinazione alla notazione
    moveNotation += toCellId;

    if (isCheck(chessPiece)){
        /*
        if(isCheckmate(chessPiece))     //isCheckmate non tiene conto delle possibili mosse degli altri pezzi che parano il re
            moveNotation += "#";
        else*/
            moveNotation += "+"
    }

    console.log("moveNotation", moveNotation);
    return moveNotation;
}

function isCheck(chessPiece) {
    var kingPosition = chessPieces.find(piece => piece.name === 'K' && piece.color !== chessPiece.color && piece.inGame === true).position;
    return canPieceReach(chessPiece, kingPosition);
}

function isCheckmate(chessPiece,returnlegalMoves = false) {     //isCheckmate non tiene conto delle possibili mosse degli altri pezzi che parano il re
    if(!isCheck(chessPiece))
        return false;
    else{
        var king = chessPieces.find(piece => piece.name === 'K' && piece.color !== chessPiece.color && piece.inGame === true);
        var kingPosition = king.position;
        var pieces = chessPieces.filter(piece => piece.color === chessPiece.color && piece.inGame === true);
        //console.log("kingLegalMove", kingLegalMove(kingPosition));
        var kingMovesArray = kingMoves(kingPosition);
        var cantGo = [];
        //console.log("kingMovesArray", kingMovesArray);
        kingMovesArray.forEach(function(toCellId){
            //console.log("toCellId",toCellId);
            pieces.forEach(function(piece){
                if(canPieceReach(piece, toCellId, false)){
                    if (!cantGo.includes(toCellId)) {
                        cantGo.push(toCellId);
                    }
                    return true;
                }
                return false;
            });
        });
        var kingLegalMove = kingMovesArray.filter(function(move) {
            return !cantGo.includes(move);
        });
        
        if (returnlegalMoves)
            return kingLegalMove;

        if(kingLegalMove.length === 0){
            return true;
        }
        return false;
    }
}

function bishopMoves(posizione) {
    const mosse_valide = [];
    const x = posizione.charCodeAt(0) - 'a'.charCodeAt(0);
    const y = parseInt(posizione[1]) - 1;

    var bishop = chessPieces.find(piece => piece.position === posizione);

    // Calcola le possibili mosse lungo le diagonali
    for (let dx = -1; dx <= 1; dx += 2) {
        for (let dy = -1; dy <= 1; dy += 2) {
            let nx = x + dx;
            let ny = y + dy;
            while (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {  // Controlla se la mossa è dentro la scacchiera
                const mossa = String.fromCharCode('a'.charCodeAt(0) + nx) + (ny + 1);
                var pieceAtMove = chessPieces.find(piece => piece.position === mossa);
                if(pieceAtMove && pieceAtMove.color === bishop.color) {
                    break; // Interrompe il ciclo se la mossa è occupata da un pezzo dello stesso colore
                }
                mosse_valide.push(mossa);
                nx += dx;
                ny += dy;
            }
        }
    }

    var bishopMoves = [];
    mosse_valide.filter(function(move) {
        if(isPathClearBishop(bishop, move))
            bishopMoves.push(move);
    });

    return bishopMoves;
}

function rookMoves(posizione) {
    const mosse_valide = [];
    const x = posizione.charCodeAt(0) - 'a'.charCodeAt(0);
    const y = parseInt(posizione[1]) - 1;

    var rook = chessPieces.find(piece => piece.position === posizione);

    // Calcola le possibili mosse lungo la stessa riga
    for (let dx = -1; dx <= 1; dx += 2) {
        let nx = x + dx;
        while (nx >= 0 && nx < 8) {  // Controlla se la mossa è dentro la scacchiera
            const mossa = String.fromCharCode('a'.charCodeAt(0) + nx) + (y + 1);
            var pieceAtMove = chessPieces.find(piece => piece.position === mossa);
            if(pieceAtMove && pieceAtMove.color === rook.color) {
                break; // Interrompe il ciclo se la mossa è occupata da un pezzo dello stesso colore
            }
            mosse_valide.push(mossa);
            nx += dx;
        }
    }

    // Calcola le possibili mosse lungo la stessa colonna
    for (let dy = -1; dy <= 1; dy += 2) {
        let ny = y + dy;
        while (ny >= 0 && ny < 8) {  // Controlla se la mossa è dentro la scacchiera
            const mossa = String.fromCharCode('a'.charCodeAt(0) + x) + (ny + 1);
            var pieceAtMove = chessPieces.find(piece => piece.position === mossa);
            if(pieceAtMove && pieceAtMove.color === rook.color) {
                break; // Interrompe il ciclo se la mossa è occupata da un pezzo dello stesso colore
            }
            mosse_valide.push(mossa);
            ny += dy;
        }
    }

    var rookMoves = [];
    mosse_valide.filter(function(move) {
        if(isPathClearRook(rook, move))
            rookMoves.push(move);
    });

    return rookMoves;
}

function queenMoves(posizione) {
    // Calcola le mosse valide per una torre e un alfiere
    const mosse_torre = rookMoves(posizione);
    const mosse_alfiere = bishopMoves(posizione);

    // Combina le mosse valide per una torre e un alfiere
    const mosse_valide = [...mosse_torre, ...mosse_alfiere];

    var queen = chessPieces.find(piece => piece.position === posizione);
    var queenMoves = [];
    mosse_valide.filter(function(move) {
        var pieceAtMove = chessPieces.find(piece => piece.position === move);
        if(pieceAtMove && pieceAtMove.color === queen.color) {
            return; // Ignora la mossa se è occupata da un pezzo dello stesso colore
        }
        if(isPathClearQueen(queen, move))
            queenMoves.push(move);
    });

    return queenMoves;
}

function knightMoves(posizione) {
    const mosse_valide = [];
    const x = posizione.charCodeAt(0) - 'a'.charCodeAt(0);
    const y = parseInt(posizione[1]) - 1;

    var knight = chessPieces.find(piece => piece.position === posizione);

    // Calcola le possibili mosse del cavallo
    const mosse_cavallo = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
    for (let i = 0; i < mosse_cavallo.length; i++) {
        let nx = x + mosse_cavallo[i][0];
        let ny = y + mosse_cavallo[i][1];
        if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {  // Controlla se la mossa è dentro la scacchiera
            const mossa = String.fromCharCode('a'.charCodeAt(0) + nx) + (ny + 1);
            var pieceAtMove = chessPieces.find(piece => piece.position === mossa);
            if(pieceAtMove && pieceAtMove.color === knight.color) {
                continue; // Ignora la mossa se è occupata da un pezzo dello stesso colore
            }
            mosse_valide.push(mossa);
        }
    }

    return mosse_valide;
}

function kingMoves(posizione) {  //ritorna le mosse valide per il re non tiene conto degli scacchi ma tiene conto dei pezzi amici
    const mosse_valide = [];
    const x = posizione.charCodeAt(0) - 'a'.charCodeAt(0);
    const y = parseInt(posizione[1]) - 1;

    // Calcola le possibili mosse in tutte le direzioni
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx !== 0 || dy !== 0) {  // Escludi la posizione corrente
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {  // Controlla se la mossa è dentro la scacchiera
                    const mossa = String.fromCharCode('a'.charCodeAt(0) + nx) + (ny + 1);
                    mosse_valide.push(mossa);
                }
            }
        }
    }
    var king = chessPieces.find(piece => piece.position === posizione);
    var kingMoves = [];
    mosse_valide.filter(function(move) {
        if(isPathClearKing(king, move))
            kingMoves.push(move);
    });
    
    return kingMoves;
}

function pawnMoves(posizione) {
    const mosse_valide = [];
    const x = posizione.charCodeAt(0) - 'a'.charCodeAt(0);
    const y = parseInt(posizione[1]) - 1;

    var pawn = chessPieces.find(piece => piece.position === posizione && piece.inGame === true);

    // Calcola le possibili mosse in avanti
    var dy = pawn.color === 1 ? -1 : 1; // I pedoni bianchi si muovono verso l'alto, i pedoni neri verso il basso
   //console.log("dy",dy);

    const mossa = String.fromCharCode('a'.charCodeAt(0) + x) + (y + dy + 1);
    //console.log("mossa",mossa);
    var pieceAtMove = chessPieces.find(piece => piece.position === mossa && piece.inGame === true);
    //console.log("pieceAtMove",pieceAtMove);
    if (!pieceAtMove) {
        mosse_valide.push(mossa);
        // Controlla la mossa di due caselle se è la prima mossa del pedone
        if ((pawn.color === 0 && y === 1) || (pawn.color === 1 && y === 6)) {
            const mossa2 = String.fromCharCode('a'.charCodeAt(0) + x) + (y + 2*dy + 1);
            pieceAtMove = chessPieces.find(piece => piece.position === mossa2);
            if (!pieceAtMove) {
                mosse_valide.push(mossa2);
            }
        }
    }

    // Calcola le possibili mosse di cattura
    for (let dx = -1; dx <= 1; dx += 2) {
        const mossa = String.fromCharCode('a'.charCodeAt(0) + x + dx) + (y + dy + 1);
        pieceAtMove = chessPieces.find(piece => piece.position === mossa);
        if (pieceAtMove && pieceAtMove.color !== pawn.color) {
            mosse_valide.push(mossa);
        }
    }
    console.log("mosse_valide",mosse_valide);   
    return mosse_valide;
}



function pieceMoves(chessPiece) {
    /*
    switch (chessPiece.name) {
        case 'K':
            return kingMoves(chessPiece.position);
        case 'Q':
            return queenMoves(chessPiece.position);
        case 'R':
            return rookMoves(chessPiece.position);
        case 'B':
            return bishopMoves(chessPiece.position);
        case 'N':
            return knightMoves(chessPiece.position);
        case 'P':
            return pawnMoves(chessPiece.position);
        default:
            return [];
    }
    */
   var legalMoves = [];
    for (let colonna = 'a'.charCodeAt(0); colonna <= 'h'.charCodeAt(0); colonna++) {
        for (let riga = 1; riga <= 8; riga++) {
            let posizione = String.fromCharCode(colonna) + riga;
            if(canPieceReach(chessPiece, posizione)){
                legalMoves.push(posizione);
            }
        }
    }
    return legalMoves;
}



function canKnightReach(knightPosition, targetPosition) {
    // Converti le posizioni in coordinate numeriche
    var knightX = knightPosition.charCodeAt(0) - 'a'.charCodeAt(0);
    var knightY = parseInt(knightPosition[1]) - 1;
    var targetX = targetPosition.charCodeAt(0) - 'a'.charCodeAt(0);
    var targetY = parseInt(targetPosition[1]) - 1;

    // Calcola la differenza tra le coordinate del cavallo e quelle della posizione target
    var dx = Math.abs(knightX - targetX);
    var dy = Math.abs(knightY - targetY);

    // Un cavallo può raggiungere la posizione target se la differenza tra le coordinate x e y è (2, 1) o (1, 2)
    return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
}

function canBishopReach(bishopPosition, targetPosition) {
    // Converti le posizioni in coordinate numeriche
    var bishopX = bishopPosition.charCodeAt(0) - 'a'.charCodeAt(0);
    var bishopY = parseInt(bishopPosition[1]) - 1;
    var targetX = targetPosition.charCodeAt(0) - 'a'.charCodeAt(0);
    var targetY = parseInt(targetPosition[1]) - 1;

    // Un alfiere può raggiungere la posizione target se la differenza assoluta tra le coordinate x e y è la stessa
    return Math.abs(bishopX - targetX) === Math.abs(bishopY - targetY);
}

function canRookReach(rookPosition, targetPosition) {
    // Converti le posizioni in coordinate numeriche
    var rookX = rookPosition.charCodeAt(0) - 'a'.charCodeAt(0);
    var rookY = parseInt(rookPosition[1]) - 1;
    var targetX = targetPosition.charCodeAt(0) - 'a'.charCodeAt(0);
    var targetY = parseInt(targetPosition[1]) - 1;

    // Una torre può raggiungere la posizione target se le coordinate x o y sono le stesse
    return rookX === targetX || rookY === targetY;
}

function canQueenReach(queenPosition, targetPosition) {
    // Converti le posizioni in coordinate numeriche
    var queenX = queenPosition.charCodeAt(0) - 'a'.charCodeAt(0);
    var queenY = parseInt(queenPosition[1]) - 1;
    var targetX = targetPosition.charCodeAt(0) - 'a'.charCodeAt(0);
    var targetY = parseInt(targetPosition[1]) - 1;

    // Una regina può raggiungere la posizione target se le coordinate x o y sono le stesse (movimento della torre)
    // o se la differenza assoluta tra le coordinate x e y è la stessa (movimento dell'alfiere)
    return queenX === targetX || queenY === targetY || Math.abs(queenX - targetX) === Math.abs(queenY - targetY);
}

function canPawnReach(pawnPosition, targetPosition, isWhite, eat = false) {
    // Converti le posizioni in coordinate numeriche
    var pawnX = pawnPosition.charCodeAt(0) - 'a'.charCodeAt(0);
    var pawnY = parseInt(pawnPosition[1]) - 1;
    var targetX = targetPosition.charCodeAt(0) - 'a'.charCodeAt(0);
    var targetY = parseInt(targetPosition[1]) - 1;

    //console.log("pawn", pawnX, pawnY, "target", targetX, targetY, "isWhite", isWhite);

    // Un pedone può raggiungere la posizione target se le coordinate x sono le stesse
    // e la coordinata y del target è una o due caselle avanti (per i bianchi) o indietro (per i neri),
    // a seconda che il pedone sia o meno nella sua posizione iniziale
    // Oppure se la posizione target è in diagonale rispetto alla posizione del pedone (cattura)

    if (isWhite === 0 && targetY > pawnY) {
        if(pawnX === targetX){
            if(((targetY - 2 <= pawnY) && pawnY === 1) || (targetY - 1 <= pawnY)){
                return true;
            }
        }else if(eat && Math.abs(pawnX - targetX) === 1 && targetY - 1 === pawnY){
            return true;
        }
    }else if (isWhite === 1 && targetY < pawnY) {
        //console.log("in");
        if(pawnX === targetX){
            if(((targetY + 2 >= pawnY) && pawnY === 6) || (targetY + 1 >= pawnY)){
                return true;
            }
        }else if(eat && Math.abs(pawnX - targetX) === 1 && targetY + 1 === pawnY){
            return true;
        }
    }

    /*
    if (isWhite === 0) {
        if ((pawnX === targetX && (targetY === pawnY + 1 || (pawnY === 1 && targetY === pawnY + 2))) ||
            (Math.abs(pawnX - targetX) === 1 && targetY === pawnY + 1)) {
            return true;
        }
    } else {
        if ((pawnX === targetX && (targetY === pawnY - 1 || (pawnY === 6 && targetY === pawnY - 2))) ||
            (Math.abs(pawnX - targetX) === 1 && targetY === pawnY - 1)) {
            return true;
        }
    }
    */

    // Se nessuna delle condizioni è soddisfatta, lancia un errore
    //throw new Error('Il pedone non può raggiungere la posizione target alla prossima mossa');
    return false;
}

function canKingReach(kingPosition, targetPosition) {
    // Converti le posizioni in coordinate numeriche
    var kingX = kingPosition.charCodeAt(0) - 'a'.charCodeAt(0);
    var kingY = parseInt(kingPosition[1]) - 1;
    var targetX = targetPosition.charCodeAt(0) - 'a'.charCodeAt(0);
    var targetY = parseInt(targetPosition[1]) - 1;

    // Calcola la differenza tra le coordinate del re e quelle della posizione target
    var dx = Math.abs(kingX - targetX);
    var dy = Math.abs(kingY - targetY);

    // Un re può raggiungere la posizione target se la differenza tra le coordinate x e y è al massimo 1
    return dx <= 1 && dy <= 1;
}

function convertNotation(move,player){
    //move = move.replace(/^\[|\]$/g, '');
    move = move.replace(/\[|\]/g, '').trim();
    console.log(move)
    if(move === "O-O"){
        return [chessPieces.find(p => p.name === 'K' && p.color === player),'O-O-false'];
    }else if(move === "O-O-O"){
        return [chessPieces.find(p => p.name === 'K' && p.color === player),'O-O-O'];
    }

    //console.error("move___________", move);
    var temp_move = move;
    var toCellId;
    var fromCellId = null;
    var eat = false;
    var piece = "";
    var chessPiece = null;
    var updateFromCellId = true;

    while(temp_move.length > 0){
        //console.log("temp_move", temp_move);
        //console.log("temp_move[-1]", temp_move[temp_move.length-1],!isNaN(temp_move[temp_move.length-1]));
        
        if (!isNaN(temp_move[temp_move.length-1]) && ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].includes(temp_move[temp_move.length-2])){
            //console.log("in")
            toCellId = temp_move.slice(-2);
            temp_move = temp_move.slice(0,-2);
            break;
        }
        temp_move = temp_move.slice(0,-1);
    }

    if (temp_move[temp_move.length-1] === 'x'){
        temp_move = temp_move.slice(0,-1);
        eat = true;
    }
    
    piece = temp_move[0];
    switch (piece){
        case "N":
            //console.log(piece);
            var matchingPieces = chessPieces.filter(function(chessPiece) {
                return chessPiece.name === piece && chessPiece.color === player && chessPiece.inGame === true && canKnightReach(chessPiece.position, toCellId);
            });
            if (matchingPieces.length === 1){
                fromCellId = matchingPieces[0].position;
                updateFromCellId = false;
                chessPiece = matchingPieces[0];
                //console.log("matchingPieces", matchingPieces[0]);
            }else if (matchingPieces.length === 0){
                console.log("No matchingPieces");
            }else{
                startingpos = temp_move.slice(1);
                //console.log("startingpos", startingpos);
                var matchingPiece = matchingPieces.filter(function(chessPiece) {
                    return chessPiece.position.includes(startingpos);
                });
                if (matchingPiece.length === 1){
                    fromCellId = matchingPiece[0].position;
                    chessPiece = matchingPiece[0];
                    //console.log("matchingPiece", matchingPiece[0]);
                }else{
                    console.log("Too many matchingPieces");
                }   
            }
            
            break;
        case "B":
            var matchingPieces = chessPieces.filter(function(chessPiece) {
                /*
                if(canBishopReach(chessPiece.position, toCellId)){
                    console.log("chessPiece_______", chessPiece);
                    console.log("piece", piece,chessPiece.name === piece);
                    console.log("color", chessPiece.color === player);
                    console.log("inGame",chessPiece.inGame === true);
                    console.log(pathNameStack.length)
                    console.log(pathNameStack);
                }
                */
                    
                return chessPiece.name === piece && chessPiece.color === player && chessPiece.inGame === true && canBishopReach(chessPiece.position, toCellId);
            });
            if (matchingPieces.length === 1){
                fromCellId = matchingPieces[0].position;
                //updateFromCellId = false;
                chessPiece = matchingPieces[0];
                //console.log("matchingPieces", matchingPieces[0]);
            }else if (matchingPieces.length === 0){
                console.log("No matchingPieces");
            }
            break;
        case "R":
            var matchingPieces = chessPieces.filter(function(chessPiece) {
                return chessPiece.name === piece && chessPiece.color === player && chessPiece.inGame === true && canRookReach(chessPiece.position, toCellId);
            });
            if (matchingPieces.length === 1){
                fromCellId = matchingPieces[0].position;
                updateFromCellId = false;
                chessPiece = matchingPieces[0];
                console.log("matchingPieces", matchingPieces[0]);
            }else if (matchingPieces.length === 0){
                console.log("No matchingPieces");
            }else{
                var matchingPieces2 = matchingPieces.filter(function(chessPiece) {
                    return isPathClearRook(chessPiece, toCellId)
                });
                if (matchingPieces2.length === 1){
                    fromCellId = matchingPieces2[0].position;
                    //updateFromCellId = false;
                    chessPiece = matchingPieces2[0];
                    //console.log("matchingPieces2", matchingPieces2[0]);
                }
                else{
                    console.log("Too many matchingPieces");
                    startingpos = temp_move.slice(1);
                    //console.log("startingpos", startingpos);
                    var matchingPiece = matchingPieces.filter(function(chessPiece) {
                        return chessPiece.position.includes(startingpos);
                    });
                    if (matchingPiece.length === 1){

                        fromCellId = matchingPiece[0].position;
                        chessPiece = matchingPiece[0];
                        console.log("matchingPiece", chessPiece);
                    }
                }
            }
            
            break;
        case "Q":
            var matchingPieces = chessPieces.filter(function(chessPiece) {
                return chessPiece.name === piece && chessPiece.color === player && chessPiece.inGame === true && canQueenReach(chessPiece.position, toCellId);
            });
            fromCellId = matchingPieces[0].position;
            updateFromCellId = false;
            chessPiece = matchingPieces[0];
            break;
        case "K":
            var matchingPieces = chessPieces.filter(function(chessPiece) {
                return chessPiece.name === piece && chessPiece.color === player && chessPiece.inGame === true && canKingReach(chessPiece.position, toCellId);
            });
            fromCellId = matchingPieces[0].position;
            updateFromCellId = false;
            chessPiece = matchingPieces[0];
            break;
        default:
            piece = "P";
            var matchingPieces = chessPieces.filter(function(chessPiece) {
                return chessPiece.name === piece && chessPiece.color === player && chessPiece.inGame === true && canPawnReach(chessPiece.position, toCellId, player,eat);
            });
            if (matchingPieces.length === 1){
                fromCellId = matchingPieces[0].position;
                updateFromCellId = false;
                chessPiece = matchingPieces[0];
                //console.log("matchingPieces", matchingPieces[0]);
            }else if (matchingPieces.length === 0){
                console.log("No matchingPieces");
                //console.log("move___", move, player);
            }else{
                //console.log("matchingPiece", matchingPieces)
                //console.log(temp_move)
                startingpos = temp_move.slice();
                //console.log("startingpos", startingpos);
                var matchingPiece = matchingPieces.filter(function(chessPiece) {
                    return chessPiece.position.includes(startingpos);
                });

                if (matchingPiece.length === 1){
                    fromCellId = matchingPiece[0].position;
                    chessPiece = matchingPiece[0];
                    updateFromCellId = false;
                }else{
                    console.log("Too many matchingPieces");
                }
            }
        break;   
    }

    if(updateFromCellId === true){
        fromCellId = chessPiece.position;
    }
    

    //console.log("toCellId", toCellId);
    //console.log("temp_move", temp_move);
    //console.log("eat", eat);
    //console.log("fromCellId", fromCellId);
    

    if (fromCellId === null || toCellId === null || fromCellId === toCellId){
        throw new Error("parametri non validi");
        return;
    }

    return [chessPiece,fromCellId + '-' + toCellId + '-' + eat];
}

function canPieceReach(piece, targetPosition, denySameColor = true) {
    //console.log("piece", piece);
    // Controlla se la posizione target è occupata da un pezzo dello stesso colore
    if(chessPieces.find(currPiece => currPiece.position == targetPosition && currPiece.inGame === true && (currPiece.color == piece.color && denySameColor))){
        return false;
    }

    // Chiama la funzione corrispondente al tipo di pezzo
    let canReach;
    switch (piece.name) {
        case 'N':
            canReach = canKnightReach(piece.position, targetPosition);
            //console.log("knight",piece)
            break;
        case 'B':
            
            //console.log("in bishop")
            canReach = canBishopReach(piece.position, targetPosition);
            if (canReach)
                canReach = isPathClearBishop(piece, targetPosition);
            break;
        case 'R':
            canReach = canRookReach(piece.position, targetPosition);
            if (canReach)
                canReach = isPathClearRook(piece, targetPosition);
            break;
        case 'Q':
            canReach = canQueenReach(piece.position, targetPosition);
            if (canReach)
                canReach = isPathClearQueen(piece, targetPosition);
            break;
        case 'P':
            canReach = canPawnReach(piece.position, targetPosition, piece.color,chessPieces.find(currPiece => currPiece.position == targetPosition && currPiece.inGame === true && currPiece.color !== piece.color));
            if (canReach)
                canReach = isPathClearPawn(piece, targetPosition);
            break;
        case 'K':
            canReach = canKingReach(piece.position, targetPosition);
            if (canReach)
                canReach = isPathClearKing(piece, targetPosition);
            break;
    }

    // Se il pezzo non può raggiungere la posizione target, restituisci false
    if (!canReach) {
        return false;
    }

    // Restituisci true se il pezzo può raggiungere la posizione target
    return true;
}

function isPathClearBishop(piece, targetPosition) {
    const start = piece.position;
    const end = targetPosition;

    // Converti le posizioni in coordinate numeriche
    const startX = start.charCodeAt(0) - 'a'.charCodeAt(0);
    const startY = parseInt(start[1]) - 1;
    const endX = end.charCodeAt(0) - 'a'.charCodeAt(0);
    const endY = parseInt(end[1]) - 1;

    // Calcola la direzione del movimento
    const dirX = Math.sign(endX - startX);
    const dirY = Math.sign(endY - startY);

    // Inizia dalla cella successiva alla posizione di partenza
    let x = startX + dirX;
    let y = startY + dirY;

    // Continua fino a raggiungere la posizione target
    while (x !== endX || y !== endY) {
        // Converti le coordinate numeriche in una posizione
        const position = String.fromCharCode('a'.charCodeAt(0) + x) + (y + 1).toString();

        // Controlla se la posizione è occupata da un pezzo
        if (chessPieces.find(currPiece => currPiece.position === position && currPiece.inGame === true)) {
            return false;
        }

        // Passa alla cella successiva
        x += dirX;
        y += dirY;
    }

    return true;
}

function isPathClearRook(piece, targetPosition) {
    const start = piece.position;
    const end = targetPosition;

    // Converti le posizioni in coordinate numeriche
    const startX = start.charCodeAt(0) - 'a'.charCodeAt(0);
    const startY = parseInt(start[1]) - 1;
    const endX = end.charCodeAt(0) - 'a'.charCodeAt(0);
    const endY = parseInt(end[1]) - 1;

    // Calcola la direzione del movimento
    const dirX = Math.sign(endX - startX);
    const dirY = Math.sign(endY - startY);

    // Inizia dalla cella successiva alla posizione di partenza
    let x = startX + dirX;
    let y = startY + dirY;

    // Continua fino a raggiungere la posizione target
    while (x !== endX || y !== endY) {
        // Converti le coordinate numeriche in una posizione
        const position = String.fromCharCode('a'.charCodeAt(0) + x) + (y + 1).toString();

        // Controlla se la posizione è occupata da un pezzo
        if (chessPieces.find(currPiece => currPiece.position === position && currPiece.inGame === true)) {
            return false;
        }

        // Passa alla cella successiva
        x += dirX;
        y += dirY;
    }

    return true;
}

function isPathClearQueen(piece, targetPosition) {
    const start = piece.position;
    const end = targetPosition;

    // Converti le posizioni in coordinate numeriche
    const startX = start.charCodeAt(0) - 'a'.charCodeAt(0);
    const startY = parseInt(start[1]) - 1;
    const endX = end.charCodeAt(0) - 'a'.charCodeAt(0);
    const endY = parseInt(end[1]) - 1;

    // Calcola la direzione del movimento
    const dirX = Math.sign(endX - startX);
    const dirY = Math.sign(endY - startY);

    // Se la regina si muove in linea retta (orizzontalmente o verticalmente)
    if (startX === endX || startY === endY) {
        return isPathClearRook(piece, targetPosition);
    }
    // Se la regina si muove in diagonale
    else if (Math.abs(endX - startX) === Math.abs(endY - startY)) {
        return isPathClearBishop(piece, targetPosition);
    }
    // Se la regina non si muove né in linea retta né in diagonale, la mossa non è valida
    else {
        return false;
    }
}

function isPathClearPawn(piece, targetPosition) {
    const start = piece.position;
    const end = targetPosition;

    // Converti le posizioni in coordinate numeriche
    const startX = start.charCodeAt(0) - 'a'.charCodeAt(0);
    const startY = parseInt(start[1]) - 1;
    const endX = end.charCodeAt(0) - 'a'.charCodeAt(0);
    const endY = parseInt(end[1]) - 1;

    // Calcola la direzione del movimento
    const dirY = piece.color === 0 ? 1 : -1; // 'white' per bianco, 'black' per nero

    // Se il pedone si muove in avanti di una casella
    if (startX === endX && endY === startY + dirY) {
        // Controlla se la posizione target è occupata da un pezzo
        if (chessPieces.find(currPiece => currPiece.position === end && currPiece.inGame === true)) {
            return false;
        }
    }
    // Se il pedone si muove in avanti di due caselle (solo dalla posizione di partenza)
    else if (startX === endX && endY === startY + 2 * dirY && ((piece.color === 0 && startY === 1) || (piece.color === 1 && startY === 6))) {
        // Controlla se le posizioni target e intermedie sono occupate da un pezzo
        const intermediatePosition = String.fromCharCode('a'.charCodeAt(0) + startX) + (startY + dirY + 1).toString();
        if (chessPieces.find(currPiece => (currPiece.position === end || currPiece.position === intermediatePosition) && currPiece.inGame === true)) {
            return false;
        }
    }
    // Se il pedone sta catturando in diagonale
    else if (Math.abs(endX - startX) === 1 && endY === startY + dirY) {
        // Controlla se la posizione target è occupata da un pezzo dell'altro colore
        if (!chessPieces.find(currPiece => currPiece.position === end && currPiece.color !== piece.color && currPiece.inGame === true)) {
            return false;
        }
    }
    // Se il pedone non si muove in avanti di una o due caselle o non sta catturando in diagonale, la mossa non è valida
    else {
        return false;
    }

    return true;
}

function isPathClearKing(piece, targetPosition) {
    const start = piece.position;
    const end = targetPosition;

    // Converti le posizioni in coordinate numeriche
    const startX = start.charCodeAt(0) - 'a'.charCodeAt(0);
    const startY = parseInt(start[1]) - 1;
    const endX = end.charCodeAt(0) - 'a'.charCodeAt(0);
    const endY = parseInt(end[1]) - 1;

    // Controlla se il re si sta muovendo di una casella in qualsiasi direzione
    if (Math.abs(endX - startX) <= 1 && Math.abs(endY - startY) <= 1) {
        // Controlla se la posizione target è occupata da un pezzo dello stesso colore
        if (chessPieces.find(currPiece => currPiece.position === end && currPiece.color === piece.color && currPiece.inGame === true)) {
            return false;
        }
    }
    // Se il re non si muove di una casella in qualsiasi direzione, la mossa non è valida
    else {
        return false;
    }

    return true;
}

function movePiece(arg,needToMove = true, needToSave = true) {

    try{
        var chessPiece = arg[0];
        var movestring = arg[1].split("-");

        var fromCellId = movestring[0];
        var toCellId = movestring[1];
        var eat = movestring[2];

        

        if(fromCellId === 'O' && toCellId === 'O'){
            var rookFrom, rookTo, kingTo;
            if (eat === 'false'){
                if(chessPiece.color === 0)
                    rookFrom = 'h1', rookTo = 'f1', kingTo = 'g1';
                else if(chessPiece.color === 1)
                    rookFrom = 'h8', rookTo = 'f8', kingTo = 'g8';
            }else if(eat === 'O'){
                if(chessPiece.color === 0)
                    rookFrom = 'a1', rookTo = 'd1', kingTo = 'c1';
                else if(chessPiece.color === 1)
                    rookFrom = 'a8', rookTo = 'd8', kingTo = 'c8';
            }
                
            rookPiece = chessPieces.find(piece => piece.name === 'R' && piece.position === rookFrom && piece.inGame === true);
            if(rookPiece){
                chessPiece.position = kingTo;
                rookPiece.position = rookTo;
                if(needToMove){
                    document.getElementById(kingTo).appendChild(document.getElementById(chessPiece.id));
                    document.getElementById(rookTo).appendChild(document.getElementById(rookPiece.id));
                }
            }else{
                return false;
            }
            
            return true;
        }
        
        let fromCell = document.getElementById(fromCellId);
        let toCell = document.getElementById(toCellId);
        let piece;

        if(rec){
            //console.log("Rec",chessPiece);
            recMoves.push(reverseConvertNotation(chessPiece,toCellId,eat === 'true'));
            console.log("rec",recMoves);
        }

        if(eat === 'true'){
            targetPiece = chessPieces.find(piece => piece.position === toCellId && piece.inGame === true);
            targetPiece.inGame = false;
            
            if(needToMove){
                toCell.removeChild(toCell.querySelector('.chess-piece'));
                //console.log("delll")
            }
        }

        

        // Seleziona il pezzo nella cella di partenza
        if(needToMove){
            piece = fromCell.querySelector('.chess-piece');
            if (!piece) {
                console.error('Non c\'è un pezzo nella cella di partenza:', fromCellId);
                return;
            }
        }
        
        chessPiece.position = toCellId;

        if(needToSave){
            var lastMove = fromCellId + '-' + toCellId + '-';
            if(eat === 'true')
                lastMove += targetPiece.id.toString();
            else
                lastMove += "0";
            chessboardHistory.push(lastMove);
        }

        // Sposta il pezzo alla cella di arrivo
        if(needToMove)
            toCell.appendChild(piece);
        //console.log("chessPiece_________", chessPieces);

        
        return true;
    }catch(e){
        console.error(e)
        return false;
    }
}

/*
document.getElementById('move').addEventListener('click', function() {
    move = prompt('Inserisci la mossa (ad esempio, "e2-e4"):');
    //movePiece(move);
    //move = "Rb1+";
    movePiece(convertNotation(move,pathNameStack.length % 2));
});
*/

function showChessboard(color) {
    var table = document.createElement('table');
    table.id = 'chessBoard';
    var fragment = document.createDocumentFragment();
    var tr, td,position,div,piece,className,ball,textDiv,corners;

    var piecesMap = {};
    chessPieces.forEach(function(piece) {
        if (piece.inGame === true) {
            piecesMap[piece.position] = piece;
    }
    });

    //console.error("color", color);
    var start_col = color === Black ? 1 : 8;
    var end_col = color === Black ? 9 : 0;
    var step = color === Black ? 1 : -1;

    var start_row = color === Black ? 8 : 1;
    var end_row = color === Black ? 0 : 9;


    for (var i = start_col; i !== end_col; i += step) {
        tr = document.createElement('tr');
        for (var j = start_row; j !== end_row; j -= step) {
            td = document.createElement('td');
            position = String.fromCharCode(96 + j) + i;
            td.id = position;
            className = '';

            ball = document.createElement('div');
            ball.className ='incell ball';
            ball.style.visibility = 'hidden';
            td.appendChild(ball);

            corners = document.createElement('div');
            corners.className = 'incell corners';
            corners.style.visibility = 'hidden';
            td.appendChild(corners);

/*
            if (i === end_col-step) {
                className += 'letter ';
                textDiv = document.createElement('div');
                textDiv.textContent = String.fromCharCode(96 + j);
                td.appendChild(textDiv);
                if (j === end_row+step){
                    var div = document.createElement('div');
                    div.setAttribute('class', 'number-one');
                    div.textContent = '1';
                    td.appendChild(div);
                }
            } else if (j === end_row+step) {
                className += 'number ';
                textDiv = document.createElement('div');
                textDiv.textContent = i;
                td.appendChild(textDiv);
            }
            */
            className += (i + j) % 2 === 1 ? 'white' : 'black';
            td.className = className;
            //console.log("position", position);
            if (piecesMap[position]) {
                //console.log("piecesMap[position]", piecesMap[position]);
                piece = piecesMap[position];
                
                div = document.createElement('div');
                //div.className = 'chess-piece ' + (piece.type === 'R' ? 'rook' : 'knight') + '-' + (piece.color === 0 ? 'white' : 'black');
                className = 'chess-piece ';
                switch(piece.name){
                    case "R":
                        className += 'rook';
                        break;
                    case "N":
                        className += 'knight';
                        break;
                    case "B":
                        className += 'bishop';
                        break;
                    case "Q":
                        className += 'queen';
                        break;
                    case "K":
                        className += 'king';
                        //console.error("king", position);
                        break;
                    case "P":
                        className += 'pawn';
                        break;
                }
                className += '-' + (piece.color === 0 ? 'white' : 'black');
                //console.log("className", className);
                div.className = className;
                div.setAttribute('draggable', true);
                div.id = piece.id;
                td.appendChild(div);
            }
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    fragment.appendChild(table);
    //table.appendChild(fragment);

    var oldChessboard = document.getElementById('chessBoard');
    oldChessboard.parentNode.replaceChild(fragment, oldChessboard);
    //document.body.appendChild(table);
}

async function updateGist(gistId, token, filename, content) {
    const url = `https://api.github.com/gists/${gistId}`;
    const data = {
        files: {
            [filename]: {
                content: content
            }
        }
    };

    const response = await fetch(url, {
        method: 'PATCH',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const jsonData = await response.json();
    return jsonData;
}

async function getGist(gistId) {
    const url = `https://api.github.com/gists/${gistId}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const jsonData = await response.json();
    return jsonData;
}

async function getGistContent(gistId, filename) {
    const gist = await getGist(gistId);
    return gist.files[filename].content;
}

/*
async function aa(){
    var githubData = await getGistContent('','dbchess.txt');
    console.log(githubData)

    await updateGist('','','dbchess.txt','eoo');

    githubData = await getGistContent('','dbchess.txt');
    console.log(githubData)
}
aa()
*/

document.addEventListener('DOMContentLoaded', startingFunction);


//cosa da modificare
//invece di usare il tag a href nel displayPath usare un bottone per non dover aggiornare la pagina


