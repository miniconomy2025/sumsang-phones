import { useEffect } from 'react'
import { getSupplyChainData } from '../../../api/dataFetcher'
import { usePollingFetch } from '../../../hooks/usePollingFetch'
import styles from './SupplyChain.module.css'

function SupplyChain() {
  const { data, loading, error } = usePollingFetch(getSupplyChainData, 15000)

  useEffect(() => {
    if (data) console.log(data)
  }, [data])

  if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>

  return (
    <main className={`grid-container ${styles.gridContainer}`}>
      <section className={`grid-item ${styles.partCosts}`}></section>
      <section className={`grid-item ${styles.partsInventory}`}></section>
      <section className={`grid-item ${styles.goodsInventory}`}></section>
    </main>
  )
}

export default SupplyChain
