import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import styles from '../../../../styles/Charts.module.css';

function CostBreakdownChart({ data }) {
	const [selectedModel, setSelectedModel] = useState('Cosmos Z25');

	const transformCostBreakdownData = (data, selectedModel = 'Cosmos Z25') => {
		if (!data?.totalManufacturingCosts?.[selectedModel]) return [];

		const costs = data.totalManufacturingCosts[selectedModel];
		const colors = ['#8884d8', '#82ca9d', '#ffc658'];

		return Object.entries(costs).map(([component, cost], index) => ({
			name: component.charAt(0).toUpperCase() + component.slice(1),
			value: cost,
			fill: colors[index % colors.length],
		}));
	};

	const chartData = transformCostBreakdownData(data, selectedModel);

	return (
		<div className={styles.chartContainer}>
			<div className={styles.chartHeader}>
				<h3 className={styles.chartTitle}>Manufacturing Costs</h3>
				<select
					value={selectedModel}
					onChange={(e) => setSelectedModel(e.target.value)}
					className={styles.modelSelector}
				>
					<option value="Cosmos Z25 FE">Cosmos Z25 FE</option>
					<option value="Cosmos Z25">Cosmos Z25</option>
					<option value="Cosmos Z25 ultra">Z25 Ultra</option>
				</select>
			</div>
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
					<Tooltip formatter={(value) => `Ð${value.toLocaleString()}`} />
				</PieChart>
			</ResponsiveContainer>
		</div>
	);
}

export default CostBreakdownChart;
