import { describe, expect, test } from 'bun:test'
import { EMPTY, VISIBLE_MOVES, createGame, findWin, playMove, resetRound } from './game.js'

const playAll = indexes => indexes.reduce((game, index) => playMove(game, index), createGame())
const markCount = game => game.board.filter(cell => cell !== EMPTY).length

describe('createGame', () => {
  test('starts empty with X to move and no score', () => {
    expect(createGame()).toEqual({
      board: new Array(9).fill(EMPTY),
      moves: [],
      turn: 'x',
      roundOver: false,
      win: [],
      score: { x: 0, o: 0 },
    })
  })

  test('gives every game its own board and score', () => {
    const first = createGame()
    const second = createGame()
    first.board[0] = 'x'
    first.score.x = 3
    expect(second.board[0]).toBe(EMPTY)
    expect(second.score.x).toBe(0)
  })
})

describe('playMove', () => {
  test('alternates turns starting with X', () => {
    const afterX = playMove(createGame(), 4)
    expect(afterX.board[4]).toBe('x')
    expect(afterX.turn).toBe('o')

    const afterO = playMove(afterX, 0)
    expect(afterO.board[0]).toBe('o')
    expect(afterO.turn).toBe('x')
  })

  test('ignores an occupied cell and returns the same game', () => {
    const game = playMove(createGame(), 4)
    expect(playMove(game, 4)).toBe(game)
  })

  test('ignores indexes that are out of range or not integers', () => {
    const game = createGame()
    for (const index of [-1, 9, 1.5, '3', undefined, null]) {
      expect(playMove(game, index)).toBe(game)
    }
  })

  test('leaves the previous game untouched', () => {
    const first = playMove(createGame(), 0)
    const second = playMove(first, 1)

    expect(first.board[1]).toBe(EMPTY)
    expect(first.moves).toEqual([0])
    expect(first.turn).toBe('o')
    expect(first.score).toEqual({ x: 0, o: 0 })

    expect(second.board[1]).toBe('o')
    expect(second.moves).toEqual([0, 1])
  })
})

describe('wins', () => {
  test('detects a horizontal line, ends the round, and scores it', () => {
    const game = playAll([0, 3, 1, 4, 2])
    expect(game.win).toEqual([0, 1, 2])
    expect(game.roundOver).toBe(true)
    expect(game.score).toEqual({ x: 1, o: 0 })
  })

  test('detects a vertical line', () => {
    expect(playAll([0, 1, 3, 2, 6]).win).toEqual([0, 3, 6])
  })

  test('detects a diagonal line', () => {
    expect(playAll([0, 1, 4, 2, 8]).win).toEqual([0, 4, 8])
  })

  test('credits the winning player only', () => {
    const xWins = playAll([0, 3, 1, 4, 2])
    expect(xWins.roundOver).toBe(true)
    expect(xWins.score).toEqual({ x: 1, o: 0 })

    const oWins = playAll([8, 0, 7, 1, 4, 2])
    expect(oWins.roundOver).toBe(true)
    expect(oWins.turn).toBe('o')
    expect(oWins.score).toEqual({ x: 0, o: 1 })
  })

  test('ignores moves after the round is over and never scores twice', () => {
    const game = playAll([0, 3, 1, 4, 2])
    const ignored = playMove(game, 8)
    expect(ignored).toBe(game)
    expect(ignored.score).toEqual({ x: 1, o: 0 })
  })
})

describe('sliding window', () => {
  test('has no winner and seven marks after seven moves', () => {
    const game = playAll([0, 1, 3, 4, 8, 6, 7])
    expect(markCount(game)).toBe(VISIBLE_MOVES)
    expect(game.roundOver).toBe(false)
    expect(game.win).toEqual([])
  })

  test('removes the oldest mark on the eighth move', () => {
    const game = playAll([0, 1, 3, 4, 8, 6, 7, 5])
    expect(game.board[0]).toBe(EMPTY)
    expect(markCount(game)).toBe(VISIBLE_MOVES)
    expect(game.moves).toHaveLength(VISIBLE_MOVES)
    expect(game.roundOver).toBe(false)
  })

  test('never removes the mark that was just placed', () => {
    const game = playAll([0, 1, 3, 4, 8, 6, 7, 5])
    expect(game.board[5]).toBe('o')
    expect(game.board[7]).toBe('x')
    expect(game.board[8]).toBe('x')
  })

  test('judges the win on the board after the oldest mark has left', () => {
    const game = playAll([0, 1, 3, 4, 8, 6, 7, 2])
    expect(game.win).toEqual([2, 4, 6])
    expect(game.board[0]).toBe(EMPTY)
    expect(game.roundOver).toBe(true)
    expect(game.score).toEqual({ x: 0, o: 1 })
  })

  test('never fills the board, so a draw cannot happen', () => {
    let game = createGame()
    let mostMarks = 0

    for (let move = 0; move < 80; move++) {
      if (game.roundOver) game = resetRound(game)
      game = playMove(game, game.board.indexOf(EMPTY))

      const count = markCount(game)
      mostMarks = Math.max(mostMarks, count)
      expect(count).toBeLessThan(9)
      expect(count).toBeLessThanOrEqual(VISIBLE_MOVES)
    }

    expect(mostMarks).toBe(VISIBLE_MOVES)
  })
})

describe('resetRound', () => {
  test('clears the board and keeps the score', () => {
    const won = playAll([0, 3, 1, 4, 2])
    const next = resetRound(won)

    expect(next.board).toEqual(new Array(9).fill(EMPTY))
    expect(next.moves).toEqual([])
    expect(next.turn).toBe('x')
    expect(next.roundOver).toBe(false)
    expect(next.win).toEqual([])
    expect(next.score).toEqual({ x: 1, o: 0 })
  })
})

describe('findWin', () => {
  test('returns the matching line for the given player only', () => {
    const board = ['x', EMPTY, EMPTY, EMPTY, 'x', EMPTY, EMPTY, EMPTY, 'x']
    expect(findWin(board, 'x')).toEqual([0, 4, 8])
    expect(findWin(board, 'o')).toEqual([])
  })

  test('returns an empty array when there is no line', () => {
    expect(findWin(new Array(9).fill(EMPTY), 'x')).toEqual([])
  })
})
