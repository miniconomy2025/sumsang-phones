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

function TransfersOutChart({ data }) {
	const transformTransfersOutData = (data) => {
		if (!data?.consumerTransfersOut || !Array.isArray(data.consumerTransfersOut)) return [];

		return data.consumerTransfersOut.map((transfer) => ({
			date: transfer.date.split('-').slice(1).join('/'), // Format: MM/DD
			'Z25 FE': transfer['Z25 FE'].phonesDelivered,
			Z25: transfer['Z25'].phonesDelivered,
			'Z25 Ultra': transfer['Z25 Ultra'].phonesDelivered,
		}));
	};

	const chartData = transformTransfersOutData(data);

	return (
		<div className={styles.chartContainer}>
			<h3 className={styles.chartTitle}>Consumer Transfers Out (Phones Delivered)</h3>
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="date" />
					<YAxis />
					<Tooltip />
					<Legend />
					<Bar dataKey="Z25 FE" fill="#8884d8" />
					<Bar dataKey="Z25" fill="#82ca9d" />
					<Bar dataKey="Z25 Ultra" fill="#ffc658" />
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}

export default TransfersOutChart;
