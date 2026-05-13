const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Stripe = require("stripe");

admin.initializeApp();

// ใส่ Secret Key ที่ Stripe dashboard ของคุณ
const stripe = Stripe(".....");

exports.createPaymentIntent = functions.https.onRequest(async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,           
      currency,        
      automatic_payment_methods: { enabled: true }
    });

    res.status(200).send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});
