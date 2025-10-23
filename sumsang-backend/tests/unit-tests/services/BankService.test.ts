import { jest, describe, it, expect, beforeEach, beforeAll, afterAll } from '@jest/globals';
import { BankService } from '../../../src/services/BankService.js';
import { CommercialBankAPI } from '../../../src/utils/externalApis.js';

jest.mock('../../../src/utils/externalApis.js');

beforeAll(() => {
  (['log', 'error', 'warn', 'info', 'debug', 'table', 'trace'] as (keyof Console)[]).forEach((method) => {
    jest.spyOn(console as any, method).mockImplementation(() => {});
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('BankService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('openAccount', () => {
    it('should return account number when account creation succeeds', async () => {
      const mockAccountNumber = 'ACC-123456';
      jest.spyOn(CommercialBankAPI, 'openAccount')
        .mockResolvedValue({ account_number: mockAccountNumber });

      const result = await BankService.openAccount();

      expect(result).toBe(mockAccountNumber);
      expect(CommercialBankAPI.openAccount).toHaveBeenCalledTimes(1);
    });

    it('should throw error when account_number is missing', async () => {
      jest.spyOn(CommercialBankAPI, 'openAccount')
        .mockResolvedValue({ account_number: '' });

      await expect(BankService.openAccount()).rejects.toThrow('Bank account creation failed.');
    });
  });

  describe('applyForLoan', () => {
    it('should return loan details when application succeeds', async () => {
      const mockResponse = { success: true, loan_number: 'LOAN-123' };
      jest.spyOn(CommercialBankAPI, 'applyForLoan')
        .mockResolvedValue(mockResponse);

      const result = await BankService.applyForLoan(10000);

      expect(result).toEqual(mockResponse);
      expect(CommercialBankAPI.applyForLoan).toHaveBeenCalledWith(10000);
    });

    it('should throw error when loan application fails', async () => {
      jest.spyOn(CommercialBankAPI, 'applyForLoan')
        .mockResolvedValue({ success: false, loan_number: '' });

      await expect(BankService.applyForLoan(10000)).rejects.toThrow('Loan application failed.');
    });
  });

  describe('makePayment', () => {
    it('should successfully process payment', async () => {
      const mockResult = { success: true };
      jest.spyOn(CommercialBankAPI, 'makePayment')
        .mockResolvedValue(mockResult);

      const result = await BankService.makePayment(123, 5000, 'ACC-123');

      expect(result).toEqual(mockResult);
      expect(CommercialBankAPI.makePayment).toHaveBeenCalledWith('123', 5000, 'ACC-123');
    });
  });

  describe('makeLoanRepayment', () => {
    it('should repay loan successfully when outstanding amount exists', async () => {
      jest.spyOn(CommercialBankAPI, 'getLoanInfo')
        .mockResolvedValue({ outstandingAmount: 100000 });
      jest.spyOn(CommercialBankAPI, 'repayLoan')
        .mockResolvedValue({ success: true, paid: 50000 });

      const result = await BankService.makeLoanRepayment('LOAN-123');

      expect(result).toBe(50000);
      expect(CommercialBankAPI.repayLoan).toHaveBeenCalledWith('LOAN-123', 50000);
    });

    it('should return 0 when no outstanding amount', async () => {
      jest.spyOn(CommercialBankAPI, 'getLoanInfo')
        .mockResolvedValue({ outstandingAmount: -1 });

      const result = await BankService.makeLoanRepayment('LOAN-123');

      expect(result).toBe(0);
    });

    it('should throw error when repayment fails', async () => {
      jest.spyOn(CommercialBankAPI, 'getLoanInfo')
        .mockResolvedValue({ outstandingAmount: 100000 });
      jest.spyOn(CommercialBankAPI, 'repayLoan')
        .mockResolvedValue({ success: false, paid: 0 });

      await expect(BankService.makeLoanRepayment('LOAN-123')).rejects.toThrow('Loan payment failed');
    });
  });
});
