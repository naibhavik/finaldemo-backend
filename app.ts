import express from "express";
import http from 'http';
import { dbConnection } from "./database/dbConnection";
import { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import socketRouter from "./routes/socketRouter"
import userRouter from "./routes/userRoutes";
import nodemailer from "nodemailer";
import jobRouter from "./routes/jobRoutes";
import applicationRouter from "./routes/applicationRoutes";
import membershipRoute from "./routes/membershipRoutes";
import { errorMiddleware } from "./middlewares/error";
import { Request, Response, NextFunction } from "express";
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
app.use("/api/v1/create-checkout-session", membershipRoute);
app.post("/schedulemeeting",(req:Request,res:Response)=>{

  const { meetingId, email, mydate } = req.body;


  scheduleMeeting(meetingId, email, mydate);



})


export const scheduleMeeting = async (
  meetingId: String,
  email: String,
  mydate: any
) => {
  try {
    // console.log("3====")
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      requireTLS: true,
      auth: {
        user: "naibhavik68@gecg28.ac.in",
        pass: "Bhavik@123",
      },
    });
    // console.log("5====")

    // const name = 'Rahul';
    // const token = 'kdjkfjkdjfjdk';

    const mailOptions: any = {
      from: "naibhavik68@gecg28.ac.in",
      to: email,
      subject: "For Send Mail",
      html:
        "<p> Hii" +
        "Your apllication is Accepted" +
        "your interview date is" +
        mydate +
        ',Please copy  Zooom interview meeting link  and <a href="http://localhost:3000/videocall/mainpagevideocall/' +
        meetingId +
        '">  Meeting link </a>',
    };
    // < a href = "http://localhost:3000/resetpassword/token" >
    // console.log("6====")

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("mail has been sent successfully");
      }
    });
  } catch (error) {
    console.log("error", error);
  }
};


dbConnection();

app.use(errorMiddleware);

export default server;
