import './Rating.css'

function Rating({ value }) {
  return (
    <span className="rating">
      <img src="/images/icons/star.png" alt="Рейтинг" width="20" height="20" />
      {String(value).replace('.', ',')}
    </span>
  )
}

export default Rating
