var app = require('http').createServer()

app.listen(3000)

console.log("Listening on port 3000")

function Player(socket) {
    var self = this
    this.socket = socket
    this.name = ""
    this.game = {}
    this.image = {}

    this.socket.on("disconnect", function() {
	if(self.game.player1 == self) {
	    self.game.player1 = self.game.player2
	    self.game.player2 = null
	} else if(self.game.player2 == self) {
	    self.game.player2 = null
	}
	self.game.moveCount = 0
	self.game.board = [["", "", "", "", "", "", ""],
			   ["", "", "", "", "", "", ""],
			   ["", "", "", "", "", "", ""],
			   ["", "", "", "", "", "", ""],
			   ["", "", "", "", "", "", ""],
			   ["", "", "", "", "", "", ""],
			   ["", "", "", "", "", "", ""]]
    })

    this.socket.on("image", function(data) {
	console.log("image received")
	self.image = data
	if(self.game.player1 && self != self.game.player1) {
	    self.game.player1.socket.emit("image", self.image)
	} else if (self.game.player2 && self != self.game.player2) {
	    self.game.player2.socket.emit("image", self.image)
	}
    })

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
        ["", "", "", "", "", "", ""],
        ["", "", "", "", "", "", ""],
        ["", "", "", "", "", "", ""],
        ["", "", "", "", "", "", ""],
        ["", "", "", "", "", "", ""],
        ["", "", "", "", "", "", ""],
        ["", "", "", "", "", "", ""]
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
    if (this.player1 === null) {
        this.player1 = player
        this.player1["game"] = this
        this.player1["name"] = "X"
        this.player1.socket.emit("name", "X")
	console.log("added player X")
    } else if (this.player2 === null) {
        this.player2 = player
        this.player2["game"] = this
        this.player2["name"] = "O"
        this.player2.socket.emit("name", "O")
        this.startGame()
	if(this.player1.image) {
	    this.player2.socket.emit("image", this.player1.image)
	}	
	console.log("added player O")
    }
}

Game.prototype.announceWin = function(player, locations) {
    console.log("win")
    this.player1.socket.emit("win", player["name"], locations)
    this.player2.socket.emit("win", player["name"], locations)
    this.resetGame()
}

Game.prototype.gameOver = function() {
    this.player1.socket.emit("gameOver")
    this.player2.socket.emit("gameOver")
}

Game.prototype.playerMove = function(player, col) {
    console.log(player["name"] + ": " + col)
    if (player["name"] !== this.currentTurn || !this.player1 || !this.player2 || col >= this.board.length || col < 0) {
        return
    }
	var y;

	// Loop through the board and find an open index
	for (y = 0; y <= this.board[col].length; y++) {
		if(y == this.board[col].length) {
			return
		}
		if(this.board[col][y] == "") {
			this.board[col][y] = player["name"]
			break
		}
	}


	console.log("placed at " + col + ", " + y)

    this.player1.socket.emit("playerMove", player["name"], col, y)
    this.player2.socket.emit("playerMove", player["name"], col, y)

	var count = 0
    var target = 4
    //check col
    for (var i = 0; i < this.board[col].length; i++) {
        if (this.board[col][i] == player["name"]) {
            count ++
			if(count == target) {
				this.announceWin(player, [
					{x: col, y: i},
					{x: col, y: i - 1},
					{x: col, y: i - 2},
					{x: col, y: i - 3}
				])
				return
			}
        } else {
			count = 0
		}
    }

	count = 0
    // Check row
    for (var i = 0; i < this.board.length; i++) {
        if (this.board[i][y] == player["name"]) {
            count ++
			if(count == target) {
				this.announceWin(player, [
					{x: i, y: y},
					{x: i - 1, y: y},
					{x: i - 2, y: y},
					{x: i - 3, y: y}
				])
				return
			}
        } else {
			count = 0
		}
    }

	count = 0
	
    // Check diags
	var xTemp = col + 1
	var yTemp = y + 1
	count = 1
	var spots = [{x: col, y: y}];
	for(;xTemp < this.board.length && yTemp < this.board[0].length; xTemp++, yTemp++) {
		if (this.board[xTemp][yTemp] == player["name"]) {
            		count ++
			spots.push({x: xTemp, y: yTemp})
			if(count == target) {
				this.announceWin(player, spots)
				return
			}
        }
	}
	var xTemp = col - 1
	var yTemp = y - 1
	for(;xTemp >= 0 && yTemp >= 0; xTemp--, yTemp--) {
		if (this.board[xTemp][yTemp] == player["name"]) {
            		count ++
			spots.push({x: xTemp, y: yTemp})
			if(count == target) {
				this.announceWin(player, spots)
				return
			}
        	}
	}

	var xTemp = col - 1
	var yTemp = y + 1
	count = 1
	spots = [{x: col, y: y}]
	for(;xTemp >= 0 && yTemp < this.board[0].length; xTemp--, yTemp++) {
		if (this.board[xTemp][yTemp] == player["name"]) {
            		count ++
			spots.push({x: xTemp, y: yTemp})
			if(count == target) {
				this.announceWin(player, spots)
				return
			}
        }
	}
	var xTemp = col + 1
	var yTemp = y - 1
	for(;xTemp < this.board.length && yTemp >= 0; xTemp++, yTemp--) {
		if (this.board[xTemp][yTemp] == player["name"]) {
            		count ++
			spots.push({x: xTemp, y: yTemp})
			if(count == target) {
				this.announceWin(player, spots)
				return
			}
		}
	}

    if (this.moveCount === this.board.length * this.board[0].length) {
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
//    var player1Ans = null
//    var player2Ans = null

  //  var reset = function() {
    //    if (player1Ans === null || player2Ans === null) {
      //      return
        //} else if ((player1Ans & player2Ans) === 0) {
        //    self.gameOver()
        //    process.exit(0)
        //}

		// Create 7 column, 6 row board [x][y]
		self.board = [
			["", "", "", "", "", "", ""],
			["", "", "", "", "", "", ""],
			["", "", "", "", "", "", ""],
			["", "", "", "", "", "", ""],
			["", "", "", "", "", "", ""],
			["", "", "", "", "", "", ""],
			["", "", "", "", "", "", ""]
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

        setTimeout(function() {
	    self.startGame()
	}, 4000);
//    }

//    this.player1.socket.emit("gameReset", function(ans) {
//        player1Ans = ans
//        reset()
//    })
//    this.player2.socket.emit("gameReset", function(ans) {
//        player2Ans = ans
//        reset()
//    })
}

Game.prototype.startGame = function() {
    this.player1.socket.emit("currentTurn", this.currentTurn)
    this.player2.socket.emit("currentTurn", this.currentTurn)

    //this.player1.socket.emit("startGame")
    //this.player2.socket.emit("startGame")
}

// Start the game server
var game = new Game()
