import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from 'recharts';
import styles from '../../../../styles/Charts.module.css';

function ProductionCapacityChart({ data }) {
	const transformProductionCapacityData = (data) => {
		if (!data?.productionCapacity) return [];

		const dates = data.productionCapacity['Cosmos Z25 FE']?.map((item) => item.date) || [];

		return dates.map((date) => {
			const result = { date: date.split('-').slice(1).join('/') }; // Format: MM/DD

			Object.keys(data.productionCapacity).forEach((model) => {
				const entry = data.productionCapacity[model].find((item) => item.date === date);
				result[model] = entry ? entry.value : 0;
			});

			return result;
		});
	};

	const chartData = transformProductionCapacityData(data);

	return (
		<div className={styles.chartContainer}>
			<h3 className={styles.chartTitle}>Production Capacity</h3>
			<ResponsiveContainer width="100%" height="100%">
				<LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="date" />
					<YAxis />
					<Tooltip />
					<Legend />
					<Line
						type="monotone"
						dataKey="Cosmos Z25 FE"
						stroke="#8884d8"
						strokeWidth={2}
					/>
					<Line type="monotone" dataKey="Cosmos Z25" stroke="#82ca9d" strokeWidth={2} />
					<Line
						type="monotone"
						dataKey="Cosmos Z25 Ultra"
						stroke="#ffc658"
						strokeWidth={2}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}

export default ProductionCapacityChart;
