import { jest, describe, it, expect, beforeEach, beforeAll, afterAll } from '@jest/globals';
import { SimulationService } from '../../../src/services/SimulationService.js';
import { DatabaseService } from '../../../src/services/DatabaseService.js';
import { BankService } from '../../../src/services/BankService.js';
import { LoanService } from '../../../src/services/LoanService.js';
import { SystemSettingsRepository } from '../../../src/repositories/SystemSettingRepository.js';
import { THOHService } from '../../../src/services/THOHService.js';
import { MachinePurchaseService } from '../../../src/services/MachinePurchaseService.js';
import { DailyTasksService } from '../../../src/services/DailyTasks.js';
import { TickService } from '../../../src/services/TickService.js';

jest.mock('../../../src/services/DatabaseService.js');
jest.mock('../../../src/services/BankService.js');
jest.mock('../../../src/services/LoanService.js');
jest.mock('../../../src/repositories/SystemSettingRepository.js');
jest.mock('../../../src/services/THOHService.js');
jest.mock('../../../src/services/MachinePurchaseService.js');
jest.mock('../../../src/services/DailyTasks.js');
jest.mock('../../../src/services/TickService.js');

beforeAll(() => {
  (['log', 'error', 'warn', 'info', 'debug', 'table', 'trace'] as (keyof Console)[]).forEach((method) => {
    jest.spyOn(console as any, method).mockImplementation(() => {});
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('SimulationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.USE_MANUAL_TICKS = 'true';
  });

  describe('orderInitialMachines', () => {
    it('should order initial machines successfully', async () => {
      const mockMachines = [
        {
          machineName: 'cosmos_z25_machine',
          inputs: 'cases : screens : electronics',
          quantity: 120,
          inputRatio: { cases: 1, screens: 2, electronics: 5 },
          productionRate: 45,
          price: 18000
        }
      ];

      jest.spyOn(THOHService, 'getAvailableMachines').mockResolvedValue(mockMachines);
      jest.spyOn(MachinePurchaseService, 'makeMachinePurchaseOrder').mockResolvedValue(1);
      jest.spyOn(MachinePurchaseService, 'processPendingMachinePurchases').mockResolvedValue(undefined);

      await SimulationService.orderInitialMachines();

      expect(THOHService.getAvailableMachines).toHaveBeenCalled();
      expect(MachinePurchaseService.makeMachinePurchaseOrder).toHaveBeenCalled();
    });
  });

  describe('StartSimulation', () => {
    it('should start simulation successfully', async () => {
      jest.spyOn(DatabaseService, 'resetDatabase').mockResolvedValue(undefined);
      jest.spyOn(SystemSettingsRepository, 'upsertByKey').mockResolvedValue(undefined);
      jest.spyOn(BankService, 'openAccount').mockResolvedValue('ACC-123');
      jest.spyOn(LoanService, 'applyWithFallback').mockResolvedValue({
        success: true,
        loan_number: 'LOAN-123',
        amount: 20000000
      });
      jest.spyOn(DailyTasksService, 'makePartsPurchaseOrder').mockResolvedValue(1);
      jest.spyOn(DailyTasksService, 'processPendingPartsPurchases').mockResolvedValue(undefined);
      jest.spyOn(THOHService, 'getAvailableMachines').mockResolvedValue([]);

      await SimulationService.StartSimulation('1234567890');

      expect(DatabaseService.resetDatabase).toHaveBeenCalledTimes(1);
      expect(BankService.openAccount).toHaveBeenCalledTimes(1);
      expect(LoanService.applyWithFallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('stopSimulation', () => {
    it('should stop simulation', async () => {
      jest.spyOn(TickService, 'stop').mockReturnValue(undefined);

      await SimulationService.stopSimulation();

      expect(TickService.stop).toHaveBeenCalledTimes(1);
    });
  });
});
