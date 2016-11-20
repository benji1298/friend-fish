var app = require('http').createServer()

app.listen(8900)
app.listen(3000)

function Player(socket) {
    var self = this
    this.socket = socket
    this.name = ""
    this.game = {}

    this.socket.on("playerMove", function(col) {
        self.game.playerMove(self, col)
    })
}

Player.prototype.joinGame = function(game) {
    this.game = game
}

function Game() {
    this.io = require('socket.io')(app)
	// Create 7 column, 6 row board [x][y]
    this.board = [
        ["", "", "", "", "", ""],
        ["", "", "", "", "", ""],
        ["", "", "", "", "", ""],
        ["", "", "", "", "", ""],
        ["", "", "", "", "", ""],
        ["", "", "", "", "", ""],
        ["", "", "", "", "", ""]
    ]
    this.player1 = null
    this.player2 = null
    this.currentTurn = "X"
    this.moveCount = 0
    this.started = false
    this.addHandlers()
}

Game.prototype.addHandlers = function() {
    var game = this

    this.io.sockets.on("connection", function(socket) {
        game.addPlayer(new Player(socket))
    })
}

Game.prototype.addPlayer = function(player) {
    console.log("adding player")
    if (this.player1 === null) {
        this.player1 = player
        this.player1["game"] = this
        this.player1["name"] = "X"
        this.player1.socket.emit("name", "X")
    } else if (this.player2 === null) {
        this.player2 = player
        this.player2["game"] = this
        this.player2["name"] = "O"
        this.player2.socket.emit("name", "O")
        this.startGame()
    }
}

Game.prototype.announceWin = function(player, type) {
    this.player1.socket.emit("win", player["name"], type)
    this.player2.socket.emit("win", player["name"], type)
    this.resetGame()
}

Game.prototype.gameOver = function() {
    this.player1.socket.emit("gameOver")
    this.player2.socket.emit("gameOver")
}

Game.prototype.playerMove = function(player, col) {
    if (player["name"] !== this.currentTurn || col >= 8 || col < 0) {
        return
    }

	var y;
	// Loop through the board and find an open index
	for (y = 0; y <= this.board[col].size(); y++) {
		if(y == this.board[col].size()) {
			return
		}
		if(this.board[col][y] == "") {
			this.board[col][y] = player["name"]
			break
		}
	}
	
    this.player1.socket.emit("playerMove", player["name"], col, y)
    this.player2.socket.emit("playerMove", player["name"], col, y)

	var count = 0
    var target = 4
    //check col
    for (var i = 0; i < this.board[col].size(); i++) {
        if (this.board[col][i] == player["name"]) {
            count ++
			if(count == target) {
				this.announceWin(player, {
					type: "col",
					num: col
				})
				return
			}
        } else {
			count = 0
		}
    }

	count = 0
    // Check col
    for (var i = 0; i < this.board.size(); i++) {
        if (this.board[i][y] == player["name"]) {
            count ++
			if(count == target) {
				this.announceWin(player, {
					type: "col",
					num: col
				})
				return
			}
        } else {
			count = 0
		}
    }

	count = 0
	
    // TODO: Check diags - This will not work properly for connect 4
	var xTemp = col
	var yTemp = y
	while(yTemp > 0 && xTemp > 0) {
		xTemp --
		yTemp --
	}
	for(;xTemp < this.board.size() && yTemp < this.board[0].size(); xTemp++, yTemp++) {
		if (this.board[xTemp][yTemp] == player["name"]) {
            count ++
			if(count == target) {
				this.announceWin(player, {
					type: "diag",
					coord: {
						x: xTemp,
						y: yTemp
					},
					anti: false
				})
				return
			}
        } else {
			count = 0
		}
	}
	
	xTemp = col
	yTemp = y
	while(yTemp > 0 && xTemp < this.board.size()) {
		xTemp ++
		yTemp --
	}
	for(;xTemp < this.board.size() && yTemp < this.board[0].size(); xTemp--, yTemp++) {
		if (this.board[xTemp][yTemp] == player["name"]) {
            count ++
			if(count == target) {
				this.announceWin(player, {
					type: "diag",
					coord: {
						x: xTemp,
						y: yTemp
					},
					anti: true
				})
				return
			}
        } else {
			count = 0
		}
	}

    if (this.moveCount === this.board.size() * this.board[0].size()) {
        this.player1.socket.emit("draw")
        this.player2.socket.emit("draw")
        this.resetGame()
        return
    }

    this.moveCount++
    if (player["name"] === "X") {
        this.currentTurn = "O"
        this.player1.socket.emit("currentTurn", "O")
        this.player2.socket.emit("currentTurn", "O")
    } else {
        this.currentTurn = "X"
        this.player1.socket.emit("currentTurn", "X")
        this.player2.socket.emit("currentTurn", "X")
    }
}

Game.prototype.resetGame = function() {
    var self = this
    var player1Ans = null
    var player2Ans = null

    var reset = function() {
        if (player1Ans === null || player2Ans === null) {
            return
        } else if ((player1Ans & player2Ans) === 0) {
            self.gameOver()
            process.exit(0)
        }

		// Create 7 column, 6 row board [x][y]
		self.board = [
			["", "", "", "", "", ""],
			["", "", "", "", "", ""],
			["", "", "", "", "", ""],
			["", "", "", "", "", ""],
			["", "", "", "", "", ""],
			["", "", "", "", "", ""],
			["", "", "", "", "", ""]
		]
        self.moveCount = 0

        if (self.player1["name"] === "X") {
            self.player1["name"] = "O"
            self.player1.socket.emit("name", "O")
            self.player2["name"] = "X"
            self.player2.socket.emit("name", "X")
        } else {
            self.player1["name"] = "X"
            self.player1.socket.emit("name", "X")
            self.player2["name"] = "O"
            self.player2.socket.emit("name", "O")
        }

        self.startGame()
    }

    this.player1.socket.emit("gameReset", function(ans) {
        player1Ans = ans
        reset()
    })
    this.player2.socket.emit("gameReset", function(ans) {
        player2Ans = ans
        reset()
    })
}

Game.prototype.startGame = function() {
    this.player1.socket.emit("startGame")
    this.player2.socket.emit("startGame")
}

// Start the game server
var game = new Game()