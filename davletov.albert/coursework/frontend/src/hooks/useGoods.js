import { useEffect, useState } from 'react'
import { getGoods } from '../api.js'

export function useGoods() {
  const [goods, setGoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getGoods()
      .then((data) => setGoods(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { goods, loading, error }
}
