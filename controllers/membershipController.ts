import { catchAsyncErrors } from "../middlewares/catchAsyncError";
import User from "../models/userSchema";
import stripePackage, { Stripe } from "stripe";
import { Request, Response, NextFunction } from "express";

interface LineItem {
  
  name: string;
  description: string;
  amount: number;
  currency: string;
  quantity: number;
}

interface CheckoutSession {
  id: string;
  
  payment_method_types: string[];
  line_items: any[]; 
  mode: string;
  success_url: string;
  cancel_url: string;
  customer: string; 
}

const stripe = new stripePackage(
  "sk_test_51P10z2SGpizPxAHaSlTGprId3dKnA9KyRayVkMdEkj8738mKJIbwkwA56Jmxv9n0VTQFEaPviPugDdVBbu5PbGB500kaTG3r01"
);

export const member = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { subScriptionType, email } = req.body;
      let interval:any = undefined;
      let price: number;

      switch (subScriptionType) {
        case "monthly":
          interval = "month";
          price = 2500; 
          break;
        case "day":
          interval = "day";
          price = 1000;
          break;
        case "yearly":
          interval = "year";
          price = 10000; 
          break;
        default:
          throw new Error("Invalid plan");
      }

      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `Membership (${subScriptionType})`,
            },
            unit_amount: price, 
            recurring: {
              interval,
            },
          },
          quantity: 1, 
        },
        
      ];

      
      const customer = await stripe.customers.create({
        email: email, 
      });

      
      const session: Stripe.Checkout.Session =
        await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: lineItems,
          mode: "subscription",
          success_url: "http://localhost:3000/success",
          cancel_url: "http://localhost:3000/cancel",
          customer: customer.id,
        });
      res.json({ id: session.id });
    } catch (error: any) {
      console.error("Stripe API Error:", error.message);
      res.status(500).json({
        msg: "Failed to create checkout session",
        error: error.message,
      });
    }
  }
);

export const successpage = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    try {
      const { subScriptionType, userid } = req.body;
      console.log(subScriptionType);

      console.log(userid);
      const user = await User.findById(userid);

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      let subscriptionEndTime: any;
      if (subScriptionType === "monthly") {
        subscriptionEndTime = new Date();
        subscriptionEndTime.setMonth(subscriptionEndTime.getMonth() + 1);
      } else if (subScriptionType === "day") {
        subscriptionEndTime = new Date();
        // subscriptionEndTime.setMonth(subscriptionEndTime.getMonth() + 3);
        subscriptionEndTime.setDate(subscriptionEndTime.getDate() + 1);

      } else if (subScriptionType === "yearly") {
        subscriptionEndTime = new Date();
        subscriptionEndTime.setFullYear(subscriptionEndTime.getFullYear() + 1);
      }
      console.log("st",subscriptionEndTime);
      console.log("subcription")

      user.subScriptionType = subScriptionType;
      user.isSubscribed = true;
      user.subscriptionEndTime = subscriptionEndTime;

      await user.save();

      res
        .status(200)
        .json({ success: true, message: "Subscription updated successfully" });
    } catch (error) {
      next(error);
    }
  }
);
