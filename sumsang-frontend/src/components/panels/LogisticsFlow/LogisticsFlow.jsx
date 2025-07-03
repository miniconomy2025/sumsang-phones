import { useEffect } from 'react'
import { getLogisticsData } from '../../../api/dataFetcher'
import { usePollingFetch } from '../../../hooks/usePollingFetch'
import styles from './LogisticsFlow.module.css'

function LogisticsFlow() {
  const { data, loading, error } = usePollingFetch(getLogisticsData, 15000)

  useEffect(() => {
    if (data) console.log(data)
  }, [data])

  if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>

  return (
    <main className={`grid-container ${styles.gridContainer}`}>
      <section className={`grid-item ${styles.transfersIn}`}></section>
      <section className={`grid-item ${styles.transfersOut}`}></section>
    </main>
  )
}

export default LogisticsFlow
