import { jest, describe, it, expect, beforeEach, beforeAll, afterAll } from '@jest/globals';
import { DailyTasksService } from '../../../src/services/DailyTasks.js';
import { OrderRepository } from '../../../src/repositories/OrderRepository.js';
import { StockRepository } from '../../../src/repositories/StockRepository.js';
import { MachineRepository } from '../../../src/repositories/MachineRepository.js';
import { InventoryRepository } from '../../../src/repositories/InventoryRepository.js';

jest.mock('../../../src/repositories/OrderRepository.js');
jest.mock('../../../src/repositories/StockRepository.js');
jest.mock('../../../src/repositories/MachineRepository.js');
jest.mock('../../../src/repositories/InventoryRepository.js');
jest.mock('../../../src/services/PricingService.js');
jest.mock('../../../src/services/MachinePurchaseService.js');

beforeAll(() => {
  (['log', 'error', 'warn', 'info', 'debug', 'table', 'trace'] as (keyof Console)[]).forEach((method) => {
    jest.spyOn(console as any, method).mockImplementation(() => {});
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('DailyTasksService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('cancelOutstandingOrders', () => {
    it('should cancel orders with insufficient payment', async () => {
      const mockOrders = [
        { orderId: 1, price: 1000, amountPaid: 500, status: 1, createdAt: 1 }
      ];

      jest.spyOn(OrderRepository, 'getOrdersWithInsufficientPayment')
        .mockResolvedValue(mockOrders);
      jest.spyOn(OrderRepository, 'updateStatus').mockResolvedValue(undefined);

      await DailyTasksService.cancelOutstandingOrders();

      expect(OrderRepository.updateStatus).toHaveBeenCalledWith(1, 7);
    });
  });

  describe('analyzeDemand', () => {
    it('should analyze demand for phones with machines', async () => {
      jest.spyOn(MachineRepository, 'getActiveMachines').mockResolvedValue([
        { machineId: 1, phoneId: 1, ratePerDay: 30, dateAcquired: 1, dateRetired: 0 }
      ]);
      jest.spyOn(OrderRepository, 'getPendingOrders').mockResolvedValue([]);
      jest.spyOn(StockRepository, 'getCurrentStockMap').mockResolvedValue(
        new Map([[1, { quantityAvailable: 5 }]])
      );

      const result = await DailyTasksService.analyzeDemand();

      expect(result).toBeInstanceOf(Map);
    });
  });

  describe('producePhones', () => {
    it('should produce phones when parts are available', async () => {
      jest.spyOn(MachineRepository, 'getMachineRatios').mockResolvedValue([
        { partId: 1, totalQuantity: 2 }
      ]);
      jest.spyOn(InventoryRepository, 'getCurrentInventoryMapped').mockResolvedValue(
        new Map([[1, 100]])
      );
      jest.spyOn(InventoryRepository, 'deductParts').mockResolvedValue(undefined);
      jest.spyOn(StockRepository, 'addStock').mockResolvedValue(undefined);

      await DailyTasksService.producePhones(1, 10);

      expect(StockRepository.addStock).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('getMaxProducibleQuantity', () => {
    it('should calculate max producible quantity based on parts', async () => {
      jest.spyOn(MachineRepository, 'getMachineRatios').mockResolvedValue([
        { partId: 1, totalQuantity: 2 },
        { partId: 2, totalQuantity: 3 }
      ]);
      jest.spyOn(InventoryRepository, 'getCurrentInventoryMapped').mockResolvedValue(
        new Map([
          [1, 20],
          [2, 30]
        ])
      );

      const result = await DailyTasksService.getMaxProducibleQuantity(1);

      expect(result).toBe(10);
    });

    it('should return 0 when no parts available', async () => {
      jest.spyOn(MachineRepository, 'getMachineRatios').mockResolvedValue([
        { partId: 1, totalQuantity: 2 }
      ]);
      jest.spyOn(InventoryRepository, 'getCurrentInventoryMapped').mockResolvedValue(
        new Map([[1, 0]])
      );

      const result = await DailyTasksService.getMaxProducibleQuantity(1);

      expect(result).toBe(0);
    });
  });

  describe('calculateExpectedPartsUsage', () => {
    it('should calculate expected parts usage', async () => {
      jest.spyOn(MachineRepository, 'getActiveMachines').mockResolvedValue([
        { machineId: 1, phoneId: 1, ratePerDay: 30, dateAcquired: 1, dateRetired: 0 }
      ]);
      jest.spyOn(MachineRepository, 'getMachineRatios').mockResolvedValue([
        { partId: 1, totalQuantity: 2 }
      ]);

      const result = await DailyTasksService.calculateExpectedPartsUsage();

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBeGreaterThan(0);
    });
  });
});
