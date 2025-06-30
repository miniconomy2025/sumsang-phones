import express, {Request, Response} from 'express';
import StockRoutes from './routes/StockRoutes.js';

const app = express();
const PORT = 5000;

app.use('/api/', StockRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})