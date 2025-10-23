import { jest, describe, it, expect, beforeEach, beforeAll, afterAll } from '@jest/globals';
import { DashboardController } from '../../../src/controllers/DashboardController.js';
import { DashboardService } from '../../../src/services/DashboardService.js';
import { Request, Response } from 'express';

jest.mock('../../../src/services/DashboardService.js');

beforeAll(() => {
  (['log', 'error', 'warn', 'info', 'debug', 'table', 'trace'] as (keyof Console)[]).forEach((method) => {
    jest.spyOn(console as any, method).mockImplementation(() => {});
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('DashboardController', () => {
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

  describe('getSupplyChain', () => {
    it('should return supply chain data successfully', async () => {
        const mockSupplyChainData = {
        currentPartsInventory: { partA: 100, partB: 200 },
        currentPhonesInventory: { phoneX: 50, phoneY: 75 },
        partCostsOverTime: {
            partA: [{ date: '2025-10-23', value: 10 }],
            partB: [{ date: '2025-10-23', value: 15 }]
        },
        currentMachines: [
            { phoneName: 'PhoneX', operationalMachines: 5, brokenMachines: 1, productionCapacity: 10 },
            { phoneName: 'PhoneY', operationalMachines: 3, brokenMachines: 0, productionCapacity: 8 }
        ]
        };

      jest.spyOn(DashboardService, 'getSupplyChain').mockResolvedValue(mockSupplyChainData);

      await DashboardController.getSupplyChain(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(DashboardService.getSupplyChain).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
    });
  });

  describe('getSales', () => {
    it('should return sales data successfully', async () => {
      const mockData = { toalPhonesSold: {}, phoneModelRevenue: {} };
      jest.spyOn(DashboardService, 'getSales').mockResolvedValue(mockData);

      await DashboardController.getSales(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(DashboardService.getSales).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
    });
  });

  describe('getFinancials', () => {
    it('should return financial data successfully', async () => {
        const mockFinancialsData = {
        totalRevenue: 100000,
        totalExpenses: { manufacturing: 30000, logistics: 20000, equipment: 10000 },
        netProfit: 50000,
        loanStatus: { loan1: 10000, loan2: 5000 },
        costVsSellingPrice: {
            phoneA: { costPerUnit: 100, sellingPricePerUnit: 200 },
            phoneB: { costPerUnit: 150, sellingPricePerUnit: 300 }
        }
        };

      jest.spyOn(DashboardService, 'getFinancials').mockResolvedValue(mockFinancialsData);

      await DashboardController.getFinancials(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(DashboardService.getFinancials).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
    });
  });

  describe('getLogistics', () => {
    it('should return logistics data successfully', async () => {
      const mockData = { bulkTransfersIn: [], consumerTransfersOut: [] };
      jest.spyOn(DashboardService, 'getLogistics').mockResolvedValue(mockData);

      await DashboardController.getLogistics(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(DashboardService.getLogistics).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
    });
  });

  describe('getProductionStats', () => {
    it('should return production stats successfully', async () => {
        const mockProductionStatsData = {
            totalPhonesProduced: {
                PhoneX: 1000,
                PhoneY: 500
            },
            productionCapacity: {
                PhoneX: [{ date: '2025-10-23', value: 120 }],
                PhoneY: [{ date: '2025-10-23', value: 80 }]
            },
            totalManufacturingCosts: {
                PhoneX: { labor: 2000, materials: 5000 },
                PhoneY: { labor: 1000, materials: 3000 }
            }
        };

      jest.spyOn(DashboardService, 'getProductionStats').mockResolvedValue(mockProductionStatsData);

      await DashboardController.getProductionStats(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(DashboardService.getProductionStats).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
    });
  });
});
