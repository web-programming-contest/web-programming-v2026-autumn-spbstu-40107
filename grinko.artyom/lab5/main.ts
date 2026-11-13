const canvas = document.getElementById('canvas')! as HTMLCanvasElement;
const context = canvas.getContext('2d')!;

/* Sane API. Thanks to https://www.raylib.com. */
class Color {
    private constructor(
        public readonly r: number,
        public readonly g: number,
        public readonly b: number,
    ) {}

    public static fromRGB(r: number, g: number, b: number): Color {
        if (![r, g, b].every(
            x => Number.isInteger(x) && x >= 0 && x <= 255
        )) {
            throw new RangeError('Invalid RGB color');
        }

        return new Color(r, g, b);
    }

    public static fromHex(hex: string): Color {
        if (!/^#[\da-fA-F]{6}$/.test(hex)) {
            throw new TypeError('Invalid hexadecimal color');
        }

        return Color.fromRGB(
            parseInt(hex.slice(1, 3), 16),
            parseInt(hex.slice(3, 5), 16),
            parseInt(hex.slice(5, 7), 16),
        );
    }

    public toCSS(): string {
        return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }

    public toHex(): string {
        const hex = (x: number) => x.toString(16).padStart(2, '0');

        return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
    }
}

const Colors = {
    background: Color.fromHex('#282828'),
    surface: Color.fromHex('#3c3836'),
    foreground: Color.fromHex('#ebdbb2'),
    red: Color.fromHex('#fb4934'),
    blue: Color.fromHex('#83a598'),
    green: Color.fromHex('#b8bb26'),
};

/* https://easings.net */
const Easing = {
    linear: (t: number) => t,
    easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
    easeInOutCubic: (t: number) =>
        t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2,

    easeOutBack: (t: number) => {
        const c = 1.70158;

        return 1 + (c + 1) * Math.pow(t - 1, 3)
            + c * Math.pow(t - 1, 2);
    },
};

type AnimationTask = {
    start: number;
    duration: number;
    easing: (t: number) => number;
    update: (t: number) => void;
    complete?: () => void;
};

const animations: AnimationTask[] = [];

function Animate(
    duration: number,
    update: (t: number) => void,
    easing = Easing.easeOutCubic,
    complete?: () => void,
) {
    animations.push({
        start: performance.now(),
        duration,
        easing,
        update,
        complete,
    });
}

function UpdateAnimations(now: number) {
    for (let i = animations.length - 1; i >= 0; i--) {
        const animation = animations[i];

        const progress = Math.min(
            (now - animation.start) / animation.duration,
            1,
        );

        animation.update(animation.easing(progress));

        if (progress >= 1) {
            animations.splice(i, 1);
            animation.complete?.();
        }
    }
}

function ClearAnimations() {
    animations.length = 0;
}

