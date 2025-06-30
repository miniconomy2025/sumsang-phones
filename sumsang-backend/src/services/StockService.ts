import { StockRepository } from '../repositories/StockRepository.js';
import { Stock } from '../types/StockType.js';

export class StockService {
    static async getStock(): Promise<Stock[]> {
        const stock = await StockRepository.getStock();
        return stock;
    }
}