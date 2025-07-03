import { useEffect } from 'react'
import { getFinancialData } from '../../../api/dataFetcher'
import { usePollingFetch } from '../../../hooks/usePollingFetch'
import styles from './FinancialPerformance.module.css'

function FinancialPerformance() {
  const { data, loading, error } = usePollingFetch(getFinancialData, 15000)

  useEffect(() => {
    if (data) console.log(data)
  }, [data])

  if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>

  return (
    <main className={`grid-container ${styles.gridContainer}`}>
      <section className={`grid-item ${styles.totalRevenue}`}></section>
      <section className={`grid-item ${styles.netProfit}`}></section>
      <section className={`grid-item ${styles.totalExpenses}`}></section>
      <section className={`grid-item ${styles.loanStatus}`}></section>
    </main>
  )
}

export default FinancialPerformance
