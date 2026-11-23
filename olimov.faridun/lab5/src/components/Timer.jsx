import {useEffect, useState} from 'react';

function pad(value) {
  return String(value).padStart(2, '0');
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${pad(minutes)}:${pad(seconds)}`;
}

export function Timer() {
  const [minutes, setMinutes] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const timerId = setInterval(() => {
      setSecondsLeft((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [isRunning]);

  useEffect(() => {
    if (isRunning && secondsLeft <= 0) {
      setIsRunning(false);
      setIsFinished(true);
      alert('Готово');
    }
  }, [isRunning, secondsLeft]);

  function handleSubmit(event) {
    event.preventDefault();

    const value = Number(minutes);

    if (isRunning || !Number.isInteger(value) || value < 1) {
      return;
    }

    setSecondsLeft(value * 60);
    setIsFinished(false);
    setIsRunning(true);
  }

  function handleReset() {
    setIsRunning(false);
    setIsFinished(false);
    setSecondsLeft(0);
    setMinutes('');
  }

  return (
    <form className="timer" onSubmit={handleSubmit}>
      <input
        className="timer-input"
        type="number"
        min="1"
        step="1"
        placeholder="Минуты"
        aria-label="Минуты"
        data-testid="timer-input"
        value={minutes}
        onChange={(event) => setMinutes(event.target.value)}
      />
      <button type="submit" disabled={isRunning} data-testid="timer-start">
        Запуск
      </button>
      <button type="button" onClick={handleReset} data-testid="timer-reset">
        Сброс
      </button>
      <p className="timer-display" data-testid="timer-display">
        {formatTime(secondsLeft)}
      </p>
      {isFinished && (
        <p className="timer-message" data-testid="timer-message">
          Готово
        </p>
      )}
    </form>
  );
}
