import './Field.css'

function Input({ label, required, error, className = '', ...props }) {
  return (
    <label className={`field ${className}`}>
      <span className="field__label">
        {label}
        {required && <span className="field__required">*</span>}
      </span>
      <input className={error ? 'field__control field__control--error' : 'field__control'} {...props} />
      {error && <span className="field__error">{error}</span>}
    </label>
  )
}

export default Input
