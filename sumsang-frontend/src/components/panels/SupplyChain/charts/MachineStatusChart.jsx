import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	ResponsiveContainer,
	CartesianGrid,
} from 'recharts';
import styles from '../../../../styles/Charts.module.css';

function MachineStatusChart({ data }) {
	const chartData = data?.currentMachines?.map((machine) => ({
		phone: machine.phoneName,
		Operational: machine.operationalMachines,
		Broken: machine.brokenMachines,
	})) || [];

	return (
		<div className={styles.chartContainer}>
			<h3 className={styles.chartTitle}>Machine Status per Phone</h3>
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="phone" />
					<YAxis allowDecimals={false} />
					<Tooltip />
					<Legend />
					<Bar dataKey="Operational" stackId="a" fill="#82ca9d" />
					<Bar dataKey="Broken" stackId="a" fill="#ff6961" />
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}

export default MachineStatusChart;
