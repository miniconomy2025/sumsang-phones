import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { LoanService } from '../../../src/services/LoanService.js';
import { BankService } from '../../../src/services/BankService.js';

jest.mock('../../../src/services/BankService.js');

beforeAll(() => {
  (['log', 'error', 'warn', 'info', 'debug', 'table', 'trace'] as (keyof Console)[]).forEach((method) => {
    jest.spyOn(console as any, method).mockImplementation(() => {});
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('LoanService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('applyWithFallback', () => {
    it('should return loan details when primary amount is approved', async () => {
      const mockResponse = { success: true, loan_number: 'LOAN-123' };
      jest.spyOn(BankService, 'applyForLoan')
        .mockResolvedValue(mockResponse);

      const result = await LoanService.applyWithFallback(20000000);

      expect(result).toEqual({ ...mockResponse, amount: 20000000 });
      expect(BankService.applyForLoan).toHaveBeenCalledWith(20000000);
      expect(BankService.applyForLoan).toHaveBeenCalledTimes(1);
    });

    it('should try fallback amounts when primary fails', async () => {
      jest.spyOn(BankService, 'applyForLoan')
        .mockResolvedValueOnce({ success: false, loan_number: '' })
        .mockResolvedValueOnce({ success: true, loan_number: 'LOAN-456' });

      const result = await LoanService.applyWithFallback(20000000, [10000000]);

      expect(result).toEqual({ success: true, loan_number: 'LOAN-456', amount: 10000000 });
      expect(BankService.applyForLoan).toHaveBeenCalledTimes(2);
    });

    it('should throw error when all amounts are denied', async () => {
      jest.spyOn(BankService, 'applyForLoan')
        .mockResolvedValue({ success: false, loan_number: '' });

      await expect(
        LoanService.applyWithFallback(20000000, [10000000])
      ).rejects.toThrow('All loan attempts were denied. Simulation cannot proceed.');
    });

    it('should handle rejection errors during application', async () => {
      jest.spyOn(BankService, 'applyForLoan')
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ success: true, loan_number: 'LOAN-789' });

      const result = await LoanService.applyWithFallback(20000000, [10000000]);

      expect(result).toEqual({ success: true, loan_number: 'LOAN-789', amount: 10000000 });
    });
  });
});
