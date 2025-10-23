import { jest, describe, it, expect, beforeEach, beforeAll, afterAll } from '@jest/globals';
import { MachineController } from '../../../src/controllers/MachineController.js';
import { MachineRepository } from '../../../src/repositories/MachineRepository.js';
import { PhoneRepository } from '../../../src/repositories/PhoneRepository.js';
import { MachinePurchaseService } from '../../../src/services/MachinePurchaseService.js';
import { Request, Response } from 'express';

jest.mock('../../../src/repositories/MachineRepository.js');
jest.mock('../../../src/repositories/PhoneRepository.js');
jest.mock('../../../src/services/MachinePurchaseService.js');

beforeAll(() => {
  (['log', 'error', 'warn', 'info', 'debug', 'table', 'trace'] as (keyof Console)[]).forEach((method) => {
    jest.spyOn(console as any, method).mockImplementation(() => {});
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('MachineController', () => {
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

  describe('breakMachine', () => {
    it('should retire machines and order replacements', async () => {
      mockRequest.body = {
        itemName: 'cosmos_z25_machine',
        failureQuantity: 2
      };

      jest.spyOn(PhoneRepository, 'getPhoneByModel').mockResolvedValue({
        phone_id: 1,
        model: 'Cosmos Z25',
        price: 5000
      });
      jest.spyOn(MachineRepository, 'retireMachinesByPhoneId').mockResolvedValue(undefined);
      jest.spyOn(MachinePurchaseService, 'makeMachinePurchaseOrder').mockResolvedValue(1);
      jest.spyOn(MachinePurchaseService, 'processPendingMachinePurchases').mockResolvedValue(undefined);

      await MachineController.breakMachine(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(MachineRepository.retireMachinesByPhoneId).toHaveBeenCalledWith(1, 2);
      expect(MachinePurchaseService.makeMachinePurchaseOrder).toHaveBeenCalledWith('cosmos_z25_machine', 2);
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should handle invalid request parameters', async () => {
      mockRequest.body = {
        itemName: '',
        failureQuantity: 'invalid'
      };

      await MachineController.breakMachine(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalled();
    });
  });
});
