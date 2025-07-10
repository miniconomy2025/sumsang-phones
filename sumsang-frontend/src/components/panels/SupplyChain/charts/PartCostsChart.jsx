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

		const allDates = new Set();
		Object.keys(data.partCostsOverTime).forEach((part) => {
			data.partCostsOverTime[part].forEach((item) => {
				allDates.add(item.date);
			});
		});

		const sortedDates = Array.from(allDates).sort((a, b) => new Date(a) - new Date(b));

		return sortedDates.map((date) => {
			const result = { date: date.split('-').slice(1).join('/') };

			Object.keys(data.partCostsOverTime).forEach((part) => {
				const entry = data.partCostsOverTime[part].find((item) => item.date === date);
				if (entry) {
					result[part] = entry.value;
				}
			});

			return result;
		});
	};

	const chartData = transformPartCostsData(data);

	const partCategories = data?.partCostsOverTime ? Object.keys(data.partCostsOverTime) : [];
	
	const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];

	return (
		<div className={styles.chartContainer}>
			<h3 className={styles.chartTitle}>Part Costs Over Time</h3>
			<ResponsiveContainer width="100%" height="100%">
				<LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="date" />
					<YAxis />
					<Tooltip 
						formatter={(value) => value !== null ? `Ð${value}` : 'No data'} 
						labelFormatter={(label) => `Date: ${label}`}
					/>
					<Legend />
					{partCategories.map((part, index) => (
						<Line
							key={part}
							type="monotone"
							dataKey={part}
							stroke={colors[index % colors.length]}
							strokeWidth={2}
							connectNulls={true}
							dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
						/>
					))}
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}

export default PartCostsChart;