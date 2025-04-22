const express = require('express');
const app = express();
const promptpay = require('promptpay-qr');
const qrcode = require('qrcode');

app.use(express.json());

// Endpoint สร้าง QR Code
app.get('/generate-qr', async (req, res) => {
  try {
    const { amount } = req.query;   // จำนวนเงินที่ลูกค้าจะจ่าย
    const promptpayID = '9207241978';  // เบอร์พร้อมเพย์ (หรือเลขบัญชี/เลขบัตร ปรับได้)

    // สร้าง Payload พร้อมเพย์
    const payload = promptpay.generate(payloadID = promptpayID, { amount: parseFloat(amount) || undefined });

    // แปลง Payload เป็น QR Image (base64 png)
    const qrImage = await qrcode.toDataURL(payload);

    res.json({
      payload,
      qrImage,   // base64 สำหรับไปใช้แสดงใน React Native ได้เลย
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Server started on port 3000'));
