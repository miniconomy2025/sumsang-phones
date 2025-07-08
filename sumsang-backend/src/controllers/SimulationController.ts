import { NextFunction, Request, Response } from 'express';
import { handleSuccess, handleFailure } from '../utils/handleResponses.js';
import { BadRequestError } from '../utils/errors.js';
import { SimulationService } from '../services/SimulationService.js';

export class SimulationController {
    static async startSimulation(request: Request, response: Response, next: NextFunction): Promise<void> {
        try {
            await SimulationService.StartSimulation();
            response.status(200).json({ message: "Simulation started successfully" })
        }
        catch (error) {
            response.status(500).json({ error: "Failed to start simulation" })
        }
    }
}