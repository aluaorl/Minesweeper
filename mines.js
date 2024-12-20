let N;
let M;
let gameEnd = false;
let field = [];

function updateFieldSize() {
  const fieldSizeInput = document.getElementById("fieldSize");
  N = parseInt(fieldSizeInput.value);
}
function updateMinesCount() {
  const minesCountInput = document.getElementById("minesCount");
  percent = parseInt(minesCountInput.value);
  M = Math.floor((N * N * percent) / 100);
}
function createField() {
  field = Array.from({ length: N }, () =>
    Array.from({ length: N }, () => ({
      isMine: false,
      isRevealed: false,
      isMarked: false,
      MinesCount: 0,
    }))
  );
}
function render() {
  const fieldEl = document.getElementById("field");
  fieldEl.innerHTML = "";
  field.forEach((row, rowIndex) => {
    const rowEl = document.createElement("tr");
    row.forEach((cell, colIndex) => {
      const cellEl = document.createElement("td");
      cellEl.dataset.row = rowIndex;
      cellEl.dataset.col = colIndex;
      cellEl.addEventListener("click", handleCellClick);
      cellEl.addEventListener("contextmenu", handleCellRightClick);
      if (cell.isRevealed) {
        if (cell.isMine) {
          cellEl.textContent = "💣";
        } else if (cell.MinesCount === 0) {
          cellEl.style.backgroundColor = "#b7e5f7";
        } else {
          cellEl.textContent = cell.MinesCount === 0 ? "" : cell.MinesCount;
          cellEl.style.color = NumberColor(cell.MinesCount);
        }
      } else if (cell.isMarked) {
        cellEl.textContent = "🚩";
      }
      rowEl.appendChild(cellEl);
    });
    fieldEl.appendChild(rowEl);
    const flagsCountValue = document.getElementById("flagsCountValue");
    let markedFlagsCount = 0;
    field.forEach((row) => {
      row.forEach((cell) => {
        if (cell.isMarked) {
          markedFlagsCount++;
        }
      });
    });
    flagsCountValue.textContent = markedFlagsCount;
  });
}
function startGame() {
  updateFieldSize();
  updateMinesCount();
  createField();
  gameEnd = false;
  field.forEach((row) => {
    row.forEach((cell) => {
      cell.isMine = false;
      cell.isRevealed = false;
      cell.isMarked = false;
      cell.MinesCount = 0;
    });
  });
  document.getElementById("result").textContent = "";
  const minesToGuessCount = document.getElementById("minesToGuessCount");
  const flagsCountValue = document.getElementById("flagsCountValue");
  minesToGuessCount.textContent = M;
  flagsCountValue.textContent = 0;
  placeMines();
  countMinesAroundCells();
  render();
}
function placeMines(minesPlaced = 0) {
  if (minesPlaced === M) {
    return;
  }
  const row = Math.floor(Math.random() * N);
  const col = Math.floor(Math.random() * N);
  if (!field[row][col].isMine) {
    field[row][col].isMine = true;
    placeMines(minesPlaced + 1);
  } else {
    placeMines(minesPlaced);
  }
}
function countMinesAroundCells() {
  field.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell.isMine) {
        return;
      }
      const MinesCount = countMinesAroundCell(rowIndex, colIndex);
      field[rowIndex][colIndex].MinesCount = MinesCount;
    });
  });
}
function countMinesAroundCell(row, col) {
  const matrix = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];
  return matrix.reduce((count, [matrixRow, matrixCol]) => {
    const newRow = row + matrixRow;
    const newCol = col + matrixCol;
    if (
      newRow >= 0 &&
      newRow < N &&
      newCol >= 0 &&
      newCol < N &&
      field[newRow][newCol].isMine
    ) {
      return count + 1;
    }
    return count;
  }, 0);
}
function NumberColor(number) {
  const colors = [
    "blue",
    "green",
    "red",
    "darkblue",
    "brown",
    "darkgreen",
    "black",
    "white",
  ];
  return colors[number - 1] || "black";
}
function showCell(row, col) {
  const cell = field[row][col];
  if (cell.isRevealed || cell.isMarked) {
    return;
  }
  cell.isRevealed = true;
  if (cell.MinesCount === 0) {
    const neighbors = getNeighborCells(row, col);
    neighbors.forEach(([i, j]) => {
      showCell(i, j);
    });
  }
}
function getNeighborCells(row, col) {
  const offsets = [-1, 0, 1];
  const neighbors = [];
  offsets.forEach((i) => {
    offsets.forEach((j) => {
      const newRow = row + i;
      const newCol = col + j;
      if (
        newRow >= 0 &&
        newRow < N &&
        newCol >= 0 &&
        newCol < N &&
        !(i === 0 && j === 0)
      ) {
        neighbors.push([newRow, newCol]);
      }
    });
  });
  return neighbors;
}
function handleCellClick(event) {
  if (gameEnd) {
    return;
  }
  const row = parseInt(event.target.dataset.row);
  const col = parseInt(event.target.dataset.col);
  const cell = field[row][col];
  if (cell.isMarked) {
    return;
  }
  if (cell.isMine) {
    revealAllBombs();
    document.getElementById("result").textContent = "Вы проиграли!";
  } else {
    showCell(row, col);
    if (checkWin()) {
      document.getElementById("result").textContent = "Вы выиграли!";
    }
  }
  render();
}
function handleCellRightClick(event) {
  if (gameEnd) {
    return;
  }
  event.preventDefault();
  const row = parseInt(event.target.dataset.row);
  const col = parseInt(event.target.dataset.col);
  const cell = field[row][col];
  if (cell.isRevealed) {
    return;
  }
  cell.isMarked = !cell.isMarked;
  render();
  if (checkWin()) {
    document.getElementById("result").textContent = "Вы выиграли!";
  }
}
function revealAllBombs() {
  field.forEach((row) => {
    row.forEach((cell) => {
      if (cell.isMine) {
        cell.isRevealed = true;
      }
    });
  });
  gameEnd = true;
}
function checkWin() {
  let markedMinesCount = 0;
  let revealedNonMinesCount = 0;
  field.forEach((row) => {
    row.forEach((cell) => {
      if (cell.isMarked && cell.isMine) {
        markedMinesCount++;
      }
      if (!cell.isMine && cell.isRevealed) {
        revealedNonMinesCount++;
      }
    });
  });
  if (markedMinesCount === M && revealedNonMinesCount === N * N - M) {
    gameEnd = true;
  }
  return gameEnd;
}
const startButton = document.getElementById("startButton");
startButton.addEventListener("click", startGame);
