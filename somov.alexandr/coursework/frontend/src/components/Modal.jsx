import {useEffect, useId, useRef} from 'react';
import Icon from './Icon.jsx';

export default function Modal({title, onClose, children}) {
  const dialog = useRef(null);
  const titleId = useId();
  useEffect(() => { dialog.current.showModal(); }, []);

  return (
    <dialog ref={dialog} className="simple-modal" aria-labelledby={titleId} onClose={onClose} onClick={(event) => { if (event.target === event.currentTarget) dialog.current.close(); }}>
      <div className="simple-modal-inner">
        <button className="close-button" aria-label="Закрыть окно" onClick={() => dialog.current.close()}><Icon name="close" /></button>
        <h2 id={titleId}>{title}</h2>
        {children}
      </div>
    </dialog>
  );
}
