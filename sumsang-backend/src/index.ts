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
app.use('/public-api/', StockRoutes);
app.use('/internal-api/', DashboardRoutes);
app.use('/public-api', OrderRoutes);
app.use('/public-api', SimulationRoutes);
app.use('/internal-api/', LogisticsRoutes);
app.use('/internal-api', SystemSettingsRoutes);

app.use(express.json());

app.use('/public-api', StockRoutes);
app.use('/internal-api', DashboardRoutes);
app.use('/public-api', OrderRoutes);
app.use('/public-api', MachineRoutes);

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
