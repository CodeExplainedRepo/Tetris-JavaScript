const cvs = document.getElementById("tetris");
const ctx = cvs.getContext("2d");
const scoreElement = document.getElementById("score");

const ROW = 20;
const COL = COLUMN = 10;
const VACANT = "WHITE"; // the color of an empty square
const SQ = SquareSize = 20;

// draw a square

function drawSquare(x,y,color){
    ctx.fillStyle = color;
    ctx.fillRect(x*SQ,y*SQ,SQ,SQ);
    ctx.strokeStyle = "BLACK";
    ctx.strokeRect(x*SQ,y*SQ,SQ,SQ);
}

// create the board

let board = [];
for(r = 0; r < ROW; r++){
    board[r] = [];
    for(c = 0; c < COL; c++){
        board[r][c] = VACANT;
    }
}

// draw the board

function drawBoard(){
    for(r = 0; r < ROW; r++){
        for(c = 0; c < COL; c++){
            drawSquare(c,r,board[r][c]);
        }
    }
}

drawBoard();

// the pieces and their colors

const PIECES = [
    [Z,"red"],
    [S,"green"],
    [L,"yellow"],
    [T,"cyan"],
    [I,"orange"],
    [O,"blue"],
    [J,"purple"]
]

// random piece

function randomPiece(){
    let r = randomN = Math.floor(Math.random() * PIECES.length); // num : 0 -> 6
    
    return new Piece(PIECES[r][0] ,PIECES[r][1] );
}

let p = randomPiece();

// the object Piece

function Piece(tetromino,color){
    this.tetromino = tetromino;
    this.tetrominoN = 0;
    this.activeTetromino = this.tetromino[this.tetrominoN];
    this.color = color;
    
    this.x = 3; // 3 squares from the left
    this.y = -2; // -2 squares from the top
}

// fill function

Piece.prototype.fill = function(color){
    for(r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length; c++){
            if( this.activeTetromino[r][c]){
                drawSquare(this.x + c, this.y + r, color);
            }
        }
    }
}

// draw a piece

Piece.prototype.draw = function(){
    this.fill(this.color);
}

// undraw a piece

Piece.prototype.unDraw = function(){
    this.fill(VACANT);
}

// move down the piece

Piece.prototype.moveDown = function(){
    if(!this.collision(0,1,this.activeTetromino)){
        this.unDraw();
        this.y++;
        this.draw();
    }else{
        this.lock();
        p = randomPiece();
    }
    
}

// move left

Piece.prototype.moveLeft = function(){
    if(!this.collision(-1,0,this.activeTetromino)){
        this.unDraw();
        this.x--;
        this.draw();
    }
}

// move Right

Piece.prototype.moveRight = function(){
    if(!this.collision(1,0,this.activeTetromino)){
        this.unDraw();
        this.x++;
        this.draw();
    }
}

// rotate function

Piece.prototype.rotate = function(){
    let nextPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
    let kick = 0;
    
    if(this.collision(0,0,nextPattern)){
        if( this.x > COL/2){
            // right wall
            kick = -1;
        }else{
            // left wall
            kick = 1;
        }
    }
    
    if(!this.collision(kick,0,nextPattern)){
        this.unDraw();
        this.x += kick;
        this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length;
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.draw();
    }
}

// colision detection

Piece.prototype.collision = function(x,y,piece){
    for(r = 0; r < piece.length; r++){
        for(c = 0; c < piece.length; c++){
            // we skip the vacant squares
            if( ! piece[r][c]){
                continue;
            }
            let newX = this.x + c + x;
            let newY = this.y + r + y;
            
            if(newX < 0 || newX >= COL || newY >= ROW){
                return true;
            }
            if(newY < 0){
                // newY less than 0, will crash the game
                continue;
            }
            if(board[newY][newX] != VACANT){
                // the piece will hit a locked piece
                return true;
            }
        }
    }
    return false;
}

// lock a piece;

let score = 0;

Piece.prototype.lock =function(){
    for(r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length; c++){
            if( !this.activeTetromino[r][c]){
                continue;
            }
            if(this.y + r < 0){
                alert("Game Over");
                // stop the drop function
                gameOver = true;
                break;
            }
            board[this.y + r][this.x + c] = this.color;
        }
    }
    
    // remove a full row
    for( r = 0; r < ROW; r++){
        let isRowFull = true;
        for(c = 0; c < COL; c++){
            isRowFull = isRowFull && (board[r][c] != VACANT);
        }
        if(isRowFull){
            // move down all the rows above this row
            for( y = r; y > 1; y--){
                for( c = 0; c < COL; c++){
                    board[y][c] = board[y -1][c];
                }
            }
            // top row has no row above it
            for( c = 0; c < COL; c++){
                board[0][c] = VACANT;
            }
            score += 10;
        }
    }
    // update the board
    drawBoard();
    
    // update the score
    scoreElement.innerHTML = score;
}

// control the piece
document.addEventListener("keydown",CONTROL);

function CONTROL(event){
    if(event.keyCode == 37){
        p.moveLeft();
        dropStart = Date.now();
        
    }else if(event.keyCode == 38){
        p.rotate();
        dropStart = Date.now();
        
    }else if(event.keyCode == 39){
        p.moveRight();
        dropStart = Date.now();
        
    }else if(event.keyCode == 40){
        p.moveDown();
        
    }
}

// drop the piece every 1 sec

let dropStart = Date.now();
let gameOver = false;

function draw(){
    let now = Date.now();
    
    let delta = now - dropStart;
    
    if( delta > 1000 ){
        p.moveDown();
        dropStart = Date.now();
    }
    if(! gameOver){
        requestAnimationFrame(draw);
    }
}

draw();