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

function PartCostsChart({ data }) {
	const transformPartCostsData = (data) => {
		if (!data?.partCostsOverTime) return [];

		const dates = data.partCostsOverTime.electronics?.map((item) => item.date) || [];

		return dates.map((date) => {
			const result = { date: date.split('-').slice(1).join('/') }; // Format: MM/DD

			Object.keys(data.partCostsOverTime).forEach((part) => {
				const entry = data.partCostsOverTime[part].find((item) => item.date === date);
				result[part] = entry ? entry.value : 0;
			});

			return result;
		});
	};

	const chartData = transformPartCostsData(data);

	return (
		<div className={styles.chartContainer}>
			<h3 className={styles.chartTitle}>Part Costs Over Time</h3>
			<ResponsiveContainer width="100%" height="100%">
				<LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="date" />
					<YAxis />
					<Tooltip formatter={(value) => `Ð${value}`} />
					<Legend />
					<Line type="monotone" dataKey="electronics" stroke="#8884d8" strokeWidth={2} />
					<Line type="monotone" dataKey="screens" stroke="#82ca9d" strokeWidth={2} />
					<Line type="monotone" dataKey="cases" stroke="#ffc658" strokeWidth={2} />
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}

export default PartCostsChart;
