const board = document.getElementById("board");
const resetButton = document.querySelector("button");
let currentPlayer = 1;
let boardState = Array.from({ length: 6 }, () => Array(7).fill(0));

function createCell(row, col) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.row = row;
    cell.dataset.col = col;
    cell.addEventListener("click", () => handleCellClick(row, col)); // Pass both row and col
    return cell;
}

function resetGame() {
    currentPlayer = 1;
    boardState = Array.from({ length: 6 }, () => Array(7).fill(0));
    updateBoardUI();
}

function handleCellClick(row, col) {
    if (currentPlayer === 1) {
        const availableRow = getAvailableRow(boardState, col);
        if (availableRow !== -1) {
            boardState[availableRow][col] = currentPlayer;
            if (checkWinner(boardState)) {
                showModal(`${currentPlayer === 1 ? "You" : "AI"} Won!`);
                resetGame();
            } else if (checkForDraw()) {
                showModal("It's a draw!");
                resetGame();
            } else {
                currentPlayer = 3 - currentPlayer;
                updateBoardUI();

                if (currentPlayer === 2) {
                    // If it's now player 2's turn, make the AI move after a delay
                    setTimeout(makeAIMove, 500); // Set the delay in milliseconds (1 second in this example)
                }
            }
        }
    }
}

function makeAIMove() {
    const bestMove = minimax(boardState, 4, -Infinity, Infinity, true);

    console.log("bestMove:", bestMove);

    if (bestMove && bestMove.column !== null) {
        const col = bestMove.column;
        const availableRow = getAvailableRow(boardState, col);

        // Update the game state without triggering the UI update
        boardState[availableRow][col] = currentPlayer;

        if (checkWinner(boardState)) {
            showModal(`${currentPlayer === 1 ? "You" : "AI"} Won!`);
            resetGame();
        } else if (checkForDraw()) {
            showModal("It's a draw!");
            resetGame();
        } else {
            currentPlayer = 3 - currentPlayer;
            // Update the UI after the game state is updated
            updateBoardUI();

            if (currentPlayer === 2) {
                // If it's now player 2's turn, make the AI move after a delay
                setTimeout(makeAIMove, 500); // Set the delay in milliseconds (1 second in this example)
            }
        }
    }
}

function minimax(board, depth, alpha, beta, isMaximizing) {
    const winner = checkWinner(board);
    if (winner !== null || depth === 0) {
        return { score: evaluateBoard(board), column: null };
    }

    const availableMoves = getAvailableMoves(board);
    if (isMaximizing) {
        let maxScore = -Infinity;
        let bestMove = { column: null };

        for (const move of availableMoves) {
            const newBoard = applyMove(board, move.column, 2);
            const result = minimax(newBoard, depth - 1, alpha, beta, false);
            const score = result.score;

            if (score > maxScore) {
                maxScore = score;
                bestMove = move;
            }

            alpha = Math.max(alpha, score);
            if (beta <= alpha) {
                break;
            }
        }

        return { score: maxScore, column: bestMove.column };
    } else {
        let minScore = Infinity;
        let bestMove = { column: null };

        for (const move of availableMoves) {
            const newBoard = applyMove(board, move.column, 1);
            const result = minimax(newBoard, depth - 1, alpha, beta, true);
            const score = result.score;

            if (score < minScore) {
                minScore = score;
                bestMove = move;
            }

            beta = Math.min(beta, score);
            if (beta <= alpha) {
                break;
            }
        }

        return { score: minScore, column: bestMove.column };
    }
}

function evaluateBoard(board) {
    const score = checkWinningPattern(board, 2) - checkWinningPattern(board, 1);
    return score;
}

function checkWinningPattern(board, player) {
    let score = 0;

    for (let row = 0; row < 6; row++) {
        for (let col = 0; col <= 3; col++) {
            const window = board[row].slice(col, col + 4);
            score += evaluateWindow(window, player);
        }
    }

    for (let col = 0; col < 7; col++) {
        for (let row = 0; row <= 2; row++) {
            const window = [board[row][col], board[row + 1][col], board[row + 2][col], board[row + 3][col]];
            score += evaluateWindow(window, player);
        }
    }

    for (let row = 0; row <= 2; row++) {
        for (let col = 0; col <= 3; col++) {
            const window = [board[row][col], board[row + 1][col + 1], board[row + 2][col + 2], board[row + 3][col + 3]];
            score += evaluateWindow(window, player);
        }
    }

    for (let row = 3; row <= 5; row++) {
        for (let col = 0; col <= 3; col++) {
            const window = [board[row][col], board[row - 1][col + 1], board[row - 2][col + 2], board[row - 3][col + 3]];
            score += evaluateWindow(window, player);
        }
    }

    return score;
}

