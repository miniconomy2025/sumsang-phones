import express, { Request, Response } from 'express';
import cors from 'cors';
import StockRoutes from './routes/StockRoutes.js';
import DashboardRoutes from './routes/DashboardRoutes.js';
import OrderRoutes from './routes/OrderRoutes.js';
import LogisticsRoutes from './routes/LogisticsRoutes.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use('/public-api/', StockRoutes);
app.use('/internal-api/', DashboardRoutes);
app.use('/public-api', OrderRoutes);
app.use('/internal-api/', LogisticsRoutes);

app.use(express.json());

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
