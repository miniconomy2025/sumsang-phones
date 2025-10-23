import { jest, describe, it, expect, beforeEach, beforeAll, afterAll } from '@jest/globals';
import { LogisticsService } from '../../../src/services/LogisticsService.js';
import { BulkDeliveryRepository } from '../../../src/repositories/BulkDeliveriesRepository.js';
import { PartsPurchaseRepository } from '../../../src/repositories/PartsPurchaseRepository.js';
import { InventoryRepository } from '../../../src/repositories/InventoryRepository.js';
import { MachineDeliveryRepository } from '../../../src/repositories/MachineDeliveryRepository.js';
import { MachinePurchaseRepository } from '../../../src/repositories/MachinePurchaseRepository.js';
import { MachineRepository } from '../../../src/repositories/MachineRepository.js';
import { ConsumerDeliveryRepository } from '../../../src/repositories/ConsumerDeliveriesRepository.js';
import { OrderRepository } from '../../../src/repositories/OrderRepository.js';
import { StockRepository } from '../../../src/repositories/StockRepository.js';

jest.mock('../../../src/repositories/BulkDeliveriesRepository.js');
jest.mock('../../../src/repositories/PartsPurchaseRepository.js');
jest.mock('../../../src/repositories/InventoryRepository.js');
jest.mock('../../../src/repositories/MachineDeliveryRepository.js');
jest.mock('../../../src/repositories/MachinePurchaseRepository.js');
jest.mock('../../../src/repositories/MachineRepository.js');
jest.mock('../../../src/repositories/ConsumerDeliveriesRepository.js');
jest.mock('../../../src/repositories/OrderRepository.js');
jest.mock('../../../src/repositories/StockRepository.js');

beforeAll(() => {
  (['log', 'error', 'warn', 'info', 'debug', 'table', 'trace'] as (keyof Console)[]).forEach((method) => {
    jest.spyOn(console as any, method).mockImplementation(() => {});
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('LogisticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handlePartsDelivery', () => {
    it('should process parts delivery successfully', async () => {
      const mockBulkDelivery = {
        bulkDeliveryId: 1,
        partsPurchaseId: 1,
        deliveryReference: 123,
        cost: 1000,
        unitsReceived: 500,
        address: 'test',
        accountNumber: 'ACC-123',
        createdAt: 1
      };

      const mockPartsPurchase = {
        partsPurchaseId: 1,
        partId: 1,
        referenceNumber: 123,
        cost: 1000,
        quantity: 1000,
        accountNumber: 'ACC-123',
        status: 1
      };

      jest.spyOn(BulkDeliveryRepository, 'getDeliveryByDeliveryReference')
        .mockResolvedValue(mockBulkDelivery);
      jest.spyOn(PartsPurchaseRepository, 'getPartsPurchaseById')
        .mockResolvedValue(mockPartsPurchase);
      jest.spyOn(BulkDeliveryRepository, 'updateUnitsReceived')
        .mockResolvedValue(undefined);
      jest.spyOn(InventoryRepository, 'addParts')
        .mockResolvedValue(undefined);
      jest.spyOn(PartsPurchaseRepository, 'updateStatus')
        .mockResolvedValue(undefined);

      const result = await LogisticsService.handlePartsDelivery(123, 500);

      expect(result.message).toContain('Final parts delivery processed');
    });
  });

  describe('handleMachinesDelivery', () => {
    it('should process machine delivery successfully', async () => {
      const mockMachineDelivery = {
        machineDeliveriesId: 1,
        machinePurchasesId: 1,
        deliveryReference: 456,
        cost: 50000,
        unitsReceived: 5,
        address: 'test',
        accountNumber: 'ACC-123',
        createdAt: 1
      };

      const mockMachinePurchase = {
        machinePurchasesId: 1,
        phoneId: 1,
        machinesPurchased: 10,
        totalCost: 100000,
        weightPerMachine: 1000,
        ratePerDay: 30,
        ratio: '1|2|3',
        status: 1,
        accountNumber: 'ACC-123',
        reference: 456
      };

      jest.spyOn(MachineDeliveryRepository, 'getDeliveryByDeliveryReference')
        .mockResolvedValue(mockMachineDelivery);
      jest.spyOn(MachinePurchaseRepository, 'getById')
        .mockResolvedValue(mockMachinePurchase);
      jest.spyOn(MachineDeliveryRepository, 'updateUnitsReceived')
        .mockResolvedValue(undefined);
      jest.spyOn(MachineRepository, 'createMachinesAndRatiosFromPurchase')
        .mockResolvedValue(undefined);
      jest.spyOn(MachinePurchaseRepository, 'updateStatus')
        .mockResolvedValue(undefined);

      const result = await LogisticsService.handleMachinesDelivery(456, 5);

      expect(result.message).toContain('Final machine delivery processed');
    });
  });

  describe('handlePhonesCollection', () => {
    it('should process phones collection successfully', async () => {
      const mockConsumerDelivery = {
        consumerDeliveryId: 1,
        orderId: 1,
        deliveryReference: 'REF-123',
        cost: 5000,
        unitsCollected: 5,
        accountNumber: 'ACC-123',
        createdAt: 1
      };

      jest.spyOn(ConsumerDeliveryRepository, 'getDeliveryByDeliveryReference')
        .mockResolvedValue(mockConsumerDelivery);
      jest.spyOn(OrderRepository, 'getOrderItems')
        .mockResolvedValue([{ phoneId: 1, quantity: 10 }]);
      jest.spyOn(ConsumerDeliveryRepository, 'updateUnitsCollected')
        .mockResolvedValue(undefined);
      jest.spyOn(StockRepository, 'releaseReservedStock')
        .mockResolvedValue(undefined);
      jest.spyOn(OrderRepository, 'updateStatus')
        .mockResolvedValue(undefined);

      const result = await LogisticsService.handlePhonesCollection('REF-123', 5);

      expect(result.message).toContain('Final collection');
    });
  });
});
