import { catchAsyncErrors } from "../middlewares/catchAsyncError";
import User from "../models/userSchema";
import stripePackage, { Stripe } from "stripe";
import { Request, Response, NextFunction } from "express";

interface LineItem {
  // Define the properties of a line item
  // Adjust these properties based on what you expect to receive
  name: string;
  description: string;
  amount: number;
  currency: string;
  quantity: number;
}

interface CheckoutSession {
  id: string;
  // Add other properties you expect to receive in the session object
  // For example, you might include properties like 'payment_method_types', 'line_items', 'mode', etc.
  payment_method_types: string[];
  line_items: any[]; // Define this array's structure according to your line items
  mode: string;
  success_url: string;
  cancel_url: string;
  customer: string; // Assuming 'customer.id' is a string
  // Add other properties as needed
}

const stripe = new stripePackage(
  "sk_test_51P10z2SGpizPxAHaSlTGprId3dKnA9KyRayVkMdEkj8738mKJIbwkwA56Jmxv9n0VTQFEaPviPugDdVBbu5PbGB500kaTG3r01"
);

export const member = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { subScriptionType, email } = req.body;
      let interval:any = undefined;
      let price: number; // Default price for monthly subscription in cents

      switch (subScriptionType) {
        case "monthly":
          interval = "month";
          price = 1000; // Monthly subscription price
          break;
        case "quarterly":
          interval = "quarterly";
          price = 2500; // Quarterly subscription price (3 months)
          break;
        case "yearly":
          interval = "year";
          price = 10000; // Yearly subscription price (12 months)
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
            unit_amount: price, // Specify the amount in the smallest currency unit (e.g., cents for USD)
            recurring: {
              interval,
            },
          },
          quantity: 1, // Specify the quantity of this line item
        },
        // Add more line items as needed
      ];

      // Create customer with provided details
      const customer = await stripe.customers.create({
        email: email, // Use provided email
      });

      // Create checkout session with customer ID
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
      console.log("kreny", subScriptionType);

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
      } else if (subScriptionType === "quarterly") {
        subscriptionEndTime = new Date();
        subscriptionEndTime.setMonth(subscriptionEndTime.getMonth() + 3);
      } else if (subScriptionType === "yearly") {
        subscriptionEndTime = new Date();
        subscriptionEndTime.setFullYear(subscriptionEndTime.getFullYear() + 1);
      }

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
