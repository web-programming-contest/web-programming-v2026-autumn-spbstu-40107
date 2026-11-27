import React from 'react';
import {createRoot} from 'react-dom/client';
import './styles.css';

type Mark = 'X' | 'O';
type Cell = Mark | null;
type Mode = 'players' | 'computer';
type WinningLine = [number, number, number];

type BoardProps = {
  board: Cell[];
  winningLine: WinningLine | undefined;
  locked: boolean;
  onMove: (index: number) => void;
};

const winningLines: WinningLine[] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function emptyBoard(): Cell[] {
  return Array<Cell>(9).fill(null);
}

function getWinningLine(board: Cell[]) {
  return winningLines.find(
    ([a, b, c]) =>
      board[a] !== null && board[a] === board[b] && board[b] === board[c],
  );
}

function findWinningMove(board: Cell[], mark: Mark) {
  return board.findIndex((cell, index) => {
    if (cell !== null) {
      return false;
    }

    const next = [...board];
    next[index] = mark;

    return Boolean(getWinningLine(next));
  });
}

function getComputerMove(board: Cell[]) {
  const winningMove = findWinningMove(board, 'O');
  if (winningMove !== -1) {
    return winningMove;
  }

  const blockingMove = findWinningMove(board, 'X');
  if (blockingMove !== -1) {
    return blockingMove;
  }

  if (board[4] === null) {
    return 4;
  }

  return board.indexOf(null);
}

function Board({board, winningLine, locked, onMove}: BoardProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const cellSize = canvas.width / 3;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#ccd1dc';
    context.lineWidth = 2;
    context.beginPath();

    for (let i = 1; i < 3; i += 1) {
      const position = i * cellSize;
      context.moveTo(position, 0);
      context.lineTo(position, canvas.height);
      context.moveTo(0, position);
      context.lineTo(canvas.width, position);
    }
    context.stroke();

    if (winningLine) {
      const [first, , last] = winningLine;
      context.lineWidth = 12;
      context.lineCap = 'round';
      context.strokeStyle = '#b9decf';
      context.beginPath();
      context.moveTo(
        ((first % 3) + 0.5) * cellSize,
        (Math.floor(first / 3) + 0.5) * cellSize,
      );
      context.lineTo(
        ((last % 3) + 0.5) * cellSize,
        (Math.floor(last / 3) + 0.5) * cellSize,
      );
      context.stroke();
    }
  }, [winningLine]);

  return (
    <div
      className="board"
      data-testid="game-board"
      role="group"
      aria-label="Игровое поле"
    >
      <canvas ref={canvasRef} width="360" height="360" aria-hidden="true" />
      {board.map((cell, index) => (
        <button
          key={index}
          className={cell === 'O' ? 'cell mark-o' : 'cell'}
          type="button"
          data-testid="game-cell"
          aria-label={`Клетка ${index + 1}: ${cell ?? 'пустая'}`}
          aria-disabled={locked || cell !== null}
          onClick={() => onMove(index)}
        >
          {cell}
        </button>
      ))}
    </div>
  );
}

function App() {
  const [board, setBoard] = React.useState(emptyBoard);
  const [mode, setMode] = React.useState<Mode>('players');
  const [started, setStarted] = React.useState(false);

  const winningLine = getWinningLine(board);
  const winner = winningLine ? board[winningLine[0]] : null;
  const draw = !winner && board.every((cell) => cell !== null);
  const finished = Boolean(winner || draw);
  const turn =
    board.filter((cell) => cell !== null).length % 2 === 0 ? 'X' : 'O';
  const computerTurn = mode === 'computer' && turn === 'O' && !finished;

  React.useEffect(() => {
    if (!computerTurn) {
      return;
    }

    const timer = setTimeout(() => {
      const next = [...board];
      next[getComputerMove(board)] = 'O';
      setBoard(next);
    }, 350);

    return () => clearTimeout(timer);
  }, [board, computerTurn]);

  function startGame(nextMode: Mode) {
    setMode(nextMode);
    setBoard(emptyBoard());
    setStarted(true);
  }

  function showMenu() {
    setMode('players');
    setBoard(emptyBoard());
    setStarted(false);
  }

  function play(index: number) {
    if (finished || computerTurn || board[index] !== null) {
      return;
    }

    const next = [...board];
    next[index] = turn;
    setBoard(next);
    setStarted(true);
  }

  let heading = computerTurn ? 'Ход компьютера' : `Ход игрока ${turn}`;
  if (draw) {
    heading = 'Ничья';
  } else if (winner) {
    if (mode === 'players') {
      heading = `Победил игрок ${winner}`;
    } else {
      heading = winner === 'X' ? 'Вы победили' : 'Компьютер победил';
    }
  }

  return (
    <>
      {!started && (
        <section className="splash">
          <div>
            <h1>Крестики-нолики</h1>
            <div className="actions">
              <button type="button" onClick={() => startGame('computer')}>
                Играть с компьютером
              </button>
              <button
                className="secondary"
                type="button"
                onClick={() => startGame('players')}
              >
                Играть вдвоём
              </button>
            </div>
          </div>
        </section>
      )}

      <section className={finished ? 'game result-screen' : 'game'}>
        <p className="mode">
          {mode === 'computer' ? 'Игра с компьютером' : 'Игра вдвоём'}
        </p>
        <h2 className={finished ? 'result' : ''} aria-live="polite">
          {heading}
        </h2>
        <Board
          board={board}
          winningLine={winningLine}
          locked={finished || computerTurn}
          onMove={play}
        />
        <div className="actions">
          <button
            type="button"
            data-testid="game-restart"
            onClick={() => startGame(mode)}
          >
            {finished ? 'Сыграть ещё' : 'Начать заново'}
          </button>
          <button className="secondary" type="button" onClick={showMenu}>
            В меню
          </button>
        </div>
      </section>
    </>
  );
}

const root = document.querySelector('[data-testid="app"]');
if (!root) {
  throw new Error('Корневой элемент приложения не найден.');
}

createRoot(root).render(<App />);
