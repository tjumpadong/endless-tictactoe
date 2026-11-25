export const EMPTY = '-'
export const VISIBLE_MOVES = 7
export const WIN_PATTERN = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

export const createGame = () => ({
  board: new Array(9).fill(EMPTY),
  moves: [],
  turn: 'x',
  roundOver: false,
  win: [],
  score: { x: 0, o: 0 },
})

const otherPlayer = player => (player === 'x' ? 'o' : 'x')

const isCellIndex = index => Number.isInteger(index) && index >= 0 && index < 9

export const findWin = (board, player) =>
  WIN_PATTERN.find(pattern => pattern.every(index => board[index] === player)) ?? []

export const playMove = (game, index) => {
  if (game.roundOver || !isCellIndex(index) || game.board[index] !== EMPTY) return game

  const board = [...game.board]
  const moves = [...game.moves, index]
  board[index] = game.turn
  if (moves.length > VISIBLE_MOVES) board[moves.shift()] = EMPTY

  const win = findWin(board, game.turn)
  if (win.length > 0) {
    return {
      board,
      moves,
      turn: game.turn,
      roundOver: true,
      win,
      score: { ...game.score, [game.turn]: game.score[game.turn] + 1 },
    }
  }

  return {
    board,
    moves,
    turn: otherPlayer(game.turn),
    roundOver: false,
    win: [],
    score: game.score,
  }
}

export const resetRound = game => ({ ...createGame(), score: game.score })
