import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from 'recharts';
import styles from '../../../../styles/Charts.module.css';

function CostVsSellingPriceChart({ data }) {
	const transformCostVsSellingData = (data) => {
		if (!data?.costVsSellingPrice) return [];

		return Object.entries(data.costVsSellingPrice).map(([model, prices]) => ({
			model,
			cost: prices.costPerUnit,
			selling: prices.sellingPricePerUnit,
			profit: prices.sellingPricePerUnit - prices.costPerUnit,
		}));
	};

	const chartData = transformCostVsSellingData(data);

	const formatCurrency = (value) => {
		return `Ð${value}`;
	};

	return (
		<div className={styles.chartContainer}>
			<h3 className={styles.chartTitle}>Cost vs Selling Price</h3>
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="model" />
					<YAxis tickFormatter={formatCurrency} />
					<Tooltip
						formatter={(value) => formatCurrency(value)}
						isAnimationActive={false}
					/>
					<Legend />
					<Bar dataKey="cost" fill="#ef4444" name="Cost per Unit" />
					<Bar dataKey="selling" fill="#22c55e" name="Selling Price" />
					<Bar dataKey="profit" fill="#3b82f6" name="Profit per Unit" />
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}

export default CostVsSellingPriceChart;
