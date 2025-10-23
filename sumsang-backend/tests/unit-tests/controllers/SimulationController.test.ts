import { jest, describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { SimulationController } from '../../../src/controllers/SimulationController.js';
import { SimulationService } from '../../../src/services/SimulationService.js';
import { Request, Response } from 'express';

jest.mock('../../../src/services/SimulationService.js');

beforeAll(() => {
  (['log', 'error', 'warn', 'info', 'debug', 'table', 'trace'] as (keyof Console)[]).forEach((method) => {
    jest.spyOn(console as any, method).mockImplementation(() => {});
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('SimulationController', () => {
  let mockRequest!: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockJson = jest.fn().mockReturnThis(); 
    mockStatus = jest.fn().mockReturnThis(); 

    mockRequest = {};
    mockResponse = {
      status: mockStatus,
      json: mockJson
    } as Partial<Response>; 
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('startSimulation', () => {
    it('should start simulation successfully', async () => {
      mockRequest.body = {
        epochStartTime: '1234567890'
      };

      jest.spyOn(SimulationService, 'StartSimulation').mockResolvedValue(undefined);

      await SimulationController.startSimulation(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Simulation started successfully'
      });

      // Fast-forward time to trigger the setTimeout
      await jest.advanceTimersByTimeAsync(30000);
    });

    it('should handle errors during simulation start', async () => {
      mockRequest.body = {
        epochStartTime: '1234567890'
      };

      jest.spyOn(SimulationService, 'StartSimulation')
        .mockRejectedValue(new Error('Simulation error'));

      await SimulationController.startSimulation(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalled();
    });
  });

  describe('deleteSimulation', () => {
    it('should stop simulation successfully', async () => {
      jest.spyOn(SimulationService, 'stopSimulation').mockResolvedValue(undefined);

      await SimulationController.deleteSimulation(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(SimulationService.stopSimulation).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Simulation stopped successfully'
      });
    });
  });
});
