import { useEffect } from 'react';
import { getSalesData } from '../../../api/dataFetcher';
import { usePollingFetch } from '../../../hooks/usePollingFetch';
import styles from './Sales.module.css';
import UnitsSoldChart from './charts/UnitsSoldChart';
import RevenueChart from './charts/RevenueChart';

function Sales() {
	const { data, loading, error } = usePollingFetch(getSalesData, 15000);

	useEffect(() => {
		if (data) console.log(data);
	}, [data]);

	if (loading) return <p>Loading...</p>;
	if (error) return <p>{error}</p>;

	return (
		<>
			{error && <div className={styles.errorBanner}>{error}</div>}
			<main className={`grid-container ${styles.gridContainer}`}>
				<section className={`grid-panel ${styles.unitsSold}`}>
					<UnitsSoldChart data={data} />
				</section>
				<section className={`grid-panel ${styles.revenue}`}>
					<RevenueChart data={data} />
				</section>
			</main>
		</>
	);
}

export default Sales;
