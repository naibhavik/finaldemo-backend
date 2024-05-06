import express from "express";
import { login, register, logout, getUser, forget_password, reset_password } from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/getuser", isAuthenticated, getUser);
router.post("/forget-password", forget_password);
router.post("/reset_password/:token",reset_password);
export default router;
