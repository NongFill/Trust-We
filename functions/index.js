const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const app = express();
const qrcode = require("qrcode");
const promptpay = require("promptpay-qr");

app.use(cors({origin: true}));

app.get("/generate-qr", async (req, res) => {
  try {
    const {amount} = req.query;
    const phoneNumber = "...."; 

    const payload = promptpay.generatePayload(phoneNumber, {
      amount: parseFloat(amount),
    });
    const qr = await qrcode.toDataURL(payload);

    res.status(200).send({
      qrImage: qr,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: "Failed to generate QR code",
    });
  }
});

exports.api = functions.https.onRequest(app);
