import './Field.css'

function Select({ label, required, error, options, placeholder, className = '', ...props }) {
  return (
    <label className={`field ${className}`}>
      <span className="field__label">
        {label}
        {required && <span className="field__required">*</span>}
      </span>
      <select
        required={required}
        className={error ? 'field__control field__select field__control--error' : 'field__control field__select'}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="field__error">{error}</span>}
    </label>
  )
}

export default Select
