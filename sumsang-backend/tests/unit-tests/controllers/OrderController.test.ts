import { jest, describe, it, expect, beforeEach, beforeAll, afterAll } from '@jest/globals';
import { OrderController } from '../../../src/controllers/OrderController.js';
import { OrderService } from '../../../src/services/OrderService.js';
import { Request, Response } from 'express';

jest.mock('../../../src/services/OrderService.js');

beforeAll(() => {
  (['log', 'error', 'warn', 'info', 'debug', 'table', 'trace'] as (keyof Console)[]).forEach((method) => {
    jest.spyOn(console as any, method).mockImplementation(() => {});
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('OrderController', () => {
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

  describe('placeOrder', () => {
    it('should place order successfully with valid data', async () => {
      mockRequest.body = {
        items: [{ model: 'Cosmos Z25', quantity: 2 }],
        account_number: 'ACC-123'
      };

      const mockResult = { orderId: 1, price: 10000 };
      jest.spyOn(OrderService, 'placeOrder').mockResolvedValue(mockResult);

      await OrderController.placeOrder(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(OrderService.placeOrder).toHaveBeenCalledWith('ACC-123', [
        { model: 'Cosmos Z25', quantity: 2 }
      ]);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockResult);
    });

    it('should handle invalid items array', async () => {
      mockRequest.body = {
        items: [],
        account_number: 'ACC-123'
      };

      await OrderController.placeOrder(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalled();
    });

    it('should validate item structure', async () => {
      mockRequest.body = {
        items: [{ model: 'Cosmos Z25', quantity: -1 }],
        account_number: 'ACC-123'
      };

      await OrderController.placeOrder(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalled();
    });
  });
});
