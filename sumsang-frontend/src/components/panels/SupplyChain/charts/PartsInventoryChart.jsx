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

function PartsInventoryChart({ data }) {
	const transformPartsInventoryData = (data) => {
		if (!data?.currentPartsInventory) return [];

		return Object.entries(data.currentPartsInventory).map(([part, count]) => ({
			part: part.charAt(0).toUpperCase() + part.slice(1),
			count,
			fill: part === 'Electronics' ? '#8884d8' : part === 'Screens' ? '#82ca9d' : '#ffc658',
		}));
	};

	const chartData = transformPartsInventoryData(data);

	return (
		<div className={styles.chartContainer}>
			<h3 className={styles.chartTitle}>Current Parts Inventory</h3>
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="part" />
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

export default PartsInventoryChart;
