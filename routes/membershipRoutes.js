import express from "express";
import { memeber } from "../controllers/membershipController.js";

const router = express.Router();


router.post("/payment", memeber);

export default router;