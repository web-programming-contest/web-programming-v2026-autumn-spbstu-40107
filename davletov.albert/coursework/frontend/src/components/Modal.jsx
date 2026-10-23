import { useEffect } from 'react'
import './Modal.css'

function Modal({ onClose, className = '', children }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="modal" onClick={onClose}>
      <div className={`modal__window ${className}`} onClick={(event) => event.stopPropagation()}>
        <button type="button" className="modal__close" onClick={onClose} aria-label="Закрыть" />
        {children}
      </div>
    </div>
  )
}

export default Modal
