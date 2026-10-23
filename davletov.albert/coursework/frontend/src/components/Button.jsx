import './Button.css'

function Button({ variant = 'blue', icon, className = '', children, ...props }) {
  return (
    <button type="button" className={`button button--${variant} ${className}`} {...props}>
      {icon && <img src={icon} alt="" className="button__icon" />}
      {children}
    </button>
  )
}

export default Button
