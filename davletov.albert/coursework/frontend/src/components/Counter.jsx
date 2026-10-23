import './Counter.css'

function Counter({ value, onDecrease, onIncrease }) {
  return (
    <div className="counter">
      <button type="button" className="counter__button" onClick={onDecrease} aria-label="Уменьшить">
        −
      </button>
      <span className="counter__value">{value}</span>
      <button type="button" className="counter__button" onClick={onIncrease} aria-label="Увеличить">
        +
      </button>
    </div>
  )
}

export default Counter
