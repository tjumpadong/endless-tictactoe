# endless-tictactoe

Tic-tac-toe that cannot end in a draw. Two players take turns; only the **last seven
marks** stay on the board, so three in a row can always be attempted.

## Overview

- 3x3 board of real `<button>` cells, rendered with inline SVG X and O marks.
- Two local players share one screen — no AI opponent, no network play.
- X starts. X draws in dark ink, O in teal.
- **Endless rule:** the board holds at most 7 marks. From the 8th move on, each new
  move removes the oldest mark, so two cells are always free and a draw is impossible.
- Older marks fade slightly, so you can see which mark will leave next.
- A win boxes the winning line in the winner's colour, increments the score, and
  freezes the board until **New round**. The score survives resets.
- Light and dark themes follow the system preference; keyboard, focus rings, and
  screen-reader labels are supported.

## Tech stack

| Layer | What is used |
| --- | --- |
| Markup | Static HTML (`index.html`) |
| Styling | Plain CSS with custom properties; light and dark themes |
| Rules | Pure ES module `game.js` (no DOM, no dependencies) |
| UI | ES module `index.js` (DOM, SVG rendering, keyboard focus) |
| Tests | Bun's built-in test runner (`bun test`), 19 tests |
| Hosting | Any static host — no build step, no backend |

`package.json` exists only for the `test`/`start` scripts and to mark the project as
ES modules.

## Request flow

There is no API server. The browser loads four static files, then everything happens
in the page.

**Page load**

1. `index.html` → `style.css`, `index.js` (a module, so it runs after the DOM exists).
2. `index.js` imports `game.js`, creates the initial game, and renders it: cell labels,
   score, turn status, and the empty board.

**Player move**

1. A click on a cell (or Enter/Space on a focused cell) reaches the board's delegated
   click handler → `move(index)`.
2. `playMove(game, index)` (in `game.js`) returns a new state:
   - rejects a taken cell, an invalid index, or any move after the round ended;
   - marks the cell and pushes the move index;
   - if more than 7 moves are live, removes the oldest mark from the board;
   - looks for a line on the **resulting** board, and on a win sets `roundOver` and
     increments the winner's score.
3. `render()` repaints from that state: SVG mark only when the cell's mark changed,
   `win` class on the winning line, `--age` for the fade, score chips, status text.
   On a win, focus moves to **New round**.

**New round**

1. `resetRound(game)` returns a fresh game that keeps the score.
2. `render()` clears the board and status; focus returns to the first cell.

## API interface

No HTTP endpoints. The public interface is the `game.js` module plus the DOM contract.

**`game.js` exports**

| Name | Signature | Behaviour |
| --- | --- | --- |
| `createGame` | `() → Game` | Empty board, X to move, score `{ x: 0, o: 0 }` |
| `playMove` | `(game: Game, index: number) → Game` | New state for a legal move; returns the same object when illegal |
| `resetRound` | `(game: Game) → Game` | Fresh round, score preserved |
| `findWin` | `(board: string[9], player: 'x' \| 'o') → number[]` | Winning line or `[]` |
| `WIN_PATTERN` | `number[][]` | The 8 winning lines |
| `VISIBLE_MOVES` | `7` | Sliding-window size |
| `EMPTY` | `'-'` | Empty-cell marker |

`Game` is `{ board, moves, turn, roundOver, win, score }`:

| Field | Type | Meaning |
| --- | --- | --- |
| `board` | `string[9]` | `'-'`, `'x'` or `'o'` per cell, row-major |
| `moves` | `number[]` | Board indexes of live marks, oldest first |
| `turn` | `'x' \| 'o'` | Player to move (the winner once a round ends) |
| `roundOver` | `boolean` | True after a win |
| `win` | `number[]` | Winning line, or `[]` |
| `score` | `{ x, o }` | Wins per player |

**DOM contract (`index.html` / `index.js`)**

| Selector / attribute | Purpose |
| --- | --- |
| `.space[data-index="0..8"]` | Board button; `data-mark` holds its current mark |
| `.space.win` | Winning cells, boxed in the winner's colour |
| `--age` (inline style) | 0–6, position in the expiry queue; drives the fade |
| `#status` | `role="status"` line: "X to move", "O wins", … |
| `#score-x-value` / `#score-o-value` | Score numbers (tabular figures) |
| `#score-x` / `#score-o` | Score chips; `.active` for the player to move, `.winner` after a win |
| `#reset-btn` | Starts a new round, keeps the score |
| `#board.round-over` | Set while a won round is frozen |

## Tests

```bash
bun test
```

`game.test.js` covers setup, turn order, illegal moves, immutability, horizontal /
vertical / diagonal wins, scoring once per win, the 7-mark window, expiry order, win
detection after expiry, reset behaviour, and an 80-move run proving the board never
fills.

## Setup & deployment

**Local** — the page uses ES modules, so it must be served over HTTP (`file://` is
blocked by module CORS):

```bash
bun start                 # python3 -m http.server 8000
# or: python3 -m http.server 8000
# then open http://localhost:8000
```

**Deploy** — upload `index.html`, `style.css`, `index.js`, `game.js` to any static
host (GitHub Pages, Netlify, Vercel, S3, nginx). Nothing needs configuring at runtime.

For GitHub Pages: **Settings → Pages → Source: Deploy from a branch → `main` / root**.
That publishes the site at `https://<user>.github.io/endless-tictactoe/`.

## Demo

Live at **https://tjumpadong.github.io/endless-tictactoe/**, deployed from `main` /
root via GitHub Pages (every push to `main` redeploys it).

To run it locally:

1. Clone `git@github.com:tjumpadong/endless-tictactoe.git`.
2. Run `bun start` and open `http://localhost:8000`.
3. Click or tab-and-Enter cells. After the seventh mark, the oldest one leaves with
   each new move; a win boxes the line and updates the score; **New round** resets the
   board but keeps the score.
