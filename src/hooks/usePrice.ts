import { useState, useEffect } from 'react'

export const usePrice = () => {
  const [price, setPrice] = useState<{ display: string; note: string } | null>(null)

  useEffect(() => {
    fetch('/api/payment/price')
      .then(r => r.json())
      .then(setPrice)
  }, [])

  return price
}