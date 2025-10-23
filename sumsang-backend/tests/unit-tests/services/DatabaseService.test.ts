import { jest, describe, it, expect, beforeEach, beforeAll, afterAll } from '@jest/globals';
import { DatabaseService } from '../../../src/services/DatabaseService.js';
import db from '../../../src/config/DatabaseConfig.js';

jest.mock('../../../src/config/DatabaseConfig.js');

beforeAll(() => {
  (['log', 'error', 'warn', 'info', 'debug', 'table', 'trace'] as (keyof Console)[]).forEach((method) => {
    jest.spyOn(console as any, method).mockImplementation(() => {});
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('DatabaseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('resetDatabase', () => {
    it('should successfully reset database', async () => {
    const mockQuery = jest.spyOn(db, 'query').mockResolvedValue({} as any);

    await DatabaseService.resetDatabase();

    expect(mockQuery).toHaveBeenCalledWith('CALL clear_all_except_status_and_phones();');
    expect(mockQuery).toHaveBeenCalledTimes(1);

    mockQuery.mockRestore(); // optional, restores original db.query
    });

    it('should throw error when database reset fails', async () => {
    jest.spyOn(db, 'query').mockRejectedValue(new Error('Database error'));

    await expect(DatabaseService.resetDatabase()).rejects.toThrow('Database error');
    });
  })
});
