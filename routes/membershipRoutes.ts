import express from "express";
import { member } from "../controllers/membershipController";
import { successpage } from "../controllers/membershipController";

const router = express.Router();


router.post("/payment", member);
router.post("/paymentsuccess", successpage);



export default router;