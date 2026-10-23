import './Label.css'

const TEXTS = {
  new: 'Новинка',
  hit: 'Хит',
}

function Label({ type }) {
  return <span className={`label label--${type}`}>{TEXTS[type]}</span>
}

export default Label
