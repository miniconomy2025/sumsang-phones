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
			<h3 className={styles.chartTitle}>Bulk Transfers In (Volume)</h3>
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="date" />
					<YAxis />
					<Tooltip />
					<Legend />
					<Bar dataKey="electronics" fill="#8884d8" />
					<Bar dataKey="screens" fill="#82ca9d" />
					<Bar dataKey="cases" fill="#ffc658" />
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}

export default TransfersInChart;
