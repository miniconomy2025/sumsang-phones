import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { StockService } from '../../../src/services/StockService.js';
import { StockRepository } from '../../../src/repositories/StockRepository.js';
import { Stock } from '../../../src/types/StockType.js';

// Mock the StockRepository
jest.mock('../../../src/repositories/StockRepository.js');

describe('StockService', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStock', () => {
    it('should return stock data when repository returns data', async () => {
      // Arrange
      const mockStock: Stock[] = [
        { phoneId: 1, name: 'Cosmos Z25', quantity: 10, price: 5000 },
        { phoneId: 2, name: 'Cosmos Z25 Ultra', quantity: 5, price: 8000 },
        { phoneId: 3, name: 'Cosmos Z25 FE', quantity: 15, price: 4000 }
      ];

      // Mock the repository method
      const mockGetStock = jest.spyOn(StockRepository, 'getStock')
        .mockResolvedValue(mockStock);

      // Act
      const result = await StockService.getStock();

      // Assert
      expect(result).toEqual(mockStock);
      expect(result).toHaveLength(3);
      expect(mockGetStock).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no stock is available', async () => {
      // Arrange
      const mockStock: Stock[] = [];
      
      const mockGetStock = jest.spyOn(StockRepository, 'getStock')
        .mockResolvedValue(mockStock);

      // Act
      const result = await StockService.getStock();

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(mockGetStock).toHaveBeenCalledTimes(1);
    });

    it('should throw error when repository throws error', async () => {
      // Arrange
      const errorMessage = 'Database connection failed';
      
      jest.spyOn(StockRepository, 'getStock')
        .mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(StockService.getStock()).rejects.toThrow(errorMessage);
    });

    it('should return correct stock structure with all properties', async () => {
      // Arrange
      const mockStock: Stock[] = [
        { phoneId: 1, name: 'Cosmos Z25', quantity: 10, price: 5000 }
      ];

      jest.spyOn(StockRepository, 'getStock')
        .mockResolvedValue(mockStock);

      // Act
      const result = await StockService.getStock();

      // Assert
      expect(result[0]).toHaveProperty('phoneId');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('quantity');
      expect(result[0]).toHaveProperty('price');
      expect(typeof result[0].phoneId).toBe('number');
      expect(typeof result[0].name).toBe('string');
      expect(typeof result[0].quantity).toBe('number');
      expect(typeof result[0].price).toBe('number');
    });
  });
});
