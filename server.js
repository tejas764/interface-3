require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');
const Registration = require('./models/Registration');
const nodemailer = require('nodemailer');
const auth = require('basic-auth');

const app = express();
const PORT = process.env.PORT || 3000;

// ======= MongoDB Connection =======
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ======= Multer + Cloudinary Storage =======
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'interface_receipts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type: 'auto'
  }
});
const upload = multer({ storage });

// ======= Middleware =======
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ======= Basic Auth Middleware =======
const adminAuth = (req, res, next) => {
  const user = auth(req);
  const username = process.env.ADMIN_USER || 'admin';
  const password = process.env.ADMIN_PASS || '0000';

  if (user && user.name === username && user.pass === password) {
    return next();
  }

  res.set('WWW-Authenticate', 'Basic realm="Admin Area"');
  return res.status(401).send('<h3>🛑 Unauthorized Access</h3><p>You need to enter valid credentials.</p>');
};

// ======= Routes =======

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/preRegister', adminAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'preRegister.html'));
});
// Registration Form
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Admin Panel (Protected)
app.get('/admin', adminAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Admin Data (Protected)
app.get('/all', adminAuth, async (req, res) => {
  try {
    const allRegistrations = await Registration.find();
    res.json(allRegistrations);
  } catch (err) {
    console.error('❌ Error fetching registrations:', err);
    res.status(500).send('Internal Server Error');
  }
});

// ======= Registration Route =======
app.post('/register', upload.single('receipt'), async (req, res) => {
  try {
    const { name, email, contact, institution, state } = req.body;
    const events = req.body.events;
    const selectedEvents = Array.isArray(events) ? events : events ? [events] : [];

    if (!name || !email || !contact || !institution || !state || !req.file) {
      return res.status(400).send('❌ All fields and receipt upload are required.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).send('❌ Invalid email format.');
    }

    const registration = new Registration({
      name,
      email,
      contact,
      institution,
      state,
      events: selectedEvents,
      receipt: {
        url: req.file.path,
        public_id: req.file.filename
      }
    });

    await registration.save();

    // ======= Send Email =======
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    

    const mailOptions = {
      from: `"Interface Fest Team 👾" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "✅ Fest Registration Confirmation",
      html: `
        <h2>Hi ${name}!</h2>
        <p>🎉 Thank you! Registering for <b>Interface-2025<b>.</p>
        <p><strong>Institution:</strong> ${institution}</p>
        <p><strong>State:</strong> ${state}</p>
        <p><strong>Selected Events:</strong> ${selectedEvents.join(', ')}</p>
        <br/>
        <p>We’ve received your payment receipt and your registration is successful. You’ll receive more details soon!</p>
        <p>For any queiry you can contact our student cordinators through our website</P>
        <p>Regards,<br/>Fest Organizing Committee</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${email}`);

    res.send(`<h2>✅ Thank you ${name}! Your registration has been saved and confirmation email sent to ${email}.</h2>`);

  } catch (err) {
    console.error('❌ Error during registration:', err);
    res.status(500).send('❌ Registration failed.');
  }
});
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contactUs.html'));
});

app.post('/contact', async (req, res) => {
  const { useremail, query, message } = req.body;

  // Validate fields
  if (!useremail) {
    return res.status(400).send('<h3>❌ Message must be at least 15 characters.</h3><a href="/contact">Go Back</a>');
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: useremail,
      to: process.env.EMAIL_USER, // admin receives the message
      subject: `New Query: ${query}`,
      html: `
        <h3>You've received a new message from Interface Contact Form</h3>
        <p><strong>From:</strong> ${useremail}</p>
        <p><strong>Subject:</strong> ${query}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.send('<h3>✅ Your message was sent successfully!</h3><a href="/">Back to Home</a>');
  } catch (err) {
    console.error('❌ Email Error:', err);
    res.status(500).send('<h3>❌ Failed to send message. Try again later.</h3><a href="/contact">Go Back</a>');
  }
});

// ======= Start Server =======
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
