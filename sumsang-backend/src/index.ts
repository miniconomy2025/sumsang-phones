import express, { Request, Response } from 'express';
import cors from 'cors';
import StockRoutes from './routes/StockRoutes.js';
import DashboardRoutes from './routes/DashboardRoutes.js';
import OrderRoutes from './routes/OrderRoutes.js';
import SimulationRoutes from './routes/SimulationRoute.js';
import LogisticsRoutes from './routes/LogisticsRoutes.js';
import SystemSettingsRoutes from './routes/SystemSettingsRoutes.js';
import MachineRoutes from './routes/MachineRoutes.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/public-api', StockRoutes);
app.use('/public-api', OrderRoutes);
app.use('/public-api', SimulationRoutes);
app.use('/public-api', SystemSettingsRoutes);
app.use('/public-api', LogisticsRoutes);
app.use('/public-api', MachineRoutes);

app.use('/internal-api', DashboardRoutes);

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
