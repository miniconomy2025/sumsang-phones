import { useEffect } from 'react';
import { getNoticesData } from '../../../api/dataFetcher';
import { usePollingFetch } from '../../../hooks/usePollingFetch';
import styles from './OperationalNotices.module.css';

function OperationalNotices() {
	const { data, loading, error } = usePollingFetch(getNoticesData, 15000);

	if (loading) return <p>Loading...</p>;
	if (error) return <p>{error}</p>;

	return (
		<main className={`grid-container ${styles.gridContainer}`}>
			<section className={`grid-panel ${styles.partCosts}`}></section>
			<section className={`grid-panel ${styles.partsInventory}`}></section>
			<section className={`grid-panel ${styles.goodsInventory}`}></section>
		</main>
	);
}

export default OperationalNotices;
