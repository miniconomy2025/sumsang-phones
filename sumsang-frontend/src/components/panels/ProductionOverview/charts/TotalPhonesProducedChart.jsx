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

function TotalPhonesProducedChart({ data }) {
	const transformPhonesProducedData = (data) => {
		if (!data || !data.totalPhonesProduced) return [];

		return Object.entries(data.totalPhonesProduced).map(([model, count]) => ({
			model,
			count,
			fill: model === 'Z25 FE' ? '#8884d8' : model === 'Z25' ? '#82ca9d' : '#ffc658',
		}));
	};
	const chartData = transformPhonesProducedData(data);

	return (
		<div className={styles.chartContainer}>
			<h2 className={styles.chartTitle}>Total Phones Produced</h2>
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="model" />
					<YAxis />
					<Tooltip isAnimationActive={false} />
					<Bar dataKey="count" isAnimationActive={true}>
						{chartData.map((entry, index) => (
							<Cell key={`cell-${index}`} fill={entry.fill} />
						))}
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}

export default TotalPhonesProducedChart;
