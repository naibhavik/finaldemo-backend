import express from "express";
import { member } from "../controllers/membershipController.js";
import { successpage } from "../controllers/membershipController.js";

const router = express.Router();


router.post("/payment", member);
router.post("/paymentsuccess", successpage);



export default router;