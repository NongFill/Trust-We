const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Stripe = require("stripe");

admin.initializeApp();

// ใส่ Secret Key ที่ Stripe dashboardืฟ
const stripe = Stripe("sk_test_...sk_test_51RDzjuIR8yjtpTsUKZR4joJnw4WaX5Cn5vJA4dDtLhywZZwsEKPJ63GhntwKvjRWVtpAoKof7eg56VUg3CdwKQ5Q00oMidHANC...");

exports.createPaymentIntent = functions.https.onRequest(async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,           // เงินในหน่วยสตางค์ เช่น 1000 = 10.00 บาท
      currency,         // 'thb'
      automatic_payment_methods: { enabled: true }
    });

    res.status(200).send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});
