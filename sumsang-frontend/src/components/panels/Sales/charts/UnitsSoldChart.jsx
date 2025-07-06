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

function UnitsSoldChart({ data }) {
	const transformUnitsSoldData = (data) => {
		if (!data?.toalPhonesSold) return [];

		return Object.entries(data.toalPhonesSold).map(([model, units]) => ({
			model,
			units,
			fill: model === 'Z25 FE' ? '#8884d8' : model === 'Z25' ? '#82ca9d' : '#ffc658',
		}));
	};

	const chartData = transformUnitsSoldData(data);

	return (
		<div className={styles.chartContainer}>
			<h3 className={styles.chartTitle}>Total Units Sold</h3>
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="model" />
					<YAxis />
					<Tooltip isAnimationActive={false} />
					<Bar dataKey="units" isAnimationActive={true}>
						{chartData.map((entry, index) => (
							<Cell key={`cell-${index}`} fill={entry.fill} />
						))}
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}

export default UnitsSoldChart;
