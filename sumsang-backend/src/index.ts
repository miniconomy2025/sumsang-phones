import express, {Request, Response} from 'express';
import StockRoutes from './routes/StockRoutes.js';
import DashboardRoutes from './routes/DashboardRoutes.js';

const app = express();
const PORT = 5000;

app.use('/public-api/', StockRoutes);
app.use('/public-api/', DashboardRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})