import { jest, describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { TickService } from '../../../src/services/TickService.js';
import { SystemSettingsRepository } from '../../../src/repositories/SystemSettingRepository.js';
import { DailyTasksService } from '../../../src/services/DailyTasks.js';

jest.mock('../../../src/repositories/SystemSettingRepository.js');
jest.mock('../../../src/services/DailyTasks.js');

beforeAll(() => {
  (['log', 'error', 'warn', 'info', 'debug', 'table', 'trace'] as (keyof Console)[]).forEach((method) => {
    jest.spyOn(console as any, method).mockImplementation(() => {});
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('TickService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    TickService.stop();
  });

  describe('start', () => {
    it('should start tick service and setup system settings', async () => {
      jest.spyOn(SystemSettingsRepository, 'upsertByKey').mockResolvedValue(undefined);

      await TickService.start('1234567890');

      expect(SystemSettingsRepository.upsertByKey).toHaveBeenCalledWith('start_epoch', '1234567890');
      expect(SystemSettingsRepository.upsertByKey).toHaveBeenCalledWith('current_day', '1');
    });

    it('should execute daily tasks when next day is detected', async () => {
      jest.spyOn(SystemSettingsRepository, 'upsertByKey').mockResolvedValue(undefined);
      jest.spyOn(SystemSettingsRepository, 'checkAndUpdateDay')
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);
      jest.spyOn(DailyTasksService, 'executeDailyTasks').mockResolvedValue(undefined);

      await TickService.start('1234567890');

      // Advance timer to trigger interval
      await jest.advanceTimersByTimeAsync(10000);

      expect(SystemSettingsRepository.checkAndUpdateDay).toHaveBeenCalled();
    });
  });

  describe('stop', () => {
    it('should stop tick service', () => {
      TickService.stop();

      // Should not throw error when stopping non-running service
      expect(() => TickService.stop()).not.toThrow();
    });
  });
});
