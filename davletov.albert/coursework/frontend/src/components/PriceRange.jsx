import './PriceRange.css'

function PriceRange({ min, max, from, to, onChange }) {
  const fromNumber = from === '' ? min : Number(from)
  const toNumber = to === '' ? max : Number(to)
  const percent = (value) => ((value - min) / (max - min || 1)) * 100

  return (
    <div className="price-range">
      <div className="price-range__inputs">
        <label className="price-range__field">
          <span>От</span>
          <input
            type="number"
            min={min}
            max={max}
            value={from}
            onChange={(event) => onChange(event.target.value, to)}
          />
        </label>
        <label className="price-range__field">
          <span>До</span>
          <input
            type="number"
            min={min}
            max={max}
            value={to}
            onChange={(event) => onChange(from, event.target.value)}
          />
        </label>
      </div>

      <div className="price-range__slider">
        <div
          className="price-range__fill"
          style={{ left: `${percent(fromNumber)}%`, right: `${100 - percent(toNumber)}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={10}
          value={fromNumber}
          onChange={(event) => onChange(Math.min(Number(event.target.value), toNumber), to)}
          aria-label="Цена от"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={10}
          value={toNumber}
          onChange={(event) => onChange(from, Math.max(Number(event.target.value), fromNumber))}
          aria-label="Цена до"
        />
      </div>
    </div>
  )
}

export default PriceRange
