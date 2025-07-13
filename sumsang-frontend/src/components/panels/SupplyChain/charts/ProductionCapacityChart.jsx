import {
	PieChart,
	Pie,
	Tooltip,
	ResponsiveContainer,
	Cell,
	Legend,
} from 'recharts';
import styles from '../../../../styles/Charts.module.css';

const colours = ['#8884d8', '#82ca9d', '#ffc658'];

function ProductionCapacityChart({ data }) {
	const chartData = data?.currentMachines?.map((machine) => ({
		name: machine.phoneName,
		value: machine.productionCapacity,
	})) || [];

	return (
		<div className={styles.chartContainer}>
			<h3 className={styles.chartTitle}>Production Capacity Distribution</h3>
			<ResponsiveContainer width="100%" height="100%">
				<PieChart>
					<Pie
						data={chartData}
						dataKey="value"
						nameKey="name"
						cx="50%"
						cy="50%"
						outerRadius={80}
						fill="#8884d8"
						label
					>
						{chartData.map((entry, index) => (
							<Cell key={`cell-${index}`} fill={colours[index % colours.length]} />
						))}
					</Pie>
					<Tooltip />
					<Legend />
				</PieChart>
			</ResponsiveContainer>
		</div>
	);
}

export default ProductionCapacityChart;
