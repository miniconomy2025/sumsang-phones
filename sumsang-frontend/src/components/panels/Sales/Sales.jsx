import { useEffect } from 'react'
import { getSalesData } from '../../../api/dataFetcher'
import { usePollingFetch } from '../../../hooks/usePollingFetch'
import styles from './Sales.module.css'

function Sales() {
  const { data, loading, error } = usePollingFetch(getSalesData, 15000)

  useEffect(() => {
    if (data) console.log(data)
  }, [data])

  if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>

  return (
    <main className={`grid-container ${styles.gridContainer}`}>
      <section className={`grid-item ${styles.unitsSold}`}></section>
      <section className={`grid-item ${styles.revenue}`}></section>
    </main>
  )
}

export default Sales
