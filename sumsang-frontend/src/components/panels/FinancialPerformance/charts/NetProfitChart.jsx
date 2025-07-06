import styles from '../../../../styles/Charts.module.css';

function NetProfitChart({ data }) {
	const formatCurrency = (value) => {
		if (value >= 1000000) {
			return `Ð${(value / 1000000).toFixed(1)}M`;
		}
		return `Ð${value.toLocaleString()}`;
	};

	const netProfit = data?.netProfit || 0;
	const totalRevenue = data?.totalRevenue || 0;
	const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

	return (
		<div className={styles.chartContainer}>
			<h3 className={styles.chartTitle}>Net Profit</h3>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100%',
					gap: '1rem',
				}}
			>
				<div
					style={{
						fontSize: '2.5rem',
						fontWeight: 'bold',
						color: '#2e7d32',
					}}
				>
					{formatCurrency(netProfit)}
				</div>
				<div
					style={{
						fontSize: '1.2rem',
						color: '#666',
						fontWeight: '500',
					}}
				>
					{profitMargin}% margin
				</div>
			</div>
		</div>
	);
}

export default NetProfitChart;
