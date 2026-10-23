import './Choice.css'

function Radio({ label, className = '', ...props }) {
  return (
    <label className={`choice ${className}`}>
      <input type="radio" className="choice__input" {...props} />
      <span className="choice__box choice__box--radio" />
      {label && <span>{label}</span>}
    </label>
  )
}

export default Radio
