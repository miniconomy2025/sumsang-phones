import { NextFunction, Request, Response } from 'express';
import { handleSuccess, handleFailure } from '../utils/handleResponses.js';
import { BadRequestError } from '../utils/errors.js';
import { SimulationService } from '../services/SimulationService.js';

export class SimulationController {
    static async startSimulation(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const startEpoch = req.body.unixEpochStartTime;

            await SimulationService.StartSimulation(startEpoch);
            handleSuccess(res, { message: "Simulation started successfully" });
        }
        catch (error) {
            handleFailure(res, error, 'Failed to start simulation properly');
        }
    }
}