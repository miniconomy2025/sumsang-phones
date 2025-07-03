import { useState, useEffect, useRef } from 'react'

export function usePollingFetch(fetcher, intervalMs = 10000, useDummy = undefined) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true

    const fetchData = async () => {
      setLoading(true)
      try {
        const result = await fetcher(useDummy)
        if (isMounted.current) {
          setData(result)
          setError(null)
        }
      } catch (err) {
        if (isMounted.current) setError(err.message || 'Error')
      } finally {
        if (isMounted.current) setLoading(false)
      }
    }

    fetchData()
    const intervalId = setInterval(fetchData, intervalMs)

    return () => {
      isMounted.current = false
      clearInterval(intervalId)
    }
  }, [fetcher, intervalMs])

  return { data, error, loading }
}
