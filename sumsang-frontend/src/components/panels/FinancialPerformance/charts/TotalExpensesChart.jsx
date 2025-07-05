import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import styles from '../../../../styles/Charts.module.css';

function TotalExpensesChart({ data }) {
	const transformExpensesData = (data) => {
		if (!data?.totalExpenses) return [];

		const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

		return Object.entries(data.totalExpenses).map(([category, amount], index) => ({
			name: category.charAt(0).toUpperCase() + category.slice(1),
			value: amount,
			fill: colors[index % colors.length],
		}));
	};

	const chartData = transformExpensesData(data);

	const formatCurrency = (value) => {
		if (value >= 1000000) {
			return `Ð${(value / 1000000).toFixed(1)}M`;
		}
		return `Ð${value.toLocaleString()}`;
	};

	return (
		<div className={styles.chartContainer}>
			<h3 className={styles.chartTitle}>Total Expenses Breakdown</h3>
			<ResponsiveContainer width="100%" height="100%">
				<PieChart>
					<Pie
						data={chartData}
						cx="50%"
						cy="50%"
						labelLine={false}
						label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
						outerRadius={80}
						fill="#8884d8"
						dataKey="value"
						isAnimationActive={false}
					>
						{chartData.map((entry, index) => (
							<Cell key={`cell-${index}`} fill={entry.fill} />
						))}
					</Pie>
					<Tooltip formatter={(value) => formatCurrency(value)} />
					<Legend />
				</PieChart>
			</ResponsiveContainer>
		</div>
	);
}

export default TotalExpensesChart;
