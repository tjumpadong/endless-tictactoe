import { EMPTY, createGame, playMove, resetRound } from './game.js'

const MARK_SVG = {
  x: `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <path d="M31 31 69 69" pathLength="100"></path>
        <path d="M69 31 31 69" pathLength="100"></path>
      </svg>`,
  o: `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <circle cx="50" cy="50" r="26" pathLength="100"></circle>
      </svg>`,
}

const boardEl = document.getElementById('board')
const statusEl = document.getElementById('status')
const resetBtn = document.getElementById('reset-btn')
const scoreEls = {
  x: { chip: document.getElementById('score-x'), value: document.getElementById('score-x-value') },
  o: { chip: document.getElementById('score-o'), value: document.getElementById('score-o-value') },
}

const spaces = Array.from(boardEl.getElementsByClassName('space'))

let game = createGame()

const cellLabel = (index, mark, isWin) => {
  const row = Math.floor(index / 3) + 1
  const column = (index % 3) + 1
  const content = mark === EMPTY ? 'empty' : mark.toUpperCase()
  return `Row ${row}, column ${column}, ${content}${isWin ? ', winning cell' : ''}`
}

const render = () => {
  spaces.forEach((space, index) => {
    const mark = game.board[index]
    const isWin = game.win.includes(index)

    if (space.dataset.mark !== mark) {
      space.dataset.mark = mark
      space.innerHTML = mark === EMPTY ? '' : MARK_SVG[mark]
    }

    space.classList.toggle('checked-x', mark === 'x')
    space.classList.toggle('checked-o', mark === 'o')
    space.classList.toggle('win', isWin)
    space.disabled = game.roundOver
    space.setAttribute('aria-label', cellLabel(index, mark, isWin))

    const order = game.moves.indexOf(index)
    if (order === -1) space.style.removeProperty('--age')
    else space.style.setProperty('--age', String(game.moves.length - 1 - order))
  })

  boardEl.classList.toggle('round-over', game.roundOver)

  for (const player of ['x', 'o']) {
    const { chip, value } = scoreEls[player]
    value.textContent = String(game.score[player])
    chip.classList.toggle('active', !game.roundOver && game.turn === player)
    chip.classList.toggle('winner', game.roundOver && game.turn === player)
    chip.setAttribute('aria-current', String(!game.roundOver && game.turn === player))
  }

  statusEl.textContent = game.roundOver ? `${game.turn.toUpperCase()} wins` : `${game.turn.toUpperCase()} to move`
}

const move = index => {
  const next = playMove(game, index)
  if (next === game) return

  game = next
  render()
  if (game.roundOver) resetBtn.focus()
}

boardEl.addEventListener('click', event => {
  const space = event.target.closest('.space')
  if (space) move(Number(space.dataset.index))
})

resetBtn.addEventListener('click', () => {
  game = resetRound(game)
  render()
  spaces[0].focus()
})

render()
