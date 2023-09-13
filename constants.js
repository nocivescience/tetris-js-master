const GAME_CLOCK = 1000 
const BLOCK_SIDE_LENGTH = 30 
const ROWS = 20 
const COLS = 10 
const SCORE_WORTH = 10 
const myRange = document.getElementById("myRange");

const SHAPES = [
    [],
    [
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0]
    ], 

    [
        [2,0,0],
        [2,2,2],
        [0,0,0],
    ],

    [
        [0,0,3],
        [3,3,3],
        [0,0,0],
    ],

    [
        [4,4],
        [4,4],
    ],

    [
        [0,5,5],
        [5,5,0],
        [0,0,0],
    ],

    [
        [0,6,0],
        [6,6,6],
        [0,0,0],
    ],

    [
        [7,7,0],
        [0,7,7],
        [0,0,0],
    ],

]

const musica= new Audio();
musica.src = "tetris.mp3";

const COLORS = [
    '#000000',
    '#FF0000',
    '#00FF00',
    '#0000FF',
    '#FFFF00',
    '#00FFFF',
    '#10FF01',
    '#F000FF'
]

class Piece {
    constructor(shape, ctx) {
        this.shape = shape 
        this.ctx = ctx 
        this.y = 0 
        this.x = Math.floor(COLS / 2)
    }

    renderPiece() {
        this.shape.map((row, i) => {
            row.map((cell, j) => {
                if (cell > 0) {
                    this.ctx.fillStyle = COLORS[cell] 
                    this.ctx.fillRect(this.x + j, this.y + i, 1, 1)
                    this.ctx.strokeStyle = "black"
                    this.ctx.lineWidth = 0.05
                    this.ctx.strokeRect(this.x +j, this.y+i, 1, 1)
                }
            })
        })
    }
}
class GameModel {
    constructor(ctx) {
        this.ctx = ctx 
        this.fallingPiece = null // piece
        this.grid = this.makeStartingGrid()
    }

    makeStartingGrid() {
        let grid = [] 
        for (var i = 0; i < ROWS; i++) {
            grid.push([])
            for (var j = 0; j < COLS; j++) {
                grid[grid.length - 1].push(0)
            }
        }
        return grid 
    }

    collision(x, y) {
        const shape = this.fallingPiece.shape 
        const n = shape.length 
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (shape[i][j] > 0) {
                    let p = x + j 
                    let q = y + i  
                    if (p >= 0 && p < COLS && q < ROWS) {
                        // in bounds
                        if (this.grid[q][p] > 0) {
                            return true
                        }
                    } else {
                        return true
                    }
                }
            }
        }
        return false
    }

    renderGameState() {
        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[i].length; j++) {
                let cell = this.grid[i][j] 
                this.ctx.fillStyle = COLORS[cell] 
                this.ctx.fillRect(j, i, 1, 1)
                this.ctx.strokeStyle = "black"
                this.ctx.lineWidth = 0.05
                this.ctx.strokeRect(j, i, 1, 1)
            }
        }

        if (this.fallingPiece !== null) {
            this.fallingPiece.renderPiece()
        }
    }

    moveDown() {
        if (this.fallingPiece === null) {
            this.renderGameState() 
        } else if (this.collision(this.fallingPiece.x, this.fallingPiece.y + 1)) {
            const shape = this.fallingPiece.shape 
            const x = this.fallingPiece.x 
            const y = this.fallingPiece.y 
            shape.map((row, i) => {
                row.map((cell, j) => {
                    let p = x + j 
                    let q = y + i 
                    if (p >= 0 && p < COLS && q < ROWS && cell > 0) {
                        this.grid[q][p] = shape[i][j]
                    }
                })
            })

            // check game over 
            if (this.fallingPiece.y === 0) {
                alert("Game over!") 
                this.grid = this.makeStartingGrid()
            }
            this.fallingPiece = null
        } else {
            this.fallingPiece.y += 1
        }
        this.renderGameState()
    }

    move(right) {
        let x = this.fallingPiece.x 
        let y = this.fallingPiece.y 
        if (right) {
            // move right
            if (!this.collision(x + 1, y)) {
                this.fallingPiece.x += 1
            }
        } else {
            // move left
            if (!this.collision(x - 1, y)) {
                this.fallingPiece.x -= 1
            }
        }
        this.renderGameState()
    }

    rotate() {
        if (this.fallingPiece !== null) {
            let shape = [...this.fallingPiece.shape.map((row) => [...row])]
            // transpose of matrix 
            for (let y = 0; y < shape.length; ++y) {
                for (let x = 0; x < y; ++x) {
                    [shape[x][y], shape[y][x]] = 
                    [shape[y][x], shape[x][y]]
                }
            }
            // reverse order of rows 
            shape.forEach((row => row.reverse()))
            if (!this.collision(this.fallingPiece.x, this.fallingPiece.y, shape)) {
                this.fallingPiece.shape = shape
            }
        }
        this.renderGameState()
    }
}
// setup 

let canvas = document.getElementById("game-canvas") 
let scoreboard = document.getElementById("scoreboard") 
let ctx = canvas.getContext("2d") 
ctx.scale(BLOCK_SIDE_LENGTH, BLOCK_SIDE_LENGTH) 
let model = new GameModel(ctx)

let score = 0 

setInterval(() => {
    newGameState()
}, GAME_CLOCK); 

function minmax( min, max){
    return Math.floor(Math.random() * (max - min + 1) + min);
}
function movingCanvas(){
    canvas.style.transform = `translateX(${minmax(-15,15)}px)`;
    // canvas.style.opacity = minmax(0,1);
    canvas.style.filter = `blur(${minmax(0,8)}px)`;;
    requestAnimationFrame(movingCanvas);
}
movingCanvas();


let newGameState = () => {
    fullSend() 
    if (model.fallingPiece === null) {
        const rand = Math.round(Math.random() * 6) + 1
        const newPiece = new Piece(SHAPES[rand], ctx) 
        model.fallingPiece = newPiece 
        model.moveDown()
    } else {
        model.moveDown()
    }
}

const fullSend = () => {
    const allFilled = (row) => {
        for (let x of row) {
            if (x === 0) {
                return false
            }
        }
        return true
    }

    for (let i = 0; i < model.grid.length; i++) {
        if (allFilled(model.grid[i])) {
            score += SCORE_WORTH 
            model.grid.splice(i, 1) 
            model.grid.unshift([0,0,0,0,0,0,0,0,0,0])
        }
    }

    scoreboard.innerHTML = "Score: " + String(score)
}

document.addEventListener("keydown", (e) => {
    e.preventDefault() 
    switch(e.key) {
        case "w":
            model.rotate() 
            setInterval(() => {
                musica.play();
                musica.loop = true;
                musica.volume = parseFloat(myRange.value);
            }, 100);
            break 
        case "d":
            model.move(true) 
            break 
        case "s": 
            model.moveDown() 
            break 
        case "a":
            model.move(false) 
            break
    }
})