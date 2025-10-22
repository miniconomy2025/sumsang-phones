import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { THOHService } from '../../../src/services/THOHService.js';
import { THOHAPI } from '../../../src/utils/externalApis.js';

jest.mock('../../../src/utils/externalApis.js');

beforeAll(() => {
  (['log', 'error', 'warn', 'info', 'debug', 'table', 'trace'] as (keyof Console)[]).forEach((method) => {
    jest.spyOn(console as any, method).mockImplementation(() => {});
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('THOHService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('purchaseMachine', () => {
    it('should successfully purchase machine', async () => {
      const mockResponse = {
        success: true,
        orderId: 123,
        machineName: 'cosmos_z25_machine',
        totalPrice: 20000,
        quantity: 2
      };
      jest.spyOn(THOHAPI, 'purchaseMachine')
        .mockResolvedValue(mockResponse);

      const result = await THOHService.purchaseMachine('cosmos_z25_machine', 2);

      expect(result).toEqual(mockResponse);
      expect(THOHAPI.purchaseMachine).toHaveBeenCalledWith('cosmos_z25_machine', 2);
    });

    it('should throw error when purchase fails', async () => {
      jest.spyOn(THOHAPI, 'purchaseMachine')
        .mockResolvedValue({ success: false });

      await expect(
        THOHService.purchaseMachine('cosmos_z25_machine', 2)
      ).rejects.toThrow('Failed to buy machine');
    });
  });

  describe('getAvailableMachines', () => {
    it('should return list of available machines', async () => {
      const mockMachines = [
        {
          machineName: 'cosmos_z25_machine',
          inputs: 'cases : screens : electronics',
          quantity: 120,
          inputRatio: { cases: 1, screens: 2, electronics: 5 },
          productionRate: 45,
          price: 18157
        }
      ];
      jest.spyOn(THOHAPI, 'getAvailableMachines')
        .mockResolvedValue(mockMachines);

      const result = await THOHService.getAvailableMachines();

      expect(result).toEqual(mockMachines);
      expect(result).toHaveLength(1);
      expect(THOHAPI.getAvailableMachines).toHaveBeenCalledTimes(1);
    });

    it('should throw error when API fails', async () => {
      jest.spyOn(THOHAPI, 'getAvailableMachines')
        .mockResolvedValue(null as any);

      await expect(THOHService.getAvailableMachines()).rejects.toThrow('failed to get machines');
    });
  });
});
