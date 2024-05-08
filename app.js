import express from "express";
import http from 'http';
import { dbConnection } from "./database/dbConnection.js";
import { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import socketRouter from "./routes/socketRouter.js"
import userRouter from "./routes/userRoutes.js";
import jobRouter from "./routes/jobRoutes.js";
import applicationRouter from "./routes/applicationRoutes.js";
import membershipRoute from "./routes/membershipRoutes.js";
import { errorMiddleware } from "./middlewares/error.js";

config({ path: "./config/config.env" });

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

socketRouter(server); // Initialize Socket.IO

app.use("/api/v1/user", userRouter);
app.use("/api/v1/job", jobRouter);
app.use("/api/v1/application", applicationRouter);
app.use("/api/create-checkout-session", membershipRoute);


dbConnection();

app.use(errorMiddleware);

export default server;
