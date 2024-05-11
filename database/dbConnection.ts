import mongoose from "mongoose";

export const dbConnection = () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MongoDB URI is not defined in environment variables.");
    } else {
      mongoose
        .connect(process.env.MONGO_URI, {
          dbName: "MERN_JOB_SEEKING_WEBAPP",
        })
        .then(() => {
          console.log("Connected to database.");
        })
        .catch((err) => {
          console.log(`Some Error occured. ${err}`);
        });
    }
  } catch (err) {
    console.log(err);
  }
};
