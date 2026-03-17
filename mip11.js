let game = createState(0, 0, 0, "");
let started = false;
let finished = false;

let startNums = [];
let firstPlayer = "";
let algo = "minimax";
let pickedIndex = -1;
let devMode = false;

let titleEl;
let currentBoxEl;
let currentValueEl;
let scoresEl;
let humanScoreEl;
let aiScoreEl;
let winnerEl;

let startPanelEl;
let playPanelEl;
let finishPanelEl;
let numbersWrapEl;
let normalStartRowEl;
let devRowEl;
let devInputEl;

let modeMinimaxBtn;
let modeAlphaBtn;
let playerHumanBtn;
let playerAiBtn;
let startBtn;
let devStartBtn;
let divide2Btn;
let divide3Btn;
let restartBtn;

let numBtns = [];

function init() {
  cacheDom();
  makeNumberButtons();
  bindEvents();
  makeStartNumbers();
  drawStartNumbers();
  render();
}

function cacheDom() {
  titleEl = document.getElementById("title");
  currentBoxEl = document.getElementById("current-box");
  currentValueEl = document.getElementById("current-value");
  scoresEl = document.getElementById("scores");
  humanScoreEl = document.getElementById("human-score");
  aiScoreEl = document.getElementById("ai-score");
  winnerEl = document.getElementById("winner");

  startPanelEl = document.getElementById("start-panel");
  playPanelEl = document.getElementById("play-panel");
  finishPanelEl = document.getElementById("finish-panel");
  numbersWrapEl = document.getElementById("numbers");
  normalStartRowEl = document.getElementById("normal-start-row");
  devRowEl = document.getElementById("dev-row");
  devInputEl = document.getElementById("dev-input");

  modeMinimaxBtn = document.getElementById("mode-minimax");
  modeAlphaBtn = document.getElementById("mode-alphabeta");
  playerHumanBtn = document.getElementById("player-human");
  playerAiBtn = document.getElementById("player-ai");
  startBtn = document.getElementById("start-btn");
  devStartBtn = document.getElementById("dev-start-btn");
  divide2Btn = document.getElementById("divide-2");
  divide3Btn = document.getElementById("divide-3");
  restartBtn = document.getElementById("restart-btn");
}

function makeNumberButtons() {
  numbersWrapEl.innerHTML = "";
  numBtns = [];

  for (let i = 0; i < 5; i++) {
    let btn = document.createElement("button");
    btn.className = "game-btn num-btn";
    btn.addEventListener("click", function() {
      pickedIndex = i;
      render();
    });
    numbersWrapEl.appendChild(btn);
    numBtns.push(btn);
  }
}

function bindEvents() {
  modeMinimaxBtn.addEventListener("click", function() {
    algo = "minimax";
    render();
  });

  modeAlphaBtn.addEventListener("click", function() {
    algo = "alphabeta";
    render();
  });

  playerHumanBtn.addEventListener("click", function() {
    firstPlayer = "human";
    render();
  });

  playerAiBtn.addEventListener("click", function() {
    firstPlayer = "ai";
    render();
  });

  startBtn.addEventListener("click", startNormalGame);
  devStartBtn.addEventListener("click", startCustomGame);
  divide2Btn.addEventListener("click", function() {
    humanTurn(2);
  });
  divide3Btn.addEventListener("click", function() {
    humanTurn(3);
  });
  restartBtn.addEventListener("click", restartGame);

  document.addEventListener("keydown", function(event) {
    if (event.key == "1" && !started) {
      devMode = true;
      render();
    }
  });
}

function makeStartNumbers() {
  startNums = [];

  while (startNums.length < 5) {
    let n = randomDivBy6();
    if (startNums.indexOf(n) == -1) {
      startNums.push(n);
    }
  }
}

function randomDivBy6() {
  let n = Math.floor(Math.random() * 10000) + 10000;

  while (n % 6 != 0) {
    n = Math.floor(Math.random() * 10000) + 10000;
  }

  return n;
}

function drawStartNumbers() {
  for (let i = 0; i < numBtns.length; i++) {
    numBtns[i].textContent = startNums[i];
  }
}

function startNormalGame() {
  if (firstPlayer == "" || pickedIndex == -1) {
    return;
  }

  game = createState(startNums[pickedIndex], 0, 0, firstPlayer);
  started = true;
  finished = false;
  render();

  if (game.currentPlayer == "ai") {
    setTimeout(aiTurn, 10);
  }
}

