const WIN_PATTERN = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]
const WIN_PATTERN_LENGTH = WIN_PATTERN.length

const checkedState = new Array(9).fill(0)
let turn = 1
let score = [0, 0]

const isWinning = (state, turn) => {
  let winSpacePattern = []
  for (let i = 0; i < WIN_PATTERN_LENGTH; i++) {
    const pattern = WIN_PATTERN[i]
    if (state[pattern[0]] === turn && state[pattern[1]] === turn && state[pattern[2]] === turn) {
      winSpacePattern = pattern
      break
    }
  }
  return winSpacePattern
}

const initialize = () => {
  const spaces = document.getElementsByClassName('space')

  const handleClickSpace = element => {
    const index = element.target.getAttribute('data-index')
    if (checkedState[index] === 0) {
      element.target.classList.add(`checked-${turn}`)
      checkedState[index] = turn

      const winSpacePattern = isWinning(checkedState, turn)
      if (winSpacePattern.length > 0) {
        // highlight
        winSpacePattern.forEach((highlightIndex) => {
          spaces[highlightIndex].classList.add('win-highlight')
        })

        // update score
        score[turn - 1] += 1
        const scoreLabel = document.getElementById('score-label')
        scoreLabel.textContent = `Score A: ${score[0]}\r\nScore B: ${score[1]}`

        resetSpaces()
      } else {
        turn = turn === 1 ? 2 : 1
      }
    }
  }

  const resetSpaces = () => {
    Array.from(spaces).forEach(space => {
      space.removeEventListener('click', handleClickSpace)
    })
  }

  Array.from(spaces).forEach(space => {
    space.addEventListener('click', handleClickSpace)
  })
}

document.addEventListener('DOMContentLoaded', () => {
  initialize()

  const resetBtn = document.getElementById('reset-btn')
  resetBtn.addEventListener('click', () => {
    const spaces = document.getElementsByClassName('space')
    Array.from(spaces).forEach((space, index) => {
      space.classList.remove('checked-1', 'checked-2', 'win-highlight')
      checkedState[index] = 0
      turn = 1
    })

    initialize()
  })
})