import { StockRepository } from '../repositories/StockRepository.js';
import { Stock } from '../types/StockType.js';

export class StockService {
    static async getStock(): Promise<Stock[]> {
        console.log('StockService::getStock - Starting stock retrieval');
        
        const stock = await StockRepository.getStock();
        console.log('StockService::getStock - Retrieved stock', { stockCount: stock.length });
        
        return stock;
    }
}