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

function RevenueChart({ data }) {
	const transformRevenueData = (data) => {
		if (!data?.phoneModelRevenue) return [];

		return Object.entries(data.phoneModelRevenue).map(([model, revenue]) => ({
			model,
			revenue,
			fill: model === 'Z25 FE' ? '#8884d8' : model === 'Z25' ? '#82ca9d' : '#ffc658',
		}));
	};

	const chartData = transformRevenueData(data);

	const formatRevenue = (value) => {
		if (value >= 1000000) {
			return `Ð${(value / 1000000).toFixed(1)}M`;
		}
		return `Ð${value.toLocaleString()}`;
	};

	return (
		<div className={styles.chartContainer}>
			<h3 className={styles.chartTitle}>Revenue by Model</h3>
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="model" />
					<YAxis tickFormatter={formatRevenue} />
					<Tooltip
						formatter={(value) => formatRevenue(value)}
						isAnimationActive={false}
					/>
					<Bar dataKey="revenue" isAnimationActive={true}>
						{chartData.map((entry, index) => (
							<Cell key={`cell-${index}`} fill={entry.fill} />
						))}
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}

export default RevenueChart;
