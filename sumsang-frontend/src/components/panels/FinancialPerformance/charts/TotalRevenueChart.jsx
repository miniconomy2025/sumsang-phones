import styles from '../../../../styles/Charts.module.css';

function TotalRevenueChart({ data }) {
	const formatCurrency = (value) => {
		if (value >= 1000000) {
			return `Ð${(value / 1000000).toFixed(1)}M`;
		}
		return `Ð${value.toLocaleString()}`;
	};

	const totalRevenue = data?.totalRevenue || 0;

	return (
		<div className={styles.chartContainer}>
			<h3 className={styles.chartTitle}>Total Revenue</h3>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100%',
					fontSize: '2.5rem',
					fontWeight: 'bold',
					color: '#2e7d32',
				}}
			>
				{formatCurrency(totalRevenue)}
			</div>
		</div>
	);
}

export default TotalRevenueChart;
