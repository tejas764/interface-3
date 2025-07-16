require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

// GET: Home Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// GET: Register Form Page
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// POST: Handle Form Submission
app.post('/register', async (req, res) => {
  const { name, email } = req.body;

  // Basic validation
  if (!name || !email) return res.send('❌ Missing name or email.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.send('❌ Invalid email format.');

  // Nodemailer Transport
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,  // your Gmail
      pass: process.env.EMAIL_PASS   // your App Password
    }
  });

  // Email Content
  const mailOptions = {
    from: `"Fest Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🎉 Fest Registration Confirmation',
    html: `
      <h2>Hello ${name},</h2>
      <p>Thank you for registering for our fest! We're excited to have you join us.</p>
      <p>Stay tuned for updates and details.</p>
      <br>
      <p>– The Fest Team</p>
    `
  };

  // Send Email
  try {
    await transporter.sendMail(mailOptions);
    res.send(`<h2>✅ Thank you ${name}! A confirmation email was sent to ${email}.</h2>`);
  } catch (error) {
    console.error(error);
    res.send('❌ Failed to send email. Please try again later.');
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
