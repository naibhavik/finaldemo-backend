import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";

// Define an interface for the User document
interface IUser extends Document {
  name: string;
  email: string;
  phone: number;
  password: string;
  role: "Job Seeker" | "Employer";
  isSubscribed: boolean;
  subScriptionType: string;
  subscriptionEndTime: string;
  createdAt: Date;
  token: string;

  comparePassword(enteredPassword: string): Promise<boolean>;
  getJWTToken(): string;
}

// Define the schema
const userSchema: Schema<IUser> = new Schema<IUser>({
  name: {
    type: String,
    required: [true, "Please enter your Name!"],
    minLength: [3, "Name must contain at least 3 Characters!"],
    maxLength: [30, "Name cannot exceed 30 Characters!"],
  },
  email: {
    type: String,
    required: [true, "Please enter your Email!"],
    validate: [validator.isEmail, "Please provide a valid Email!"],
  },
  phone: {
    type: Number,
    required: [true, "Please enter your Phone Number!"],
  },
  password: {
    type: String,
    required: [true, "Please provide a Password!"],
    minLength: [8, "Password must contain at least 8 characters!"],
    maxLength: [32, "Password cannot exceed 32 characters!"],
    select: false,
  },
  role: {
    type: String,
    required: [true, "Please select a role"],
    enum: ["Job Seeker", "Employer"],
  },
  isSubscribed: {
    type: Boolean,
    default: false,
  },
  subScriptionType: {
    type: String,
    default: "",
  },
  subscriptionEndTime: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  token: {
    type: String,
    default: "",
  },
  
});

// Encrypt the password before saving
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare the entered password with the saved password
userSchema.methods.comparePassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate a JWT token
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY!, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Define and export the User model
const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User;
