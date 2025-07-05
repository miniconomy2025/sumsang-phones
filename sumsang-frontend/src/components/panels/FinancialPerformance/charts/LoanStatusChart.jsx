import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Cell,
} from 'recharts';
import styles from '../../../../styles/Charts.module.css';

function LoanStatusChart({ data }) {
	const transformLoanData = (data) => {
		if (!data?.loanStatus) return [];

		const { amountBorrowed, repaymentsMade } = data.loanStatus;
		const remainingBalance = amountBorrowed - repaymentsMade;

		return [
			{
				category: 'Repaid',
				amount: repaymentsMade,
				fill: '#2e7d32',
			},
			{
				category: 'Remaining',
				amount: remainingBalance,
				fill: '#ff7c7c',
			},
		];
	};

	const chartData = transformLoanData(data);

	const formatCurrency = (value) => {
		if (value >= 1000000) {
			return `Ð${(value / 1000000).toFixed(1)}M`;
		}
		return `Ð${value.toLocaleString()}`;
	};

	const totalBorrowed = data?.loanStatus?.amountBorrowed || 0;
	const repaymentProgress =
		totalBorrowed > 0
			? (((data?.loanStatus?.repaymentsMade || 0) / totalBorrowed) * 100).toFixed(1)
			: 0;

	return (
		<div className={styles.chartContainer}>
			<h3 className={styles.chartTitle}>Loan Status</h3>
			<div style={{ marginBottom: '1rem', textAlign: 'center' }}>
				<div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>
					{repaymentProgress}% Repaid
				</div>
			</div>
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="category" />
					<YAxis tickFormatter={formatCurrency} />
					<Tooltip
						formatter={(value) => formatCurrency(value)}
						isAnimationActive={false}
					/>
					<Bar dataKey="amount" isAnimationActive={true}>
						{chartData.map((entry, index) => (
							<Cell key={`cell-${index}`} fill={entry.fill} />
						))}
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}

export default LoanStatusChart;
