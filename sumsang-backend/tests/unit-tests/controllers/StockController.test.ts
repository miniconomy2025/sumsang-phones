import { jest, describe, it, expect, beforeEach, beforeAll, afterAll } from '@jest/globals';
import { StockController } from '../../../src/controllers/StockController.js';
import { StockService } from '../../../src/services/StockService.js';
import { Request, Response } from 'express';

jest.mock('../../../src/services/StockService.js');

beforeAll(() => {
  (['log', 'error', 'warn', 'info', 'debug', 'table', 'trace'] as (keyof Console)[]).forEach((method) => {
    jest.spyOn(console as any, method).mockImplementation(() => {});
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('StockController', () => {
  let mockRequest!: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockJson = jest.fn().mockReturnThis(); 
    mockStatus = jest.fn().mockReturnThis(); 

    mockRequest = {};
    mockResponse = {
      status: mockStatus,
      json: mockJson
    } as Partial<Response>; 
  });

  describe('getStock', () => {
    it('should return stock data successfully', async () => {
      const mockStock = [
        { phoneId: 1, name: 'Cosmos Z25', quantity: 10, price: 5000 }
      ];

      jest.spyOn(StockService, 'getStock').mockResolvedValue(mockStock);

      await StockController.getStock(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(StockService.getStock).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockStock);
    });

    it('should handle errors when getting stock fails', async () => {
      const error = new Error('Database error');
      jest.spyOn(StockService, 'getStock').mockRejectedValue(error);

      await StockController.getStock(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalled();
    });
  });
});
