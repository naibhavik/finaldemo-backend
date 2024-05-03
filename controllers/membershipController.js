import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import stripePackage from 'stripe';

export const memeber = catchAsyncErrors(
	async (req, res, next) => {

		const stripe = stripePackage("sk_test_51P10z2SGpizPxAHaSlTGprId3dKnA9KyRayVkMdEkj8738mKJIbwkwA56Jmxv9n0VTQFEaPviPugDdVBbu5PbGB500kaTG3r01");
		try {
			const products = req.body;
			console.log("this is products", products)

			const lineItems = products.map(product => ({
				price_data: {
					currency: 'inr',
					product_data: {
						name: product.name,
					},
					unit_amount: product.price, // Amount in cents
					recurring: {
						interval: 'month', // Define the billing interval (e.g., month, year)
					},
				},
				quantity: product.quantity,
			}));

			// Create customer with provided details
			const customer = await stripe.customers.create({
				name: 'naibhavik',
				email: 'naibhavik68@gmail.com',
				address: {
					city: 'palanpur',
					country: 'China',
					line1: 'dijfjd',
					line2: 'djfdhf',
					postal_code: 'dfjdjf',
					state: 'Gujarat',
				}
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
)