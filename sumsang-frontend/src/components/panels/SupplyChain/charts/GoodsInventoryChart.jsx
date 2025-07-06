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

function GoodsInventoryChart({ data }) {
	const transformPhonesInventoryData = (data) => {
		if (!data?.currentPhonesInventory) return [];

		return Object.entries(data.currentPhonesInventory).map(([model, count]) => ({
			model,
			count,
			fill:
				model === 'Cosmos Z25 FE'
					? '#8884d8'
					: model === 'Cosmos Z25'
					? '#82ca9d'
					: '#ffc658',
		}));
	};

	const chartData = transformPhonesInventoryData(data);

	return (
		<div className={styles.chartContainer}>
			<h3 className={styles.chartTitle}>Current Phones Inventory</h3>
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

export default GoodsInventoryChart;