function ClearBackground(color: Color) {
    context.fillStyle = color.toCSS();
    context.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

function DrawText(
    text: string,
    x: number,
    y: number,
    size: number,
    color: Color,
    alpha = 1,
) {
    context.save();

    context.globalAlpha = alpha;
    context.fillStyle = color.toCSS();
    context.font = `${size}px sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    context.fillText(text, x, y);
    context.restore();
}

function DrawButton(
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    hovered: boolean,
) {
    context.fillStyle = hovered
        ? Colors.foreground.toCSS()
        : Colors.surface.toCSS();

    context.fillRect(x, y, width, height);

    DrawText(
        text,
        x + width / 2,
        y + height / 2,
        20,
        hovered ? Colors.background : Colors.foreground,
    );
}

function DrawMark(
    player: Player,
    x: number,
    y: number,
    size: number,
    progress = 1,
) {
    context.save();

    context.strokeStyle = player === 1
        ? Colors.red.toCSS()
        : Colors.blue.toCSS();

    context.lineWidth = Math.max(3, size * 0.045);
    context.lineCap = 'round';

    if (player === 1) {
        const points = [
            [0.25, 0.25, 0.75, 0.75],
            [0.75, 0.25, 0.25, 0.75],
        ];

        for (const [x1, y1, x2, y2] of points) {
            context.beginPath();

            context.moveTo(
                x + size * x1,
                y + size * y1,
            );

            context.lineTo(
                x + size * (x1 + (x2 - x1) * progress),
                y + size * (y1 + (y2 - y1) * progress),
            );

            context.stroke();
        }
    } else {
        context.beginPath();

        context.arc(
            x + size / 2,
            y + size / 2,
            size * 0.3,
            -Math.PI / 2,
            -Math.PI / 2 + Math.PI * 2 * progress,
        );

        context.stroke();
    }

    context.restore();
}

function IsMouseOver(
    x: number,
    y: number,
    width: number,
    height: number,
): boolean {
    return (
        mouse.x >= x &&
        mouse.x <= x + width &&
        mouse.y >= y &&
        mouse.y <= y + height
    );
}

enum State {
    Menu,
    Game,
    GameOver,
}

enum GameMode {
    Computer,
    Local,
}

type Player = 1 | 2;
type Cell = Player | 0;
type GameResult = Player | 'draw';

const mouse = { x: 0, y: 0 };

let currentState = State.Menu;
let mode = GameMode.Computer;

let board: Cell[] = Array(9).fill(0);
let currentPlayer: Player = 1;
let winner: GameResult | null = null;

let computerThinking = false;
let screenAlpha = 1;

const markProgress = Array(9).fill(0);

function StartGame() {
    ClearAnimations();

    board = Array(9).fill(0);
    markProgress.fill(0);

    currentPlayer = 1;
    winner = null;
    computerThinking = false;

    currentState = State.Game;
    screenAlpha = 0;

    Animate(350, t => screenAlpha = t);
}

function CheckWinner(state: Cell[]): GameResult | null {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    for (const [a, b, c] of lines) {
        if (
            state[a] !== 0 &&
            state[a] === state[b] &&
            state[b] === state[c]
        ) {
            return state[a];
        }
    }

    return state.every(cell => cell !== 0)
        ? 'draw'
        : null;
}

/* https://www.justinmath.com/minimax-strategy */
function Minimax(
    state: Cell[],
    player: Player,
    depth: number,
): number {
    const result = CheckWinner(state);

    if (result === 2) return 10 - depth;
    if (result === 1) return depth - 10;
    if (result === 'draw') return 0;

    let bestScore = player === 2
        ? -Infinity
        : Infinity;

    for (let i = 0; i < 9; i++) {
        if (state[i] !== 0) continue;

        state[i] = player;

        const score = Minimax(
            state,
            player === 1 ? 2 : 1,
            depth + 1,
        );

        state[i] = 0;

        bestScore = player === 2
            ? Math.max(bestScore, score)
            : Math.min(bestScore, score);
    }

    return bestScore;
}

function ComputerMove() {
    if (currentState !== State.Game || !computerThinking) return;

    const available = board
        .map((cell, index) => cell === 0 ? index : -1)
        .filter(index => index !== -1);

    if (available.length === 0) {
        computerThinking = false;
        return;
    }

    let bestScore = -Infinity;
    let bestMove = available[0];

    for (const index of available) {
        board[index] = 2;

        const score = Minimax(board, 1, 0);

        board[index] = 0;

        if (score > bestScore) {
            bestScore = score;
            bestMove = index;
        }
    }

    computerThinking = false;
    MakeMove(bestMove, 2);
}

function FinishGame(result: GameResult) {
    winner = result;
    computerThinking = false;

    Animate(300, t => screenAlpha = 1 - t, Easing.easeInOutCubic, () => {
        currentState = State.GameOver;
        screenAlpha = 0;

        Animate(300, t => screenAlpha = t);
    });
}

function MakeMove(index: number, player: Player) {
    if (currentState !== State.Game) return;
    if (board[index] !== 0) return;
    if (player !== currentPlayer) return;

    board[index] = player;

    Animate(250, t => {
        markProgress[index] = t;
    });

    const result = CheckWinner(board);

    if (result !== null) {
        FinishGame(result);
        return;
    }

    currentPlayer = player === 1 ? 2 : 1;

    if (mode === GameMode.Computer && currentPlayer === 2) {
        computerThinking = true;

        Animate(350, () => {}, Easing.linear, ComputerMove);
    }
}

function ReturnToMenu() {
    ClearAnimations();

    currentState = State.Menu;
    computerThinking = false;
    screenAlpha = 0;

    Animate(350, t => screenAlpha = t);
}

function DrawMenu() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    DrawText(
        'TIC-TAC-TOE',
        width / 2,
        height * 0.25,
        Math.min(52, width * 0.09),
        Colors.foreground,
        screenAlpha,
    );

    DrawText(
        'Choose game mode',
        width / 2,
        height * 0.36,
        20,
        Colors.blue,
        screenAlpha,
    );

    const buttonWidth = Math.min(320, width * 0.8);
    const x = (width - buttonWidth) / 2;

    DrawButton(
        'Play against computer',
        x,
        height * 0.45,
        buttonWidth,
        55,
        IsMouseOver(x, height * 0.45, buttonWidth, 55),
    );

    DrawButton(
        'Two players',
        x,
        height * 0.45 + 75,
        buttonWidth,
        55,
        IsMouseOver(x, height * 0.45 + 75, buttonWidth, 55),
    );
}

function DrawGame() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const size = Math.min(width * 0.8, height * 0.65, 540);
    const cellSize = size / 3;

    const x = (width - size) / 2;
    const y = (height - size) / 2;

    DrawButton(
        'Back',
        20, 20, 110, 40,
        IsMouseOver(20, 20, 110, 40),
    );

    DrawText(
        computerThinking
            ? 'Computer thinking...'
            : `Player ${currentPlayer === 1 ? 'X' : 'O'} turn`,
        width / 2,
        y - 45,
        24,
        Colors.foreground,
    );

    context.save();

    context.globalAlpha = screenAlpha;
    context.strokeStyle = Colors.foreground.toCSS();
    context.lineWidth = 4;

    for (let i = 1; i < 3; i++) {
        context.beginPath();
        context.moveTo(x + i * cellSize, y);
        context.lineTo(x + i * cellSize, y + size);
        context.stroke();

        context.beginPath();
        context.moveTo(x, y + i * cellSize);
        context.lineTo(x + size, y + i * cellSize);
        context.stroke();
    }

    context.restore();

    for (let i = 0; i < 9; i++) {
        if (board[i] === 0) continue;

        DrawMark(
            board[i] as Player,
            x + (i % 3) * cellSize,
            y + Math.floor(i / 3) * cellSize,
            cellSize,
            markProgress[i],
        );
    }
}

function DrawGameOver() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const message = winner === 'draw'
        ? 'Draw!'
        : winner === 1
            ? 'X wins!'
            : 'O wins!';

    DrawText(
        message,
        width / 2,
        height * 0.35,
        42,
        Colors.foreground,
        screenAlpha,
    );

    const buttonWidth = Math.min(280, width * 0.8);
    const x = (width - buttonWidth) / 2;

    DrawButton(
        'Play again',
        x,
        height * 0.5,
        buttonWidth,
        55,
        IsMouseOver(x, height * 0.5, buttonWidth, 55),
    );

    DrawButton(
        'Main menu',
        x,
        height * 0.5 + 75,
        buttonWidth,
        55,
        IsMouseOver(x, height * 0.5 + 75, buttonWidth, 55),
    );
}

function Draw() {
    ClearBackground(Colors.background);

    switch (currentState) {
        case State.Menu:
            DrawMenu();
            break;

        case State.Game:
            DrawGame();
            break;

        case State.GameOver:
            DrawGameOver();
            break;
    }
}

function HandleClick() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (currentState === State.Menu) {
        const buttonWidth = Math.min(320, width * 0.8);
        const x = (width - buttonWidth) / 2;

        if (IsMouseOver(x, height * 0.45, buttonWidth, 55)) {
            mode = GameMode.Computer;
            StartGame();
            return;
        }

        if (IsMouseOver(x, height * 0.45 + 75, buttonWidth, 55)) {
            mode = GameMode.Local;
            StartGame();
            return;
        }
    }

    if (currentState === State.Game) {
        if (IsMouseOver(20, 20, 110, 40)) {
            ReturnToMenu();
            return;
        }

        if (computerThinking) return;
        if (mode === GameMode.Computer && currentPlayer !== 1) return;

        const size = Math.min(width * 0.8, height * 0.65, 540);
        const cellSize = size / 3;

        const x = (width - size) / 2;
        const y = (height - size) / 2;

        const col = Math.floor((mouse.x - x) / cellSize);
        const row = Math.floor((mouse.y - y) / cellSize);

        if (col < 0 || col >= 3 || row < 0 || row >= 3) return;

        MakeMove(row * 3 + col, currentPlayer);
        return;
    }

    if (currentState === State.GameOver) {
        const buttonWidth = Math.min(280, width * 0.8);
        const x = (width - buttonWidth) / 2;

        if (IsMouseOver(x, height * 0.5, buttonWidth, 55)) {
            StartGame();
            return;
        }

        if (IsMouseOver(x, height * 0.5 + 75, buttonWidth, 55)) {
            ReturnToMenu();
        }
    }
}

canvas.addEventListener('mousemove', event => {
    const rect = canvas.getBoundingClientRect();

    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
});

canvas.addEventListener('click', event => {
    const rect = canvas.getBoundingClientRect();

    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;

    HandleClick();
});

function Resize() {
    const dpr = window.devicePixelRatio || 1;

    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.display = 'block';

    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener('resize', Resize);

function Loop(now: number) {
    UpdateAnimations(now);
    Draw();

    requestAnimationFrame(Loop);
}

Resize();
requestAnimationFrame(Loop);
