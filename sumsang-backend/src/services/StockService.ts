import { StockRepository } from '../repositories/StockRepository.js';

export class StockService {
    static async getStock() {
        const stock = await StockRepository.getStock();
        return stock;
    }
}