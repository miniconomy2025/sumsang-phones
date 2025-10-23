import { jest, describe, it, expect, beforeEach, beforeAll, afterAll } from '@jest/globals';
import { LogisticsController } from '../../../src/controllers/LogisticsController.js';
import { LogisticsService } from '../../../src/services/LogisticsService.js';
import { BulkDeliveryRepository } from '../../../src/repositories/BulkDeliveriesRepository.js';
import { MachineDeliveryRepository } from '../../../src/repositories/MachineDeliveryRepository.js';
import { Request, Response } from 'express';

jest.mock('../../../src/services/LogisticsService.js');
jest.mock('../../../src/repositories/BulkDeliveriesRepository.js');
jest.mock('../../../src/repositories/MachineDeliveryRepository.js');

beforeAll(() => {
  (['log', 'error', 'warn', 'info', 'debug', 'table', 'trace'] as (keyof Console)[]).forEach((method) => {
    jest.spyOn(console as any, method).mockImplementation(() => {});
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('LogisticsController', () => {
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

  describe('handleLogistics', () => {
    it('should handle DELIVERY type for bulk deliveries', async () => {
      mockRequest.body = {
        type: 'DELIVERY',
        id: 123,
        items: [{ quantity: 100 }]
      };

      jest.spyOn(BulkDeliveryRepository, 'getDeliveryByDeliveryReference')
        .mockResolvedValue({
          bulkDeliveryId: 1,
          partsPurchaseId: 1,
          deliveryReference: 123,
          cost: 1000,
          unitsReceived: 0,
          address: 'test',
          accountNumber: 'ACC-123',
          createdAt: 1
        });
      jest.spyOn(MachineDeliveryRepository, 'getDeliveryByDeliveryReference')
        .mockResolvedValue(null);
      jest.spyOn(LogisticsService, 'handlePartsDelivery')
        .mockResolvedValue({ message: 'Success' });

      await LogisticsController.handleLogistics(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(LogisticsService.handlePartsDelivery).toHaveBeenCalledWith(123, 100);
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should handle PICKUP type', async () => {
      mockRequest.body = {
        type: 'PICKUP',
        id: 'REF-123',
        quantity: 10
      };

      jest.spyOn(LogisticsService, 'handlePhonesCollection')
        .mockResolvedValue({ message: 'Success' });

      await LogisticsController.handleLogistics(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(LogisticsService.handlePhonesCollection).toHaveBeenCalledWith('REF-123', 10);
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should reject invalid type', async () => {
      mockRequest.body = {
        type: 'INVALID'
      };

      await LogisticsController.handleLogistics(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalled();
    });
  });
});
