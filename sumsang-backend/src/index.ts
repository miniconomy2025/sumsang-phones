import express, {Request, Response} from 'express';
import StockRoutes from './routes/StockRoutes.js';
import OrderRoutes from './routes/OrderRoutes.js';
import GoodsCollectionRoutes from './routes/GoodsCollectionRoutes.js'

const app = express();
const PORT = 5000;

app.use('/public-api/', StockRoutes);
app.use('public-api', OrderRoutes);
app.use('/public-api/', GoodsCollectionRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})