import { useEffect } from 'react';
import { getLogisticsData } from '../../../api/dataFetcher';
import { usePollingFetch } from '../../../hooks/usePollingFetch';
import styles from './LogisticsFlow.module.css';
import TransfersInChart from './charts/TransfersInChart';
import TransfersOutChart from './charts/TransfersOutChart';

function LogisticsFlow() {
	const { data, loading, error } = usePollingFetch(getLogisticsData, 15000);

	useEffect(() => {
		if (data) console.log(data);
	}, [data]);

	if (loading) return <p>Loading...</p>;
	if (error) return <p>{error}</p>;

	return (
		<>
			{error && <div className={styles.errorBanner}>{error}</div>}
			<main className={`grid-container ${styles.gridContainer}`}>
				<section className={`grid-panel ${styles.transfersIn}`}>
					<TransfersInChart data={data} />
				</section>
				<section className={`grid-panel ${styles.transfersOut}`}>
					<TransfersOutChart data={data} />
				</section>
			</main>
		</>
	);
}

export default LogisticsFlow;
