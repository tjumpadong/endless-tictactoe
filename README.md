# endless-tictactoe

Tic-tac-toe that cannot end in a draw. Two players take turns; only the **last seven
marks** stay on the board, so three in a row can always be attempted.

## Overview

- 3x3 board of real `<button>` cells with inline SVG X and O marks.
- Two local players share one screen — no AI opponent, no network play.
- X starts. X draws in dark ink, O in teal.
- The board holds at most 7 marks. From the 8th move on, each new move removes the
  oldest mark, so two cells stay free and a draw is impossible.
- Older marks fade slightly, so you can see which one leaves next.
- A win boxes the winning line, increments the score, and freezes the board until
  **New round**. The score survives resets.
- Light and dark themes follow the system preference; keyboard and screen-reader
  labels are supported.

## Tech stack

| Layer | What is used |
| --- | --- |
| Markup | Static HTML (`index.html`) |
| Styling | Plain CSS with custom properties; light and dark themes |
| Rules | Pure ES module `game.js` (no DOM, no dependencies) |
| UI | ES module `index.js` (DOM, SVG rendering, keyboard focus) |
| Tests | Bun's built-in runner (`bun test`), 19 tests |
| Hosting | Any static host — no build step |

## Run and test

The page uses ES modules, so serve it over HTTP instead of opening the file directly:

```bash
bun start     # serve at http://localhost:8000
bun test      # run the 19 unit tests
```

Without Bun, `python3 -m http.server 8000` serves the same files.

## Demo

Live at **https://tjumpadong.github.io/endless-tictactoe/** — deployed from `main` /
root via GitHub Pages, so every push redeploys it.
