import { useEffect } from 'react'
import { getProductionData } from '../../../api/dataFetcher'
import { usePollingFetch } from '../../../hooks/usePollingFetch'
import styles from './ProductionOverview.module.css'

function ProductionOverview() {
  const { data, loading, error } = usePollingFetch(getProductionData, 15000)

  useEffect(() => {
    if (data) {console.log(data)};
  }, [data])

  if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>

  return (
    <main className={`grid-container ${styles.gridContainer}`}>
      <section className={`grid-item ${styles.phonesProduced}`}></section>
      <section className={`grid-item ${styles.productionCapacity}`}></section>
      <section className={`grid-item ${styles.equipmentUsage}`}></section>
      <section className={`grid-item ${styles.costBreakdown}`}></section>
    </main>
  )
}

export default ProductionOverview
