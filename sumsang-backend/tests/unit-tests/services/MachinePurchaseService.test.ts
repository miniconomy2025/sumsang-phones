import { jest, describe, it, expect, beforeEach, beforeAll, afterAll } from '@jest/globals';
import { MachinePurchaseService } from '../../../src/services/MachinePurchaseService.js';
import { MachinePurchaseRepository } from '../../../src/repositories/MachinePurchaseRepository.js';
import { PhoneRepository } from '../../../src/repositories/PhoneRepository.js';
import { THOHService } from '../../../src/services/THOHService.js';
import { BankService } from '../../../src/services/BankService.js';

jest.mock('../../../src/repositories/MachinePurchaseRepository.js');
jest.mock('../../../src/repositories/PhoneRepository.js');
jest.mock('../../../src/services/THOHService.js');
jest.mock('../../../src/services/BankService.js');

beforeAll(() => {
  (['log', 'error', 'warn', 'info', 'debug', 'table', 'trace'] as (keyof Console)[]).forEach((method) => {
    jest.spyOn(console as any, method).mockImplementation(() => {});
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('MachinePurchaseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('recordMachinePurchase', () => {
    it('should record machine purchase successfully', async () => {
      const mockMachinePurchase = {
        orderId: 123,
        machineName: 'cosmos_z25_machine',
        quantity: 2,
        totalPrice: 40000,
        unitWeight: 1800,
        machineDetails: {
          requiredMaterials: 'cases,screens,electronics',
          inputRatio: { cases: 1, screens: 2, electronics: 5 },
          productionRate: 45
        },
        bankAccount: 'TREASURY_ACCOUNT'
      };

      jest.spyOn(PhoneRepository, 'getPhoneByModel').mockResolvedValue({
        phone_id: 1,
        model: 'Cosmos Z25',
        price: 5000
      });
      jest.spyOn(MachinePurchaseRepository, 'createMachinePurchase').mockResolvedValue(1);

      const result = await MachinePurchaseService.recordMachinePurchase(mockMachinePurchase);

      expect(result).toBe(1);
      expect(MachinePurchaseRepository.createMachinePurchase).toHaveBeenCalledTimes(1);
    });
  });

  describe('makeMachinePurchaseOrder', () => {
    it('should make machine purchase order successfully', async () => {
      const mockPurchase = {
        success: true,
        orderId: 123,
        machineName: 'cosmos_z25_machine',
        quantity: 2,
        totalPrice: 40000,
        unitWeight: 1800,
        machineDetails: {
          requiredMaterials: 'cases,screens,electronics',
          inputRatio: { cases: 1, screens: 2, electronics: 5 },
          productionRate: 45
        },
        bankAccount: 'TREASURY_ACCOUNT'
      };

      jest.spyOn(THOHService, 'purchaseMachine').mockResolvedValue(mockPurchase);
      jest.spyOn(PhoneRepository, 'getPhoneByModel').mockResolvedValue({
        phone_id: 1,
        model: 'Cosmos Z25',
        price: 5000
      });
      jest.spyOn(MachinePurchaseRepository, 'createMachinePurchase').mockResolvedValue(1);

      const result = await MachinePurchaseService.makeMachinePurchaseOrder('cosmos_z25_machine', 2);

      expect(result).toBe(1);
      expect(THOHService.purchaseMachine).toHaveBeenCalledWith('cosmos_z25_machine', 2);
    });
  });

  describe('processPendingMachinePurchases', () => {
    it('should process pending machine purchases', async () => {
      jest.spyOn(MachinePurchaseRepository, 'getPurchasesByStatus').mockResolvedValue([]);

      await MachinePurchaseService.processPendingMachinePurchases();

      expect(MachinePurchaseRepository.getPurchasesByStatus).toHaveBeenCalledTimes(1);
    });
  });

  describe('makeMachinePurchasePayment', () => {
    it('should make payment successfully', async () => {
      const mockPurchase = {
        machinePurchasesId: 1,
        phoneId: 1,
        machinesPurchased: 2,
        totalCost: 40000,
        weightPerMachine: 1800,
        ratePerDay: 45,
        ratio: '1|2|5',
        status: 1,
        accountNumber: 'ACC-123',
        reference: 123
      };

      jest.spyOn(BankService, 'makePayment').mockResolvedValue({ success: true });
      jest.spyOn(MachinePurchaseRepository, 'updateStatus').mockResolvedValue(undefined);

      await MachinePurchaseService.makeMachinePurchasePayment(mockPurchase);

      expect(BankService.makePayment).toHaveBeenCalledWith(123, 40000, 'ACC-123');
      expect(MachinePurchaseRepository.updateStatus).toHaveBeenCalledTimes(1);
    });
  });
});
