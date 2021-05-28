/* Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */
class Game {
  constructor(rows, columns) {
    this.width = columns;
    this.height = rows;
    this.currPlayer = 0;  //invalid, must be 1 or 2. 0 is "not in a game". -1 is "tie"
    this.board = this.makeBoard();
    this.htmlBoard = this.makeHtmlBoard();  //The DOM UI gameboard
    document.querySelector("#column-top").addEventListener("click", (e) => {
      this.handleClick(+(e.target.id));
    });
    document.querySelector("#newGame").addEventListener("click", (e) => {
      e.preventDefault();
      this.initGame();
    });
    document.querySelector("#color1").addEventListener("change", (e) => {
      e.preventDefault();
      this.setColor(1, e.target.value) ;
    });
    document.querySelector("#color2").addEventListener("change", (e) => {
      e.preventDefault();
      this.setColor(2, e.target.value) ;
    });
  }

/*
  Make sure to give the stylesheet an id and then reference it as ("link" + id).sheet
  Make sure to place the style in a specific order such that it can be referenced by index
  unless you really want to parse to find the style (using regular expressions maybe)
  Remember that although the text in the stylesheet has spaces such as .piece .p1 the 
  insertRule method requires that such spaces be eliminated as in .piece .p1 becomes insertRul(".piece.p1", index)
  The entire style must be rewritten so unless you want to parse for individual settings make sure to create
  simple style rules containing only the item you want to change such as background-color.
*/
  setColor(playerIndex, color) {
    let theSheet = document.querySelector("link#c4css").sheet;
    theSheet.deleteRule(playerIndex + 2);
    let ruleIndex = theSheet.insertRule(`.piece.p${playerIndex} {background-color: ${color}}`, playerIndex + 2);
    return ruleIndex;
}

  initGame() {
    this.currPlayer = 1;
    this.setColor(1, document.querySelector("#color1").value);
    this.setColor(2, document.querySelector("#color2").value);
    this.board = this.makeBoard();
    let allPieces = document.querySelectorAll('.piece');
    try {
      allPieces.forEach((e)=>e.remove());
    } catch(e) {console.log(e)}
  }

/* makeBoard: create in-JS board structure:
  board = array of rows, each row is array of cells  (board[y][x])
*/
  makeBoard() {
    this.board = [];
    for (let y = 0; y < this.height; y++) {
      this.board.push(Array.from({length: this.width }));
    }
    return this.board;
  }

  /* makeHtmlBoard: make HTML table and row of column tops. */
  makeHtmlBoard() {
    this.htmlBoard = document.getElementById('board');
    if(!this.htmlBoard) {
      this.htmlBoard = document.createElement('table');
      this.htmlBoard.setAttribute('id', 'board');
    }
    else {  //We're starting a new game so rather than recreating the board just clear it
      let pieces = document.querySelectorAll('piece');
      pieces.forEach(piece=>piece.remove());
    }
    // make column tops (clickable area for adding a piece to that column)
    const top = document.createElement('tr');
    top.setAttribute('id', 'column-top');
//    const clickHandler = this.handleClick.bind(this);
//    top.addEventListener('click', this.handleClick);

    for (let x = 0; x < this.width; x++) {
      let headCell = document.createElement('td');
      headCell.setAttribute('id', x);
      top.append(headCell);
    }

    this.htmlBoard.append(top);

    // make main part of board
    for (let y = 0; y < this.height; y++) {
      let row = document.createElement('tr');
      for (let x = 0; x < this.width; x++) {
        let cell = document.createElement('td');
        cell.setAttribute('id', `${y}-${x}`);
        row.append(cell);
      }

      this.htmlBoard.append(row);
    }
    return this.htmlBoard;
  }

/* findSpotForCol: given column x, return top empty y (null if filled) */

  findSpotForCol(x) {
    for (let y = this.height - 1; y >= 0; y--) {
      if (!this.board[y][x]) {
        return y;
      }
    }
    return null;
  }

/* placeInTable: update DOM to place piece into HTML table of board */

  placeInTable(y, x) {
    const piece = document.createElement('div');
    piece.classList.add('piece');
    piece.classList.add(`p${this.currPlayer}`);
//    piece.style.top = -50 * (y + 2);

    const spot = document.getElementById(`${y}-${x}`);
    spot.append(piece);
  }

/* endGame: announce game end */

  endGame(msg) {
    this.currPlayer = 0;
    alert(msg);
  }

/* handleClick: handle click of column top to play piece */

  handleClick(x) {
    if(this.currPlayer === 0)return;

    // get next spot in column (if none, ignore click)
    const y = this.findSpotForCol(x);
    if (y === null) {
      return;
    }

    // place piece in board and add to HTML table
    this.board[y][x] = this.currPlayer;
    this.placeInTable(y, x);
    
    // check for win
    if (this.checkForWin()) {
      return this.endGame(`Player ${this.currPlayer} won!`);
    }
    
    // check for tie
    if (this.board.every(row => row.every(cell => cell))) {
      return this.endGame('Tie!');
    }
      
    // switch players
    this.currPlayer = this.currPlayer === 1 ? 2 : 1;
  };

/* checkForWin: check board cell-by-cell for "does a win start here?" */

  checkForWin() {
    const _win = function(cells) {
      // Check four cells to see if they're all color of current player
      //  - cells: list of four (y, x) cells
      //  - returns true if all are legal coordinates & all match currPlayer

      return cells.every(
        ([y, x]) =>
          y >= 0 &&
          y < this.height &&
          x >= 0 &&
          x < this.width &&
          this.board[y][x] === this.currPlayer
      );
    }.bind(this);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        // get "check list" of 4 cells (starting here) for each of the different
        // ways to win
        const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
        const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
        const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
        const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];

        // find winner (only checking each win-possibility as needed)
        if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
          return true;
        }
      }
    }
  }
}

let game = null;
window.addEventListener("DOMContentLoaded", (e) => {
  game = new Game(6, 7);
});