import { NextFunction, Request, Response } from 'express';
import { handleSuccess, handleFailure } from '../utils/handleResponses.js';
import { BadRequestError } from '../utils/errors.js';
import { SimulationService } from '../services/SimulationService.js';

export class SimulationController {
    static async startSimulation(req: Request, res: Response): Promise<void> {
        console.log('===== SimulationController.startSimulation START =====');
        try {
            console.log('Request body:', req.body);
            const startEpoch = req.body.epochStartTime;
            console.log('Start epoch time:', startEpoch);

            const response = { message: "Simulation started successfully" };
            console.log('Response:', response);
            handleSuccess(res, response);

            setTimeout( async () => {
                console.log('Starting simulation...');
                await SimulationService.StartSimulation(startEpoch);
                console.log('Simulation started successfully');    
            }, 30000);

                    
        }
        catch (error) {
            console.log('Error in startSimulation:', error);
            handleFailure(res, error, 'Failed to start simulation properly');
        }
        console.log('===== SimulationController.startSimulation END =====');
    }

        static async deleteSimulation(req: Request, res: Response): Promise<void> {
        console.log('===== SimulationController.deleteSimulation START =====');
        try {
            console.log('Request body:', req.body);
            
            SimulationService.stopSimulation();
            const response = { message: "Simulation stopped successfully" };
            console.log('Response:', response);
            handleSuccess(res, response);      
        }
        catch (error) {
            console.log('Error in stopSimulation:', error);
            handleFailure(res, error, 'Failed to stop simulation properly');
        }
        console.log('===== SimulationController.deleteSimulation END =====');
    }
}