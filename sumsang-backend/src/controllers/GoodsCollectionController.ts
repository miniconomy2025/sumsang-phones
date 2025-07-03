import { Request, Response } from 'express';
import { GoodsCollectionService } from '../services/GoodsCollectionService.js';
import { handleSuccess, handleFailure } from '../utils/handleResponses.js';
import { BadRequestError } from '../utils/errors.js';

export class GoodsCollectionController {

    static async handleCollectionRequest(req: Request, res: Response): Promise<void> {
        try {
            const { deliveryReference } = req.body;

            if (deliveryReference === undefined) {
                throw new BadRequestError('Missing "deliveryReference" in request body.');
            }
            if (typeof deliveryReference !== 'number') {
                throw new BadRequestError('"deliveryReference" must be a number.');
            }

            const result = await GoodsCollectionService.processGoodsCollection(deliveryReference);
            handleSuccess(res, result);
        } catch (error) {
            handleFailure(res, error, 'Error processing goods collection');
        }
    }
}