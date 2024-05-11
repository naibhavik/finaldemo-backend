// import  User  from './../models/userSchema';
// import dotenv from 'dotenv';
// dotenv.config();
export const sendToken = (
  user: any,
  statusCode: any,
  res: any,
  message: any
) => {
  const token = user.getJWTToken();
  const options = {
    expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    httpOnly: true, // Set httpOnly to true
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    message,
    token,
  });
};
