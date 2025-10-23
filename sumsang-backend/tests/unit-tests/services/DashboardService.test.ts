import { jest, describe, it, expect, beforeEach, beforeAll, afterAll } from '@jest/globals';
import { DashboardService } from '../../../src/services/DashboardService.js';
import { DashboardRepository } from '../../../src/repositories/DashboardRepository.js';

jest.mock('../../../src/repositories/DashboardRepository.js');

beforeAll(() => {
  (['log', 'error', 'warn', 'info', 'debug', 'table', 'trace'] as (keyof Console)[]).forEach((method) => {
    jest.spyOn(console as any, method).mockImplementation(() => {});
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('DashboardService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSupplyChain', () => {
    it('should return supply chain information', async () => {
      const mockData = {
        currentPartsInventory: { cases: 100, screens: 200 },
        currentPhonesInventory: { 'Cosmos Z25': 50 },
        partCostsOverTime: {},
        currentMachines: []
      };
      jest.spyOn(DashboardRepository, 'getSupplyChain')
        .mockResolvedValue(mockData);

      const result = await DashboardService.getSupplyChain();

      expect(result).toEqual(mockData);
      expect(DashboardRepository.getSupplyChain).toHaveBeenCalledTimes(1);
    });
  });

  describe('getSales', () => {
    it('should return sales information', async () => {
      const mockData = {
        toalPhonesSold: { 'Cosmos Z25': 100 },
        phoneModelRevenue: { 'Cosmos Z25': 500000 }
      };
      jest.spyOn(DashboardRepository, 'getSales')
        .mockResolvedValue(mockData);

      const result = await DashboardService.getSales();

      expect(result).toEqual(mockData);
      expect(DashboardRepository.getSales).toHaveBeenCalledTimes(1);
    });
  });

  describe('getFinancials', () => {
    it('should return financial information', async () => {
      const mockData = {
        totalRevenue: 1000000,
        totalExpenses: { manufacturing: 500000, logistics: 100000, equipment: 200000 },
        netProfit: 200000,
        loanStatus: {},
        costVsSellingPrice: {}
      };
      jest.spyOn(DashboardRepository, 'getFinancials')
        .mockResolvedValue(mockData);

      const result = await DashboardService.getFinancials();

      expect(result).toEqual(mockData);
      expect(DashboardRepository.getFinancials).toHaveBeenCalledTimes(1);
    });
  });

  describe('getLogistics', () => {
    it('should return logistics information', async () => {
      const mockData = {
        bulkTransfersIn: [],
        consumerTransfersOut: []
      };
      jest.spyOn(DashboardRepository, 'getLogistics')
        .mockResolvedValue(mockData);

      const result = await DashboardService.getLogistics();

      expect(result).toEqual(mockData);
      expect(DashboardRepository.getLogistics).toHaveBeenCalledTimes(1);
    });
  });

  describe('getProductionStats', () => {
    it('should return production statistics', async () => {
      const mockData = {
        totalPhonesProduced: { 'Cosmos Z25': 500 },
        productionCapacity: {},
        totalManufacturingCosts: {}
      };
      jest.spyOn(DashboardRepository, 'getProductionStats')
        .mockResolvedValue(mockData);

      const result = await DashboardService.getProductionStats();

      expect(result).toEqual(mockData);
      expect(DashboardRepository.getProductionStats).toHaveBeenCalledTimes(1);
    });
  });
});