function evaluateWindow(window, player) {
    const opponent = 3 - player;
    const countPlayer = window.filter(cell => cell === player).length;
    const countOpponent = window.filter(cell => cell === opponent).length;

    if (countPlayer === 4) {
        return 100;
    } else if (countPlayer === 3 && countOpponent === 0) {
        return 5;
    } else if (countPlayer === 2 && countOpponent === 0) {
        return 2;
    }

    if (countOpponent === 4) {
        return -100;
    } else if (countOpponent === 3 && countPlayer === 0) {
        return -5;
    } else if (countOpponent === 2 && countPlayer === 0) {
        return -2;
    }

    return 0;
}

function checkWinner(board) {
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 7; col++) {
            const cell = board[row][col];
            if (cell !== 0) {
                if (col <= 3 && board[row][col + 1] === cell && board[row][col + 2] === cell && board[row][col + 3] === cell) {
                    return cell;
                }
                if (row <= 2 && board[row + 1][col] === cell && board[row + 2][col] === cell && board[row + 3][col] === cell) {
                    return cell;
                }
                if (row <= 2 && col <= 3 && board[row + 1][col + 1] === cell && board[row + 2][col + 2] === cell && board[row + 3][col + 3] === cell) {
                    return cell;
                }
                if (row >= 3 && col <= 3 && board[row - 1][col + 1] === cell && board[row - 2][col + 2] === cell && board[row - 3][col + 3] === cell) {
                    return cell;
                }
            }
        }
    }
    return null;
}

function getAvailableMoves(board) {
    const moves = [];
    for (let col = 0; col < 7; col++) {
        const row = getAvailableRow(board, col);
        if (row !== -1) {
            moves.push({ column: col, row });
        }
    }
    return moves;
}

function getAvailableRow(board, col) {
    for (let row = 5; row >= 0; row--) {
        if (board[row][col] === 0) {
            return row;
        }
    }
    return -1; // Column is full
}

function applyMove(board, col, player) {
    const newBoard = board.map(row => row.slice());
    const row = getAvailableRow(newBoard, col);

    if (row !== -1) {
        newBoard[row][col] = player;
        return newBoard;
    } else {
        // Handle the case when the column is full
        console.error("Invalid move: Column is full.");
        return board; // Return the original board in case of an invalid move
    }
}

function checkForDraw() {
    return boardState.every(row => row.every(cell => cell !== 0));
}

function updateBoardUI() {
    board.innerHTML = "";
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 7; col++) {
            const cell = createCell(row, col);
            if (boardState[row][col] === 1) {
                cell.classList.add("player-one");
            } else if (boardState[row][col] === 2) {
                cell.classList.add("player-two");
            }
            board.appendChild(cell);
        }
    }
}

// Initial board update
updateBoardUI();


function showModal(message) {
    const modal = document.getElementById("myModal");
    const modalMessage = document.getElementById("modalMessage");
    modalMessage.textContent = message;
    modal.style.display = "block";
}

function closeModal() {
    const modal = document.getElementById("myModal");
    modal.style.display = "none";
}

function playAgain() {
    closeModal();
    resetGame();
}

document.addEventListener("DOMContentLoaded", function () {
    const modalPlayAgain = document.getElementById("modalPlayAgain");
    modalPlayAgain.addEventListener("click", playAgain);

    const modalClose = document.querySelector(".close");
    modalClose.addEventListener("click", closeModal);

    // Initial board update
    updateBoardUI();
});

// Add the modal HTML structure after your existing code
const modalHTML = `
    <div id="myModal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2 id="modalMessage"></h2>
            <a href="#" class="play-again" id="modalPlayAgain">Play Again</a>
        </div>
    </div>
`;

// Append the modal HTML to the body
document.body.insertAdjacentHTML("beforeend", modalHTML);
