import { getFinancialData } from '../../../api/dataFetcher';
import { usePollingFetch } from '../../../hooks/usePollingFetch';
import styles from './FinancialPerformance.module.css';
import TotalRevenueChart from './charts/TotalRevenueChart';
import NetProfitChart from './charts/NetProfitChart';
import TotalExpensesChart from './charts/TotalExpensesChart';
import CostVsSellingPriceChart from './charts/CostVsSellingPriceChart';

function FinancialPerformance() {
	const { data, loading, error } = usePollingFetch(getFinancialData, 15000);

	if (loading) return <p>Loading...</p>;
	if (error) return <p>{error}</p>;

	return (
		<>
			{error && <div className={styles.errorBanner}>{error}</div>}
			<main className={`grid-container ${styles.gridContainer}`}>
				<section className={`grid-panel ${styles.totalRevenue}`}>
					<TotalRevenueChart data={data} />
				</section>
				<section className={`grid-panel ${styles.netProfit}`}>
					<NetProfitChart data={data} />
				</section>
				<section className={`grid-panel ${styles.totalExpenses}`}>
					<TotalExpensesChart data={data} />
				</section>
				<section className={`grid-panel ${styles.costVsSelling}`}>
					<CostVsSellingPriceChart data={data} />
				</section>
			</main>
		</>
	);
}

export default FinancialPerformance;
