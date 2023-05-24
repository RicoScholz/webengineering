const cells = document.querySelector('#board').children;

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameOver = false;

function makeMove(index) {
    if (!gameOver && !board[index]) {
        board[index] = currentPlayer;
        cells[index].innerText = currentPlayer;
        endTurn();
    }
}

function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameOver = false;

    for (let cell of cells) cell.innerText = '';
}

function endTurn() {
    setTimeout(() => {
        checkWinner() || checkDraw() ? gameOver = true : togglePlayer();

    }, 200);
}

function checkWinner() {
    if (
        (board[0] === board[1] && board[1] === board[2] && board[2] == currentPlayer) ||
        (board[3] === board[4] && board[4] === board[5] && board[5] == currentPlayer) ||
        (board[6] === board[7] && board[7] === board[8] && board[8] == currentPlayer) ||

        (board[0] === board[3] && board[3] === board[6] && board[6] == currentPlayer) ||
        (board[1] === board[4] && board[4] === board[7] && board[7] == currentPlayer) ||
        (board[2] === board[5] && board[5] === board[8] && board[8] == currentPlayer) ||

        (board[0] === board[4] && board[4] === board[8] && board[8] == currentPlayer) ||
        (board[2] === board[4] && board[4] === board[6] && board[6] == currentPlayer) 
    ) {
        alert(`Player ${currentPlayer} wins!`);
        return true;
    }
}

function checkDraw() {
    if (board.filter(s => s == '').length == 0) {
        alert('Draw!');
        return true;
    }
}

function togglePlayer() {
    currentPlayer == 'X' ? currentPlayer = 'O' : currentPlayer = 'X';
}
