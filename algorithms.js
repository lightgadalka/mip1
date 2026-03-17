let searchDepth = 8;
let lastSearchStats = null;

function createState(number, humanScore, aiScore, currentPlayer) {
  return { number, humanScore, aiScore, currentPlayer };
}

function copyState(state) {
  let { number, humanScore, aiScore, currentPlayer } = state;
  return { number, humanScore, aiScore, currentPlayer };
}

function createNode(state, move = null, depth = 0) {
  return {
    state: copyState(state),
    kids: [],
    score: null,
    move,
    depth
  };
}

function createStats(name) {
  return {
    algorithm: name,
    made: 0,
    checked: 0,
    cutoffs: 0,
    timeMs: 0
  };
}

function isTerminal(state) {
  if (state.number <= 10) {
    return true;
  }

  if (getPossibleMoves(state).length == 0) {
    return true;
  }

  return false;
}

function countResult(state) {
  if (state.aiScore > state.humanScore) {
    return 1;
  }

  if (state.aiScore < state.humanScore) {
    return -1;
  }

  return 0;
}

function estimate(state) {
  if (isTerminal(state)) {
    let diff = state.aiScore - state.humanScore;

    if (diff > 0) {
      return 1000 + diff;
    }

    if (diff < 0) {
      return -1000 + diff;
    }

    return 0;
  }

  let val = 0;
  val += (state.aiScore - state.humanScore) * 20;

  if (state.currentPlayer == "ai") {
    val += 4;
  } else {
    val -= 4;
  }

  if (state.number % 3 == 0) {
    val += 6;
  }

  if (state.number % 2 == 0) {
    val -= 2;
  }

  if (state.number <= 30) {
    val += state.aiScore - state.humanScore;
  }

  return val;
}

function getPossibleMoves(state) {
  let n = state.number;
  let arr = [];

  if (n % 2 == 0) {
    arr.push(2);
  }

  if (n % 3 == 0) {
    arr.push(3);
  }

  return arr;
}

function applyMove(state, move) {
  let next = copyState(state);

  next.number = next.number / move;

  if (state.currentPlayer == "ai") {
    if (move == 2) {
      next.humanScore += 2;
    } else {
      next.aiScore += 3;
    }
    next.currentPlayer = "human";
  } else {
    if (move == 2) {
      next.aiScore += 2;
    } else {
      next.humanScore += 3;
    }
    next.currentPlayer = "ai";
  }

  return next;
}

function minimax(node, depthLeft, stats) {
  let state = node.state;
  stats.checked++;

  if (isTerminal(state) || depthLeft == 0) {
    node.score = estimate(state);
    return node.score;
  }

  let moves = getPossibleMoves(state);
  let best = state.currentPlayer == "ai" ? -Infinity : Infinity;

  for (let i = 0; i < moves.length; i++) {
    let move = moves[i];
    let next = applyMove(state, move);
    let kid = createNode(next, move, node.depth + 1);
    node.kids.push(kid);
    stats.made++;

    let val = minimax(kid, depthLeft - 1, stats);

    if (state.currentPlayer == "ai") {
      if (val > best) {
        best = val;
      }
    } else {
      if (val < best) {
        best = val;
      }
    }
  }

  node.score = best;
  return best;
}

function alphaBeta(node, depthLeft, alpha, beta, stats) {
  let state = node.state;
  stats.checked++;

  if (isTerminal(state) || depthLeft == 0) {
    node.score = estimate(state);
    return node.score;
  }

  let moves = getPossibleMoves(state);

  if (state.currentPlayer == "ai") {
    let best = -Infinity;

    for (let i = 0; i < moves.length; i++) {
      let move = moves[i];
      let next = applyMove(state, move);
      let kid = createNode(next, move, node.depth + 1);
      node.kids.push(kid);
      stats.made++;

      let val = alphaBeta(kid, depthLeft - 1, alpha, beta, stats);

      if (val > best) {
        best = val;
      }

      if (best > alpha) {
        alpha = best;
      }

      if (alpha >= beta) {
        stats.cutoffs++;
        break;
      }
    }

    node.score = best;
    return best;
  }

  let best = Infinity;

  for (let i = 0; i < moves.length; i++) {
    let move = moves[i];
    let next = applyMove(state, move);
    let kid = createNode(next, move, node.depth + 1);
    node.kids.push(kid);
    stats.made++;

    let val = alphaBeta(kid, depthLeft - 1, alpha, beta, stats);

    if (val < best) {
      best = val;
    }

    if (best < beta) {
      beta = best;
    }

    if (alpha >= beta) {
      stats.cutoffs++;
      break;
    }
  }

  node.score = best;
  return best;
}

function collectBest(root) {
  let bestMove = 2;
  let bestScore = -Infinity;

  for (let i = 0; i < root.kids.length; i++) {
    let kid = root.kids[i];

    if (kid.score > bestScore) {
      bestScore = kid.score;
      bestMove = kid.move;
    }
  }

  return { move: bestMove, score: bestScore };
}

function bestMoveMinimax(state, depth = searchDepth) {
  let root = createNode(state);
  let stats = createStats("minimax");
  let start = performance.now();

  minimax(root, depth, stats);

  stats.timeMs = performance.now() - start;
  lastSearchStats = stats;

  let best = collectBest(root);
  return { move: best.move, score: best.score, stats, root };
}

function bestMoveAlphaBeta(state, depth = searchDepth) {
  let root = createNode(state);
  let stats = createStats("alphabeta");
  let start = performance.now();

  alphaBeta(root, depth, -Infinity, Infinity, stats);

  stats.timeMs = performance.now() - start;
  lastSearchStats = stats;

  let best = collectBest(root);
  return { move: best.move, score: best.score, stats, root };
}
