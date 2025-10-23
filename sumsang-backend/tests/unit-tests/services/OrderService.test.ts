import { jest, describe, it, expect, beforeEach, beforeAll, afterAll } from '@jest/globals';
import { OrderService } from '../../../src/services/OrderService.js';
import { OrderRepository } from '../../../src/repositories/OrderRepository.js';
import { PhoneRepository } from '../../../src/repositories/PhoneRepository.js';
import { StockRepository } from '../../../src/repositories/StockRepository.js';
import { SystemSettingsRepository } from '../../../src/repositories/SystemSettingRepository.js';
import { RetailBankAPI } from '../../../src/utils/externalApis.js';

jest.mock('../../../src/repositories/OrderRepository.js');
jest.mock('../../../src/repositories/PhoneRepository.js');
jest.mock('../../../src/repositories/StockRepository.js');
jest.mock('../../../src/repositories/SystemSettingRepository.js');
jest.mock('../../../src/utils/externalApis.js');

beforeAll(() => {
  (['log', 'error', 'warn', 'info', 'debug', 'table', 'trace'] as (keyof Console)[]).forEach((method) => {
    jest.spyOn(console as any, method).mockImplementation(() => {});
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('OrderService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('placeOrder', () => {
    it('should place order successfully with valid items', async () => {
      const items = [{ model: 'Cosmos Z25', quantity: 2 }];
      
      jest.spyOn(PhoneRepository, 'phoneExists').mockResolvedValue(true);
      jest.spyOn(PhoneRepository, 'getPhoneByModel').mockResolvedValue({
        phone_id: 1,
        model: 'Cosmos Z25',
        price: 5000
      });
      jest.spyOn(SystemSettingsRepository, 'getByKey').mockResolvedValue({
        systemSettingId: 1,
        key: 'account_number',
        value: 'ACC-123'
      });
      jest.spyOn(OrderRepository, 'createOrder').mockResolvedValue({ orderId: 1 });
      jest.spyOn(OrderRepository, 'getOrderById').mockResolvedValue({
        orderId: 1,
        price: 10000,
        amountPaid: 0,
        status: 1,
        createdAt: 1,
        accountNumber: 'CUST-123'
      });
      jest.spyOn(RetailBankAPI, 'requestPayment').mockResolvedValue({ success: true });
      jest.spyOn(OrderRepository, 'updateAmountPaid').mockResolvedValue(undefined);
      jest.spyOn(OrderRepository, 'updateStatus').mockResolvedValue(undefined);

      const result = await OrderService.placeOrder('CUST-123', items);

      expect(result.orderId).toBe(1);
      expect(result.price).toBe(10000);
    });

    it('should throw validation error when items array is empty', async () => {
      await expect(OrderService.placeOrder('CUST-123', [])).rejects.toThrow('Order must include at least one item.');
    });
  });

  describe('stockAvailableForOrder', () => {
    it('should return true when sufficient stock available', async () => {
      const order = {
        orderId: 1,
        price: 5000,
        amountPaid: 5000,
        status: 2,
        createdAt: 1
      };

      jest.spyOn(OrderRepository, 'getOrderItems').mockResolvedValue([
        { phoneId: 1, quantity: 2 }
      ]);
      jest.spyOn(StockRepository, 'getCurrentStockMap').mockResolvedValue(
        new Map([[1, { quantityAvailable: 10 }]])
      );

      const result = await OrderService.stockAvailableForOrder(order);

      expect(result).toBe(true);
    });

    it('should return false when insufficient stock', async () => {
      const order = {
        orderId: 1,
        price: 5000,
        amountPaid: 5000,
        status: 2,
        createdAt: 1
      };

      jest.spyOn(OrderRepository, 'getOrderItems').mockResolvedValue([
        { phoneId: 1, quantity: 20 }
      ]);
      jest.spyOn(StockRepository, 'getCurrentStockMap').mockResolvedValue(
        new Map([[1, { quantityAvailable: 10 }]])
      );

      const result = await OrderService.stockAvailableForOrder(order);

      expect(result).toBe(false);
    });
  });
});
