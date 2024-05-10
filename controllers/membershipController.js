import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userSchema.js";
import stripePackage from 'stripe';

const stripe = stripePackage("sk_test_51P10z2SGpizPxAHaSlTGprId3dKnA9KyRayVkMdEkj8738mKJIbwkwA56Jmxv9n0VTQFEaPviPugDdVBbu5PbGB500kaTG3r01");

export const member = catchAsyncErrors(
	async (req, res) => {
		try {
			const { subScriptionType,email } = req.body;
         console.log("sandip",subScriptionType)
			let interval = 'month';
			let price = null; // Default price for monthly subscription in cents

			switch (subScriptionType) {
				case 'monthly':
					interval = 'month';
					price = 1000; // Monthly subscription price
					break;
				case 'quarterly':
					interval = 'quarterly';
					price = 2500; // Quarterly subscription price (3 months)
					break;
				case 'yearly':
					interval = 'year';
					price = 10000; // Yearly subscription price (12 months)
					break;
				default:
					throw new Error('Invalid plan');
			}

			const lineItems = [{
				price_data: {
					currency: 'inr',
					product_data: {
						name: `Membership (${subScriptionType})`, // Set name based on plan
					},
					unit_amount: price, // Amount in cents
					recurring: {
						interval: interval,
					},
				},
				quantity: 1,
			}];

			// Create customer with provided details
			const customer = await stripe.customers.create({
				email: email, // Use provided email
			});

			// Create checkout session with customer ID
			const session = await stripe.checkout.sessions.create({
				payment_method_types: ['card'],
				line_items: lineItems,
				mode: 'subscription',
				success_url: 'http://localhost:3000/success',
				cancel_url: 'http://localhost:3000/cancel',
				customer: customer.id,
			});

			res.json({ id: session.id });
		} catch (error) {
			console.error('Stripe API Error:', error.message);
			res.status(500).json({
				msg: 'Failed to create checkout session',
				error: error.message
			});
		}
	}
);

export const successpage = catchAsyncErrors(async (req, res, next) => {
	try {
		const { subScriptionType, userid } = req.body;
		console.log("kreny", subScriptionType)
	
		console.log(userid)
		const user = await User.findById(userid);

		if (!user) {
			return res.status(404).json({ success: false, message: "User not found" });
		}

	
		let subscriptionEndTime = '';
		if (subScriptionType === 'monthly') {
			subscriptionEndTime = new Date();
			subscriptionEndTime.setMonth(subscriptionEndTime.getMonth() + 1);
		} else if (subScriptionType === 'quarterly') {
			subscriptionEndTime = new Date();
			subscriptionEndTime.setMonth(subscriptionEndTime.getMonth() + 3);
		} else if (subScriptionType === 'yearly') {
			subscriptionEndTime = new Date();
			subscriptionEndTime.setFullYear(subscriptionEndTime.getFullYear() + 1);
		}

	
		user.subScriptionType = subScriptionType;
		user.isSubscribed='true'
		user.subscriptionEndTime = subscriptionEndTime;

		await user.save();

		res.status(200).json({ success: true, message: "Subscription updated successfully" });
	} catch (error) {
		next(error);
	}
});

