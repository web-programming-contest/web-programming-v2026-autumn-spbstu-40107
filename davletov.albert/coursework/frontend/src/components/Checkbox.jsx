import './Choice.css'

function Checkbox({ label, className = '', ...props }) {
  return (
    <label className={`choice ${className}`}>
      <input type="checkbox" className="choice__input" {...props} />
      <span className="choice__box choice__box--checkbox" />
      {label && <span>{label}</span>}
    </label>
  )
}

export default Checkbox
