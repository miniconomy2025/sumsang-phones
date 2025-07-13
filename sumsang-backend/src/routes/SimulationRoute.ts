import express, { Request, Response, NextFunction } from "express";
import { SimulationController } from "../controllers/SimulationController.js";
import { verifyOU } from "../middleware/verifyOU.js";
import { OrganizationalUnit } from "../types/OrganizationalUnitOptions.js";

const router = express.Router();

router.post("/simulation", verifyOU([OrganizationalUnit.thoh, OrganizationalUnit.sumsangCompany]), SimulationController.startSimulation)

export default router;