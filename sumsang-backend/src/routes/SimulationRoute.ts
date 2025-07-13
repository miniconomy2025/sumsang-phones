import express, { Request, Response, NextFunction } from "express";
import { SimulationController } from "../controllers/SimulationController.js";
import { verifyOU } from "../middleware/verifyOU.js";

const router = express.Router();

router.post("/simulation", verifyOU('thoh'), SimulationController.startSimulation)

export default router;