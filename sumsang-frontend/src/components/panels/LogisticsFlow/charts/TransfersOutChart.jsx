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

function TransfersOutChart({ data }) {
	const transformTransfersOutData = (data) => {
		if (!data?.consumerTransfersOut || !Array.isArray(data.consumerTransfersOut)) return [];

		return data.consumerTransfersOut.map((transfer) => ({
			date: transfer.date.split('-').slice(1).join('/'),
			'Z25 FE': transfer['Cosmos Z25 FE']?.phonesDelivered || 0,
			Z25: transfer['Cosmos Z25']?.phonesDelivered || 0,
			'Z25 Ultra': transfer['Cosmos Z25 Ultra']?.phonesDelivered || 0,
		}));
	};

	const chartData = transformTransfersOutData(data);

	return (
		<div className={styles.chartContainer}>
			<h3 className={styles.chartTitle}>Consumer Delivery Pickup Requests</h3>
			<ResponsiveContainer width="100%" height="100%">
				<LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="date" />
					<YAxis />
					<Tooltip />
					<Legend />
					<Line type="monotone" dataKey="Z25 FE" stroke="#8884d8" strokeWidth={2} />
					<Line type="monotone" dataKey="Z25" stroke="#82ca9d" strokeWidth={2} />
					<Line type="monotone" dataKey="Z25 Ultra" stroke="#ffc658" strokeWidth={2} />
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}

export default TransfersOutChart;
