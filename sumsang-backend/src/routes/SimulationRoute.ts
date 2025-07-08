import express, { Request, Response, NextFunction } from "express";
import { SimulationController } from "../controllers/SimulationController.js";

const router = express.Router();

router.post("/simulation", SimulationController.startSimulation)

export default router;