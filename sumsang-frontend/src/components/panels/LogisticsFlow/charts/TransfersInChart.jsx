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

function TransfersInChart({ data }) {
	const transformTransfersInData = (data) => {
		if (!data?.bulkTransfersIn || !Array.isArray(data.bulkTransfersIn)) return [];

		return data.bulkTransfersIn.map((transfer) => ({
			date: transfer.date.split('-').slice(1).join('/'), // Format: MM/DD
			electronics: transfer.electronics.volumeMoved,
			screens: transfer.screens.volumeMoved,
			cases: transfer.cases.volumeMoved,
		}));
	};

	const chartData = transformTransfersInData(data);

	return (
		<div className={styles.chartContainer}>
			<h3 className={styles.chartTitle}>Bulk Pickup Requests</h3>
			<ResponsiveContainer width="100%" height="100%">
				<LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="date" />
					<YAxis />
					<Tooltip />
					<Legend />
					<Line type="monotone" dataKey="electronics" stroke="#8884d8" strokeWidth={2} />
					<Line type="monotone" dataKey="screens" stroke="#82ca9d" strokeWidth={2} />
					<Line type="monotone" dataKey="cases" stroke="#ffc658" strokeWidth={2} />
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}

export default TransfersInChart;
