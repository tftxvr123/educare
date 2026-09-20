// api/webhook.js — Razorpay Server-Side Webhook Handler for Vercel
const crypto = require('crypto');

module.exports = async (req, res) => {
  // 1. CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Razorpay-Signature');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'EducareWebhookSecret2026';

    if (!signature) {
      console.warn('Webhook rejected: Missing X-Razorpay-Signature header');
      return res.status(400).json({ error: 'Missing signature' });
    }

    // 2. Cryptographic signature verification (HMAC SHA-256)
    const bodyPayload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(bodyPayload)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('Webhook verification failed: Invalid digital signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // 3. Process verified payment events from Razorpay
    const { event, payload } = req.body;

    if (event === 'payment.captured') {
      const payment = payload.payment.entity;

      console.log('✅ Payment Verified by Razorpay Webhook:', {
        paymentId: payment.id,
        amount: payment.amount / 100, // Converted from paise to INR
        currency: payment.currency,
        studentEmail: payment.email,
        contact: payment.contact,
        method: payment.method,
        createdAt: new Date(payment.created_at * 1000).toISOString()
      });

      // When a centralized database is connected, the server saves the enrollment record here:
      // await db.enrollment.create({ studentEmail: payment.email, status: 'ACTIVE', ... })
    }

    // 4. Return 200 OK to Razorpay to acknowledge receipt
    return res.status(200).json({ status: 'ok', received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
