import { jest, describe, it, expect, beforeEach, beforeAll, afterAll } from '@jest/globals';
import { PricingService } from '../../../src/services/PricingService.js';
import { PhoneRepository } from '../../../src/repositories/PhoneRepository.js';
import { MachineRepository } from '../../../src/repositories/MachineRepository.js';
import { SupplierRepository } from '../../../src/repositories/SupplierRepository.js';
import { CaseSuppliers, ScreenSuppliers, ElectronicsSuppliers } from '../../../src/utils/externalApis.js';

jest.mock('../../../src/repositories/PhoneRepository.js');
jest.mock('../../../src/repositories/MachineRepository.js');
jest.mock('../../../src/repositories/SupplierRepository.js');
jest.mock('../../../src/utils/externalApis.js');

beforeAll(() => {
  (['log', 'error', 'warn', 'info', 'debug', 'table', 'trace'] as (keyof Console)[]).forEach((method) => {
    jest.spyOn(console as any, method).mockImplementation(() => {});
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('PricingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updatePhonePricesDaily', () => {
    it('should update phone prices successfully', async () => {
      // Mock part costs
      jest.spyOn(CaseSuppliers, 'getCasesCost').mockResolvedValue({
        success: true,
        cost: 25
      });
      jest.spyOn(ScreenSuppliers, 'getScreensCost').mockResolvedValue({
        success: true,
        cost: 20
      });
      jest.spyOn(ElectronicsSuppliers, 'getElectronicsCost').mockResolvedValue({
        success: true,
        cost: 30
      });
      jest.spyOn(SupplierRepository, 'updateCost').mockResolvedValue(undefined);

      // Mock phones and machines
      jest.spyOn(PhoneRepository, 'getAllPhones').mockResolvedValue([
        { phone_id: 1, model: 'Cosmos Z25', price: 5000 }
      ]);
      jest.spyOn(MachineRepository, 'getActiveMachines').mockResolvedValue([
        {
          machineId: 1,
          phoneId: 1,
          ratePerDay: 45,
          dateAcquired: 1,
          dateRetired: 0
        }
      ]);
      jest.spyOn(MachineRepository, 'getRatiosForMachine').mockResolvedValue([
        { partId: 1, quantity: 1 },
        { partId: 2, quantity: 2 },
        { partId: 3, quantity: 5 }
      ]);
      jest.spyOn(PhoneRepository, 'updatePhonePrice').mockResolvedValue(undefined);

      await PricingService.updatePhonePricesDaily();

      expect(PhoneRepository.updatePhonePrice).toHaveBeenCalled();
    });

    it('should abort if no part costs retrieved', async () => {
      jest.spyOn(CaseSuppliers, 'getCasesCost').mockResolvedValue({
        success: false
      });
      jest.spyOn(ScreenSuppliers, 'getScreensCost').mockResolvedValue({
        success: false
      });
      jest.spyOn(ElectronicsSuppliers, 'getElectronicsCost').mockResolvedValue({
        success: false
      });

      await PricingService.updatePhonePricesDaily();

      expect(PhoneRepository.getAllPhones).not.toHaveBeenCalled();
    });
  });
});
