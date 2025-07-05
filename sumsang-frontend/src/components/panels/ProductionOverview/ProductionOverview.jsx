import { useEffect } from 'react';
import { getProductionData } from '../../../api/dataFetcher';
import { usePollingFetch } from '../../../hooks/usePollingFetch';
import styles from './ProductionOverview.module.css';
import TotalPhonesProducedChart from './charts/TotalPhonesProducedChart';
import ProductionCapacityChart from './charts/ProductionCapacityChart';
import CostBreakdownChart from './charts/CostBreakdownChart';

function ProductionOverview() {
	const { data, loading, error } = usePollingFetch(getProductionData, 15000);

	useEffect(() => {
		if (data) {
			console.log(data);
		}
	}, [data]);

	if (loading) return <p>Loading...</p>;
	if (error && error === 'Failed to fetch') return <p>Failed to fetch</p>;

	return (
		<>
			{error && <div className={styles.errorBanner}>{error}</div>}
			<main className={`grid-container ${styles.gridContainer}`}>
				<section className={`grid-panel ${styles.phonesProduced}`}>
					<TotalPhonesProducedChart data={data} />
				</section>
				<section className={`grid-panel ${styles.productionCapacity}`}>
					<ProductionCapacityChart data={data} />
				</section>
				<section className={`grid-panel ${styles.costBreakdown}`}>
					<CostBreakdownChart data={data} />
				</section>
			</main>
		</>
	);
}

export default ProductionOverview;