function startCustomGame() {
  if (!devMode || firstPlayer == "") {
    return;
  }

  let n = parseInt(devInputEl.value, 10);

  if (isNaN(n) || n <= 10) {
    return;
  }

  game = createState(n, 0, 0, firstPlayer);
  started = true;
  finished = false;
  render();

  if (game.currentPlayer == "ai") {
    setTimeout(aiTurn, 10);
  }
}

function restartGame() {
  game = createState(0, 0, 0, "");
  started = false;
  finished = false;
  firstPlayer = "";
  pickedIndex = -1;
  devMode = false;
  devInputEl.value = "";
  makeStartNumbers();
  drawStartNumbers();
  render();
}

function pickMove() {
  if (algo == "alphabeta") {
    return bestMoveAlphaBeta(game);
  }

  return bestMoveMinimax(game);
}

function aiTurn() {
  if (!started || finished) {
    return;
  }

  if (game.currentPlayer != "ai") {
    return;
  }

  if (isTerminal(game)) {
    finished = true;
    render();
    return;
  }

  let res = pickMove();
  console.log("AI stats:", res.stats);
  game = applyMove(game, res.move);

  if (isTerminal(game)) {
    finished = true;
  }

  render();
}

function humanTurn(move) {
  if (!started || finished) {
    return;
  }

  if (game.currentPlayer != "human") {
    return;
  }

  if (move == 2 && game.number % 2 != 0) {
    return;
  }

  if (move == 3 && game.number % 3 != 0) {
    return;
  }

  game = applyMove(game, move);

  if (isTerminal(game)) {
    finished = true;
    render();
    return;
  }

  render();
  setTimeout(aiTurn, 10);
}

function render() {
  renderTop();
  renderPanels();
  renderButtons();
}

function renderTop() {
  titleEl.textContent = getTitle();

  if (!started) {
    winnerEl.style.display = "none";
    currentBoxEl.style.display = "flex";
    scoresEl.style.display = "none";
    currentValueEl.textContent = pickedIndex == -1 ? "-" : startNums[pickedIndex];
    return;
  }

  if (finished) {
    currentBoxEl.style.display = "none";
    scoresEl.style.display = "none";
    winnerEl.style.display = "block";
    winnerEl.textContent = getWinnerText();
    return;
  }

  winnerEl.style.display = "none";
  currentBoxEl.style.display = "flex";
  scoresEl.style.display = "flex";
  currentValueEl.textContent = game.number;
  humanScoreEl.textContent = game.humanScore;
  aiScoreEl.textContent = game.aiScore;
}

function renderPanels() {
  if (!started) {
    startPanelEl.style.display = "flex";
    playPanelEl.style.display = "none";
    finishPanelEl.style.display = "none";

    if (devMode) {
      numbersWrapEl.style.display = "none";
      normalStartRowEl.style.display = "none";
      devRowEl.style.display = "flex";
    } else {
      numbersWrapEl.style.display = "grid";
      normalStartRowEl.style.display = "flex";
      devRowEl.style.display = "none";
    }

    return;
  }

  if (finished) {
    startPanelEl.style.display = "none";
    playPanelEl.style.display = "none";
    finishPanelEl.style.display = "flex";
    return;
  }

  startPanelEl.style.display = "none";
  playPanelEl.style.display = "flex";
  finishPanelEl.style.display = "none";
}

function renderButtons() {
  modeMinimaxBtn.disabled = algo == "minimax";
  modeAlphaBtn.disabled = algo == "alphabeta";
  playerHumanBtn.disabled = firstPlayer == "human";
  playerAiBtn.disabled = firstPlayer == "ai";
  startBtn.disabled = firstPlayer == "" || pickedIndex == -1;
  devStartBtn.disabled = firstPlayer == "" || devInputEl.value.trim() == "";

  for (let i = 0; i < numBtns.length; i++) {
    numBtns[i].disabled = i == pickedIndex;
  }

  if (!started || finished || game.currentPlayer != "human") {
    divide2Btn.disabled = true;
    divide3Btn.disabled = true;
    return;
  }

  divide2Btn.disabled = game.number % 2 != 0;
  divide3Btn.disabled = game.number % 3 != 0;
}

function getTitle() {
  return (algo == "alphabeta" ? "Alpha-Beta" : "Minimax") + " Game";
}

function getWinnerText() {
  let res = countResult(game);

  if (res > 0) {
    return "AI WON!";
  }

  if (res < 0) {
    return "HUMAN WON!";
  }

  return "DRAW!";
}

document.addEventListener("DOMContentLoaded", init);
