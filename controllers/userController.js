import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { sendToken } from "../utils/jwtToken.js";
import dotenv from 'dotenv';
import nodemailer from "nodemailer";
import randomstring from "randomstring"
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
dotenv.config();





export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, password, role } = req.body;
  if (!name || !email || !phone || !password || !role) {
    return next(new ErrorHandler("Please fill full form!"));
  }
  const isEmail = await User.findOne({ email });
  if (isEmail) {
    return next(new ErrorHandler("Email already registered!"));
  }
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role,
  });
  sendToken(user, 201, res, "User Registered!");
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return next(new ErrorHandler("Please provide email ,password and role."));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email Or Password.", 400));
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email Or Password.", 400));
  }
  if (user.role !== role) {
    return next(
      new ErrorHandler(`User with provided email and ${role} not found!`, 404)
    );
  }
  sendToken(user, 201, res, "User Logged In!");
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(201)
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Logged Out Successfully.",
    });
});


export const getUser = catchAsyncErrors((req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

export const sendRestPasswordMail = async (name, email, token) => {
  try {
    // console.log("3====")
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      requireTLS: true,
      auth: {
        user: "naibhavik68@gecg28.ac.in",
        pass: "Bhavik@123"
      }

    });
    // console.log("5====")

    // const name = 'Rahul';
    // const token = 'kdjkfjkdjfjdk';

    const mailOptions = {
      from: "naibhavik68@gecg28.ac.in",
      to: email,
      subject: 'For Reset Password',
      html: '<p> Hii' + User.name + ',Please copy the link and <a href="http://localhost:3000/resetpassword/'+ token +'">  reset your password </a>'
    }
      // < a href = "http://localhost:3000/resetpassword/token" >
    // console.log("6====")                                                   

    transporter.sendMail(mailOptions, function (error, info) {

      if (error) {

        console.log(error)
      } else {

        console.log("mail has been sent successfully")
      }

    });



  } catch (error) {

    console.log("error", error)
  }


}
export const forget_password = async (req, res) => {


  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email })



    if (userData) {

      const randomString = randomstring.generate();
      const data = await User.updateOne({ email: email }, { $set: { token: randomString } });

      sendRestPasswordMail(userData.name, userData.email, randomString);
      res.status(200).send({ success: true, msg: "Please check your inbox of mail." })
    }
    else {

      res.status(200).send({ success: false, msg: "this email does not exists." })
    }





  } catch (error) {

    res.status(200).send({ success: false, msg: error })

  }



}


export const reset_password = async (req, res) => {
  try {
    const token = req.params.token;
    console.log("token", token);

    const tokenData = await User.findOne({ token: token });
    console.log("tokenData", tokenData);

    if (tokenData) {
      const password = req.body.password;
      console.log("password", password);

      // Hash the pass
      const hashedPassword = await bcrypt.hash(password,10)
      console.log(hashedPassword)
      // Update user data with hashed password and clear token
      const userData = await User.findByIdAndUpdate(
        { _id: tokenData._id },
        { $set: { password: hashedPassword, token: "" } },
        { new: true }
      ); 

      console.log("userData", userData);

      res.status(200).send({ success: true, userData });
    } else {
      res.status(200).send({ success: false, msg: "This link has expired" });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error });
  }
};