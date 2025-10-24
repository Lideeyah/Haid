// src/routes/dashboardRoutes.js
import express from "express";
import { getDonorDashboard, getAuditorDashboard } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/donor", getDonorDashboard);
router.get("/auditor", getAuditorDashboard);

export default router;